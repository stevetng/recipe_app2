import data from "@/data/data.json";
import { NextRequest } from "next/server";

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
) {
  const total = { calories: 0, protein: 0, carbs: 0, fat: 0 } as Record<string, number>;
  for (const item of rawRecipe.ingredients || []) {
    const meta = ingredientIndex.get(item.ingredientId);
    if (!meta || !meta.nutrition) continue;
    const multiplier = Number.parseFloat(item.amount) || 1;
    for (const key of Object.keys(total)) {
      const n = Number((meta.nutrition as any)[key]);
      if (!Number.isFinite(n)) continue;
      total[key] += n * multiplier;
    }
  }
  for (const key of Object.keys(total)) total[key] = Math.round(total[key] * 10) / 10;
  return total;
}

export function normalizeRecipe(
  raw: (typeof data)["recipes"][number],
  ingredientIndex: ReturnType<typeof buildIngredientIndex>
) {
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