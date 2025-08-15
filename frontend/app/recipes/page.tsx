import { fetchRecipes } from "@/lib/api";
import { Filters } from "@/components/Filters";
import Link from "next/link";
import { SelectionProvider } from "@/components/SelectionProvider";
import { RecipesClient } from "@/components/RecipesClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RecipesPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = new URLSearchParams(Object.entries(await (searchParams || Promise.resolve({}))).flatMap(([k, v]) => v === undefined ? [] : Array.isArray(v) ? v.map(x => [k, x]) : [[k, v]]));
  const data = await fetchRecipes(params);

  // Build available filters from current dataset (lightweight approach for MVP)
  const availableTags = Array.from(new Set(data.items.flatMap((r) => r.tags || []))).sort((a, b) => a.localeCompare(b));
  const availableIngredients = Array.from(new Set(data.items.flatMap((r) => r.ingredients?.map(i => i.ingredientId) || []))).sort((a, b) => a.localeCompare(b));

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-3xl font-bold hover:text-orange-400 transition-colors">
              Recipes
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 space-y-6">
          <div className="flex flex-col gap-4">
            <Filters availableTags={availableTags} availableIngredients={availableIngredients} />
            <SelectionProvider>
              <RecipesClient items={data.items} />
            </SelectionProvider>
          </div>

          <div className="text-slate-400">
            Total: <span className="text-white font-medium">{data.total}</span>
          </div>
        </div>
      </main>
    </div>
  );
} 