import { ListRecipesResponse, Recipe } from "@/types/recipe";

export async function fetchRecipes(params?: URLSearchParams): Promise<ListRecipesResponse> {
  const url = new URL("/api/recipes", "http://localhost");
  if (params) params.forEach((v, k) => url.searchParams.set(k, v));
  const res = await fetch(`${url.pathname}${url.search}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch recipes: ${res.status}`);
  return res.json();
}

export async function fetchRecipe(id: string): Promise<Recipe> {
  const res = await fetch(`/api/recipes/${encodeURIComponent(id)}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch recipe ${id}: ${res.status}`);
  return res.json();
}

export async function generateShoppingList(recipeIds: string[]) {
  const res = await fetch(`/api/ai/shopping-list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipeIds }),
  });
  if (!res.ok) throw new Error(`Failed to generate shopping list: ${res.status}`);
  return res.json() as Promise<{ items: Array<{ name: string; quantity?: number; unit?: string; notes?: string }>; llm?: boolean }>;
} 