const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { OpenAI } = require('openai');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Read data file
const getData = async () => {
	const data = await fs.readFile(path.join(__dirname, '../db/data.json'), 'utf8');
	return JSON.parse(data);
};

// Helpers
const parseMinutes = (text) => {
	if (!text) return 0;
	const s = String(text).toLowerCase().trim();
	let minutes = 0;
	// Support patterns like: "15 min", "15 minutes", "1h", "1 hr", "1 hour 30 min"
	const hr = s.match(/(\d+(?:\.\d+)?)\s*h(?:our)?s?/);
	const min = s.match(/(\d+(?:\.\d+)?)\s*m(?:in(?:ute)?s?)?/);
	if (hr) minutes += Math.round(parseFloat(hr[1]) * 60);
	if (min) minutes += Math.round(parseFloat(min[1]));
	// Fallback: bare number treated as minutes
	if (!hr && !min) {
		const bare = s.match(/(\d+(?:\.\d+)?)/);
		if (bare) minutes += Math.round(parseFloat(bare[1]));
	}
	return Number.isFinite(minutes) ? minutes : 0;
};

const buildIngredientIndex = (ingredients) => {
	const idx = new Map();
	for (const ing of ingredients || []) idx.set(ing.id, ing);
	return idx;
};

const computeNutritionTotal = (recipe, ingredientIndex) => {
	const total = { calories: 0, protein: 0, carbs: 0, fat: 0 };
	for (const item of recipe.ingredients || []) {
		const meta = ingredientIndex.get(item.ingredientId);
		if (!meta || !meta.nutrition) continue;
		const multiplier = Number.parseFloat(item.amount) || 1;
		for (const key of Object.keys(total)) {
			const n = Number(meta.nutrition[key]);
			if (!Number.isFinite(n)) continue;
			total[key] += n * multiplier;
		}
	}
	// Round to one decimal for readability
	for (const key of Object.keys(total)) total[key] = Math.round(total[key] * 10) / 10;
	return total;
};

const normalizeRecipe = (raw, ingredientIndex) => {
	const prep = parseMinutes(raw.prepTime);
	const cook = parseMinutes(raw.cookTime);
	return {
		id: raw.id,
		name: raw.title,
		description: raw.description,
		servings: raw.servings,
		prepTimeMinutes: prep,
		cookTimeMinutes: cook,
		difficulty: raw.difficulty,
		tags: raw.tags || [],
		ingredients: raw.ingredients || [],
		instructions: raw.instructions || [],
		nutritionTotal: computeNutritionTotal(raw, ingredientIndex),
	};
};

const difficultyRank = (d) => (d === 'easy' ? 1 : d === 'medium' ? 2 : d === 'hard' ? 3 : 99);

const matchesQ = (recipe, q) => {
	if (!q) return true;
	const s = q.toLowerCase();
	return (
		recipe.name?.toLowerCase().includes(s) ||
		recipe.description?.toLowerCase().includes(s)
	);
};

const matchesTagsUnion = (recipe, tags) => {
	if (!tags || tags.length === 0) return true;
	const set = new Set((recipe.tags || []).map((t) => String(t).toLowerCase()));
	return tags.some((t) => set.has(String(t).toLowerCase()));
};

const matchesIngredientsAll = (rawRecipe, requested, ingredientIndex) => {
	if (!requested || requested.length === 0) return true;
	const haveIds = new Set((rawRecipe.ingredients || []).map((i) => i.ingredientId));
	// Also allow matching by ingredient name (case-insensitive)
	const nameToId = new Map();
	for (const [id, meta] of ingredientIndex.entries()) nameToId.set(meta.name.toLowerCase(), id);
	return requested.every((q) => {
		const norm = String(q).toLowerCase().trim();
		const id = haveIds.has(norm) ? norm : nameToId.get(norm);
		return id ? haveIds.has(id) : false;
	});
};

// Aggregate ingredients across multiple recipes
const aggregateIngredients = (recipes, ingredientIndex) => {
	const map = new Map(); // key: ingredientId, value: { name, unitSet: Set, quantity: number }
	for (const r of recipes) {
		for (const item of r.ingredients || []) {
			const id = item.ingredientId;
			const qty = parseFloat(item.amount) || 0;
			const unit = item.unit || '';
			const meta = ingredientIndex.get(id);
			const name = meta?.name || id;
			if (!map.has(id)) {
				map.set(id, { name, quantity: 0, unitSet: new Set() });
			}
			const rec = map.get(id);
			rec.quantity += qty;
			rec.unitSet.add(unit);
		}
	}
	const items = [];
	for (const { name, quantity, unitSet } of map.values()) {
		const unit = unitSet.size === 1 ? Array.from(unitSet)[0] : '';
		const notes = unitSet.size > 1 ? `Multiple units used: ${Array.from(unitSet).join(', ')}` : undefined;
		items.push({ name, quantity: Math.round(quantity * 100) / 100, unit, notes });
	}
	// sort for readability
	items.sort((a, b) => a.name.localeCompare(b.name));
	return items;
};

