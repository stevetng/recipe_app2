import { NextRequest, NextResponse } from "next/server";
import { buildIngredientIndex, getData, normalizeRecipe } from "@/lib/recipes-server";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const data = getData();
  const ingredientIndex = buildIngredientIndex(data.ingredients);
  const raw = data.recipes.find((r) => r.id === id);
  if (!raw) return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
  const normalized = normalizeRecipe(raw, ingredientIndex);
  return NextResponse.json(normalized);
} 