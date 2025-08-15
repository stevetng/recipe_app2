import { NextRequest, NextResponse } from "next/server";
import { aggregateIngredients, buildIngredientIndex, difficultyRank, getData, matchesIngredientsAll, matchesQ, matchesTagsUnion, normalizeRecipe, parseMinutes } from "@/lib/recipes-server";

export async function GET(req: NextRequest) {
  const data = getData();
  const ingredientIndex = buildIngredientIndex(data.ingredients);
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const tags = (searchParams.get("tags") || "").split(",").map(s => s.trim()).filter(Boolean);
  const ingredients = (searchParams.get("ingredients") || "").split(",").map(s => s.trim()).filter(Boolean);
  const sortBy = searchParams.get("sortBy") || "name";
  const sortOrder = searchParams.get("sortOrder") || "asc";
  const limit = parseInt(searchParams.get("limit") || "100", 10) || 100;
  const offset = parseInt(searchParams.get("offset") || "0", 10) || 0;
  const timePreset = searchParams.get("timePreset") || "";
  const difficulty = searchParams.get("difficulty") || "";
  const favoritesOnly = searchParams.get("favoritesOnly") || "0";
  const favorites = (searchParams.get("favorites") || "").split(",").map(s => s.trim()).filter(Boolean);
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
  const paged = pagedRaw.map((r) => normalizeRecipe(r.raw, ingredientIndex));
  return NextResponse.json({ total: filtered.length, items: paged });
} 