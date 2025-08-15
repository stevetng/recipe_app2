"use client";

import { useMemo, useState } from "react";
import { SortMenu } from "@/components/SortMenu";
import { ShoppingControls } from "@/components/ShoppingControls";
import { useSelection } from "@/components/SelectionProvider";
import { Dialog, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RecipeCard } from "@/components/RecipeCard";
import type { Recipe } from "@/types/recipe";
import { generateShoppingList } from "@/lib/api";

export function RecipesClient({ items }: { items: Recipe[] }) {
  const { selectMode, toggleSelected, isSelected, selected } = useSelection();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<Array<{ name: string; quantity?: number; unit?: string; notes?: string }>>([]);

  const selectedIds = useMemo(() => Array.from(selected), [selected]);

  const onGenerate = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await generateShoppingList(selectedIds);
      setList(res.items || []);
      setOpen(true);
    } catch (e: any) {
      setError(e?.message || "Failed to generate list");
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <SortMenu />
      </div>
      <div className="mt-3">
        <ShoppingControls onGenerate={onGenerate} />
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {items.map((r) => {
          const active = isSelected(r.id);
          const selectionClasses = selectMode
            ? `${active ? 'border-emerald-500/70' : 'border-transparent hover:ring-2 hover:ring-emerald-500/60'} cursor-pointer`
            : 'border-transparent';
          return (
            <div
              key={r.id}
              onClick={() => selectMode && toggleSelected(r.id)}
              className={`rounded-lg border-2 transition-colors duration-150 ${selectionClasses}`}
            >
              <RecipeCard recipe={r} />
            </div>
          );
        })}
      </section>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogHeader>
          <DialogTitle>Generated Grocery List</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="text-sm text-slate-300">Generating...</div>
        ) : error ? (
          <div className="text-sm text-rose-400">{error}</div>
        ) : list.length === 0 ? (
          <div className="text-sm text-slate-300">No items.</div>
        ) : (
          <ul className="text-sm text-slate-200 list-disc pl-6 space-y-1 max-h-80 overflow-auto">
            {list.map((i, idx) => (
              <li key={idx}>
                {i.quantity ? `${i.quantity} ` : ""}{i.unit ? `${i.unit} ` : ""}{i.name}
                {i.notes ? <span className="text-slate-400"> — {i.notes}</span> : null}
              </li>
            ))}
          </ul>
        )}
        <DialogFooter>
          <Button variant="secondary" className="bg-slate-700/70 text-slate-100 border-slate-600 hover:bg-slate-700" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </Dialog>
    </>
  );
} 