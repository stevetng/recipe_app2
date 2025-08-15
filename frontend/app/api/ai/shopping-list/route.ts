import { NextRequest, NextResponse } from "next/server";
import { aggregateIngredients, buildIngredientIndex, getData, maybeNormalizeWithLLM } from "@/lib/recipes-server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { recipeIds = [], pantry = [] } = body || {};
    const data = getData();
    const ingredientIndex = buildIngredientIndex(data.ingredients);
    const selected = data.recipes.filter((r) => recipeIds.includes(r.id));
    if (selected.length === 0) return NextResponse.json({ items: [] });
    let items = aggregateIngredients(selected as any, ingredientIndex);
    const out = await maybeNormalizeWithLLM(items);
    return NextResponse.json(out);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to generate shopping list' }, { status: 500 });
  }
} 