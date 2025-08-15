import { ListRecipesResponse, Recipe } from "@/types/recipe";

function getServerBaseUrl(): string {
  if (typeof window !== "undefined") return ""; // client can use relative
  const vercel = process.env.VERCEL_URL; // e.g. my-app.vercel.app
  if (vercel) return `https://${vercel}`;
  const site = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (site) return site.startsWith("http") ? site : `https://${site}`;
  return "http://localhost:3000";
}

export async function fetchRecipes(params?: URLSearchParams): Promise<ListRecipesResponse> {
  const base = getServerBaseUrl();
  const url = new URL("/api/recipes", base);
  if (params) params.forEach((v, k) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch recipes: ${res.status}`);
  return res.json();
}

export async function fetchRecipe(id: string): Promise<Recipe> {
  const base = getServerBaseUrl();
  const url = new URL(`/api/recipes/${encodeURIComponent(id)}`, base);
  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch recipe ${id}: ${res.status}`);
  return res.json();
}

export async function generateShoppingList(recipeIds: string[]) {
  const base = getServerBaseUrl();
  const url = new URL(`/api/ai/shopping-list`, base);
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipeIds }),
  });
  if (!res.ok) throw new Error(`Failed to generate shopping list: ${res.status}`);
  return res.json() as Promise<{ items: Array<{ name: string; quantity?: number; unit?: string; notes?: string }>; llm?: boolean }>;
} 