// Optional: normalize/merge using OpenAI for nicer shopping list text
const maybeNormalizeWithLLM = async (items) => {
	if (!process.env.OPENAI_API_KEY) return { items, llm: false };
	try {
		const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
		const input = items.map((i) => `${i.quantity || ''} ${i.unit || ''} ${i.name}`.trim()).join('\n');
		const prompt = `You are helping generate a concise grocery list. Merge lines that refer to the same item, normalize units when possible, and output JSON array of items with { name, quantity, unit, notes? }.\nLines:\n${input}`;
		const resp = await client.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				{ role: 'system', content: 'You return only valid JSON.' },
				{ role: 'user', content: prompt },
			],
			temperature: 0.2,
		});
		const content = resp.choices?.[0]?.message?.content || '[]';
		const parsed = JSON.parse(content);
		if (Array.isArray(parsed)) return { items: parsed, llm: true };
		return { items, llm: false };
	} catch (e) {
		console.error('LLM normalization failed:', e.message);
		return { items, llm: false };
	}
};

// POST /ai/shopping-list
app.post('/ai/shopping-list', async (req, res) => {
	try {
		const { recipeIds = [], pantry = [] } = req.body || {};
		const data = await getData();
		const ingredientIndex = buildIngredientIndex(data.ingredients);
		const selected = data.recipes.filter((r) => recipeIds.includes(r.id));
		if (selected.length === 0) return res.json({ items: [] });
		let items = aggregateIngredients(selected, ingredientIndex);
		// TODO: subtract pantry quantities in future iteration
		const out = await maybeNormalizeWithLLM(items);
		return res.json(out);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Failed to generate shopping list' });
	}
});

// GET /recipes with filtering and sorting
app.get('/recipes', async (req, res) => {
	try {
		const data = await getData();
		const ingredientIndex = buildIngredientIndex(data.ingredients);
		const {
			q = '',
			tags = '',
			ingredients = '',
			sortBy = 'name',
			sortOrder = 'asc',
			limit = '100',
			offset = '0',
			timePreset = '', // optional: <15, 15-30, 30-60, >60
			difficulty = '',
			favoritesOnly = '0',
			favorites = '',
		} = req.query;

		const tagList = String(tags)
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
		const ingList = String(ingredients)
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
		const favoriteIds = new Set(
			String(favorites)
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean)
		);

		// Efficient filtering on raw data; normalize only the paged results
		const filtered = [];
		for (let idx = 0; idx < data.recipes.length; idx++) {
			const raw = data.recipes[idx];
			const name = raw.title || '';
			const description = raw.description || '';
			const prep = parseMinutes(raw.prepTime);
			const cook = parseMinutes(raw.cookTime);
			const recLite = { name, description, tags: raw.tags || [], difficulty: raw.difficulty };
			if (!matchesQ(recLite, q)) continue;
			if (!matchesTagsUnion(recLite, tagList)) continue;
			if (!matchesIngredientsAll(raw, ingList, ingredientIndex)) continue;
			if (difficulty && recLite.difficulty !== String(difficulty).toLowerCase()) continue;
			if (timePreset) {
				const total = (prep || 0) + (cook || 0);
				if (timePreset === '<15' && !(total < 15)) continue;
				if (timePreset === '15-30' && !(total >= 15 && total <= 30)) continue;
				if (timePreset === '30-60' && !(total > 30 && total <= 60)) continue;
				if (timePreset === '>60' && !(total > 60)) continue;
			}
			if (String(favoritesOnly) === '1' && favoriteIds.size > 0 && !favoriteIds.has(raw.id)) continue;
			filtered.push({ raw, name, prep, cook, difficulty: recLite.difficulty });
		}

		filtered.sort((a, b) => {
			let cmp = 0;
			if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
			else if (sortBy === 'prepTimeMinutes') cmp = (a.prep || 0) - (b.prep || 0);
			else if (sortBy === 'cookTimeMinutes') cmp = (a.cook || 0) - (b.cook || 0);
			else if (sortBy === 'difficulty') cmp = difficultyRank(a.difficulty) - difficultyRank(b.difficulty);
			return sortOrder === 'desc' ? -cmp : cmp;
		});

		const start = Math.max(0, parseInt(offset, 10) || 0);
		const end = start + (parseInt(limit, 10) || 100);
		const pagedRaw = filtered.slice(start, end);
		const paged = pagedRaw.map((r) => normalizeRecipe(r.raw, ingredientIndex));

		res.json({ total: filtered.length, items: paged });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Failed to fetch recipes' });
	}
});

// GET /recipes/:id
app.get('/recipes/:id', async (req, res) => {
	try {
		const data = await getData();
		const ingredientIndex = buildIngredientIndex(data.ingredients);
		const raw = data.recipes.find((r) => r.id === req.params.id);
		if (!raw) return res.status(404).json({ error: 'Recipe not found' });
		const normalized = normalizeRecipe(raw, ingredientIndex);
		res.json(normalized);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Failed to fetch recipe' });
	}
});

// // Backwards-compatible endpoint
// app.get('/api/recipes', async (req, res) => {
// 	try {
// 		const data = await getData();
// 		const ingredientIndex = buildIngredientIndex(data.ingredients);
// 		const normalized = data.recipes.map((r) => normalizeRecipe(r, ingredientIndex));
// 		res.json(normalized);
// 	} catch (error) {
// 		res.status(500).json({ error: 'Failed to fetch recipes' });
// 	}
// });

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});