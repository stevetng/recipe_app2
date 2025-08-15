import data from "@/data/data.json";
import { NextRequest } from "next/server";
import type { Recipe, NutritionTotal, Difficulty } from "@/types/recipe";

export type DataShape = typeof data;

export function getData(): DataShape {
  return data as DataShape;
}

export function parseMinutes(text: unknown): number {
  if (!text) return 0;
  const s = String(text).toLowerCase().trim();
  let minutes = 0;
  const hr = s.match(/(\d+(?:\.\d+)?)\s*h(?:our)?s?/);
  const min = s.match(/(\d+(?:\.\d+)?)\s*m(?:in(?:ute)?s?)?/);
  if (hr) minutes += Math.round(parseFloat(hr[1]) * 60);
  if (min) minutes += Math.round(parseFloat(min[1]));
  if (!hr && !min) {
    const bare = s.match(/(\d+(?:\.\d+)?)/);
    if (bare) minutes += Math.round(parseFloat(bare[1]));
  }
  return Number.isFinite(minutes) ? minutes : 0;
}

export function buildIngredientIndex(ingredients: DataShape["ingredients"]) {
  const idx = new Map<string, (typeof data)["ingredients"][number]>();
  for (const ing of ingredients || []) idx.set(ing.id, ing);
  return idx;
}

export function computeNutritionTotal(
  rawRecipe: (typeof data)["recipes"][number],
  ingredientIndex: ReturnType<typeof buildIngredientIndex>
): NutritionTotal {
  const total: NutritionTotal = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  for (const item of rawRecipe.ingredients || []) {
    const meta = ingredientIndex.get(item.ingredientId);
    if (!meta || !meta.nutrition) continue;
    const multiplier = Number.parseFloat(item.amount) || 1;
    (Object.keys(total) as Array<keyof NutritionTotal>).forEach((key) => {
      const n = Number((meta.nutrition as any)[key]);
      if (Number.isFinite(n)) total[key] = Number((total[key] as number) + n * multiplier) as any;
    });
  }
  (Object.keys(total) as Array<keyof NutritionTotal>).forEach((key) => {
    total[key] = Math.round((total[key] as number) * 10) / 10 as any;
  });
  return total;
}

export function normalizeRecipe(
  raw: (typeof data)["recipes"][number],
  ingredientIndex: ReturnType<typeof buildIngredientIndex>
): Recipe {
  const prep = parseMinutes(raw.prepTime);
  const cook = parseMinutes(raw.cookTime);
  return {
    id: raw.id,
    name: raw.title,
    description: raw.description,
    servings: raw.servings,
    prepTimeMinutes: prep,
    cookTimeMinutes: cook,
    difficulty: raw.difficulty as Difficulty,
    tags: raw.tags || [],
    ingredients: raw.ingredients || [],
    instructions: raw.instructions || [],
    nutritionTotal: computeNutritionTotal(raw, ingredientIndex),
  };
}

export const difficultyRank = (d?: string) => (d === "easy" ? 1 : d === "medium" ? 2 : d === "hard" ? 3 : 99);

export function matchesQ(recipe: { name?: string; description?: string }, q?: string) {
  if (!q) return true;
  const s = q.toLowerCase();
  return (
    recipe.name?.toLowerCase().includes(s) || recipe.description?.toLowerCase().includes(s)
  );
}

export function matchesTagsUnion(recipe: { tags?: string[] }, tags?: string[]) {
  if (!tags || tags.length === 0) return true;
  const set = new Set((recipe.tags || []).map((t) => String(t).toLowerCase()));
  return tags.some((t) => set.has(String(t).toLowerCase()));
}

export function matchesIngredientsAll(
  rawRecipe: (typeof data)["recipes"][number],
  requested: string[] | undefined,
  ingredientIndex: ReturnType<typeof buildIngredientIndex>
) {
  if (!requested || requested.length === 0) return true;
  const haveIds = new Set((rawRecipe.ingredients || []).map((i) => i.ingredientId));
  const nameToId = new Map<string, string>();
  for (const [id, meta] of ingredientIndex.entries()) nameToId.set(meta.name.toLowerCase(), id);
  return requested.every((q) => {
    const norm = String(q).toLowerCase().trim();
    const id = haveIds.has(norm) ? norm : nameToId.get(norm);
    return id ? haveIds.has(id) : false;
  });
}

