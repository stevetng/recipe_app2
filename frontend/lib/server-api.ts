import { headers } from "next/headers";
import { ListRecipesResponse, Recipe } from "@/types/recipe";

function getServerBaseUrl(): string {
  const vercel = process.env.VERCEL_URL; // e.g. my-app.vercel.app
  if (vercel) return `https://${vercel}`;
  const site = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (site) return site.startsWith("http") ? site : `https://${site}`;
  return "http://localhost:3000";
}

async function getServerHeaders(): Promise<HeadersInit | undefined> {
  const h = await headers();
  const cookie = h.get("cookie") || undefined;
  const bypass = h.get("x-vercel-protection-bypass") || undefined;
  const authorization = h.get("authorization") || undefined;
  const out: Record<string, string> = {};
  if (cookie) out["cookie"] = cookie;
  if (bypass) out["x-vercel-protection-bypass"] = bypass as string;
  if (authorization) out["authorization"] = authorization as string;
  return Object.keys(out).length ? out : undefined;
}

export async function fetchRecipes(params?: URLSearchParams): Promise<ListRecipesResponse> {
  const base = getServerBaseUrl();
  const url = new URL("/api/recipes", base);
  if (params) params.forEach((v, k) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { next: { revalidate: 60 }, headers: await getServerHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch recipes: ${res.status}`);
  return res.json();
}

export async function fetchRecipe(id: string): Promise<Recipe> {
  const base = getServerBaseUrl();
  const url = new URL(`/api/recipes/${encodeURIComponent(id)}`, base);
  const res = await fetch(url.toString(), { next: { revalidate: 60 }, headers: await getServerHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch recipe ${id}: ${res.status}`);
  return res.json();
} 