export function aggregateIngredients(
  recipes: (typeof data)["recipes"],
  ingredientIndex: ReturnType<typeof buildIngredientIndex>
) {
  const map = new Map<string, { name: string; quantity: number; unitSet: Set<string> }>();
  for (const r of recipes) {
    for (const item of r.ingredients || []) {
      const id = item.ingredientId;
      const qty = parseFloat(item.amount) || 0;
      const unit = item.unit || "";
      const meta = ingredientIndex.get(id);
      const name = meta?.name || id;
      if (!map.has(id)) {
        map.set(id, { name, quantity: 0, unitSet: new Set() });
      }
      const rec = map.get(id)!;
      rec.quantity += qty;
      rec.unitSet.add(unit);
    }
  }
  const items: Array<{ name: string; quantity: number; unit: string; notes?: string }> = [];
  for (const { name, quantity, unitSet } of map.values()) {
    const unit = unitSet.size === 1 ? Array.from(unitSet)[0] : "";
    const notes = unitSet.size > 1 ? `Multiple units used: ${Array.from(unitSet).join(', ')}` : undefined;
    items.push({ name, quantity: Math.round(quantity * 100) / 100, unit, notes });
  }
  items.sort((a, b) => a.name.localeCompare(b.name));
  return items;
}

export async function maybeNormalizeWithLLM(items: Array<{ name: string; quantity?: number; unit?: string; notes?: string }>) {
  if (!process.env.OPENAI_API_KEY) return { items, llm: false } as const;
  try {
    const { OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const input = items.map((i) => `${i.quantity || ''} ${i.unit || ''} ${i.name}`.trim()).join('\n');
    const prompt = `You are helping generate a concise grocery list. Merge lines that refer to the same item, normalize units when possible, and output JSON array of items with { name, quantity, unit, notes? }.\nLines:\n${input}`;
    const resp = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You return only valid JSON." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    });
    const content = resp.choices?.[0]?.message?.content || "[]";
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) return { items: parsed, llm: true } as const;
    return { items, llm: false } as const;
  } catch (e) {
    console.error("LLM normalization failed:", (e as any)?.message || e);
    return { items, llm: false } as const;
  }
}

export function listRecipes(params: URLSearchParams) {
  const data = getData();
  const ingredientIndex = buildIngredientIndex(data.ingredients);
  const q = params.get("q") || "";
  const tags = (params.get("tags") || "").split(",").map(s => s.trim()).filter(Boolean);
  const ingredients = (params.get("ingredients") || "").split(",").map(s => s.trim()).filter(Boolean);
  const sortBy = params.get("sortBy") || "name";
  const sortOrder = params.get("sortOrder") || "asc";
  const limit = parseInt(params.get("limit") || "100", 10) || 100;
  const offset = parseInt(params.get("offset") || "0", 10) || 0;
  const timePreset = params.get("timePreset") || "";
  const difficulty = params.get("difficulty") || "";
  const favoritesOnly = params.get("favoritesOnly") || "0";
  const favorites = (params.get("favorites") || "").split(",").map(s => s.trim()).filter(Boolean);
  const favoriteIds = new Set(favorites);

  const filtered: Array<{ raw: (typeof data)["recipes"][number]; name: string; prep: number; cook: number; difficulty?: string }>= [];
  for (const raw of data.recipes) {
    const name = raw.title || "";
    const description = raw.description || "";
    const prep = parseMinutes(raw.prepTime);
    const cook = parseMinutes(raw.cookTime);
    const recLite = { name, description, tags: raw.tags || [], difficulty: raw.difficulty };
    if (!matchesQ(recLite, q)) continue;
    if (!matchesTagsUnion(recLite, tags)) continue;
    if (!matchesIngredientsAll(raw, ingredients, ingredientIndex)) continue;
    if (difficulty && recLite.difficulty !== String(difficulty).toLowerCase()) continue;
    if (timePreset) {
      const total = (prep || 0) + (cook || 0);
      if (timePreset === '<15' && !(total < 15)) continue;
      if (timePreset === '15-30' && !(total >= 15 && total <= 30)) continue;
      if (timePreset === '30-60' && !(total > 30 && total <= 60)) continue;
      if (timePreset === '>60' && !(total > 60)) continue;
    }
    if (String(favoritesOnly) === '1') {
      if (favoriteIds.size === 0) continue;
      if (!favoriteIds.has(raw.id)) continue;
    }
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

  const start = Math.max(0, offset);
  const end = start + limit;
  const pagedRaw = filtered.slice(start, end);
  const items: Recipe[] = pagedRaw.map((r) => normalizeRecipe(r.raw, ingredientIndex));
  return { total: filtered.length, items };
}

export function getRecipeNormalized(id: string) {
  const data = getData();
  const ingredientIndex = buildIngredientIndex(data.ingredients);
  const raw = data.recipes.find((r) => r.id === id);
  if (!raw) return null;
  return normalizeRecipe(raw, ingredientIndex);
} 