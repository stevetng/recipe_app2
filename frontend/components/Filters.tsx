"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FiltersProps {
  availableTags: string[];
  availableIngredients: string[];
}

const timePresets = ["<15", "15-30", "30-60", ">60"] as const;
const difficulties = ["easy", "medium", "hard"] as const;

export function Filters({ availableTags, availableIngredients }: FiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [open, setOpen] = useState(false);
  const [tagQuery, setTagQuery] = useState("");
  const [ingQuery, setIngQuery] = useState("");

  const selectedTags = useMemo(() => new Set((searchParams.get("tags") || "").split(",").filter(Boolean)), [searchParams]);
  const selectedIngredients = useMemo(() => new Set((searchParams.get("ingredients") || "").split(",").filter(Boolean)), [searchParams]);
  const q = searchParams.get("q") || "";
  const difficulty = searchParams.get("difficulty") || "";
  const preset = searchParams.get("timePreset") || "";

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(searchParams.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    startTransition(() => router.push(`${pathname}?${next.toString()}`));
  }

  function toggleInParamList(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    const parts = (next.get(key) || "").split(",").filter(Boolean);
    const set = new Set(parts);
    if (set.has(value)) set.delete(value); else set.add(value);
    if (set.size === 0) next.delete(key); else next.set(key, Array.from(set).join(","));
    startTransition(() => router.push(`${pathname}?${next.toString()}`));
  }

  const filteredTags = useMemo(() => availableTags.filter(t => t.toLowerCase().includes(tagQuery.toLowerCase())), [availableTags, tagQuery]);
  const filteredIngredients = useMemo(() => availableIngredients.filter(t => t.toLowerCase().includes(ingQuery.toLowerCase())), [availableIngredients, ingQuery]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <input
          className="h-9 w-56 rounded-md border border-slate-700 bg-slate-800/70 px-3 text-sm text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-500"
          placeholder="Search recipes..."
          defaultValue={q}
          onKeyDown={(e) => {
            if (e.key === "Enter") setParam("q", (e.target as HTMLInputElement).value.trim() || null);
          }}
        />
        <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={() => setParam("q", (document.activeElement as HTMLInputElement)?.value || q)}>Search</Button>
      </div>

      <Button variant="secondary" className="bg-slate-700/70 text-slate-100 border-slate-600 hover:bg-slate-700" onClick={() => setOpen(v => !v)} aria-expanded={open}>
        Filters
      </Button>

      {open && (
        <div className="w-full rounded-lg border border-slate-700 bg-slate-900/60 p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="mb-2 text-sm font-medium text-slate-200">Tags</div>
            <input
              className="mb-2 h-8 w-full rounded-md border border-slate-700 bg-slate-800/70 px-2 text-sm text-slate-100 placeholder:text-slate-400"
              placeholder="Filter tags..."
              value={tagQuery}
              onChange={(e) => setTagQuery(e.target.value)}
            />
            <div className="max-h-40 overflow-auto rounded-md border border-slate-700">
              {filteredTags.map((t) => (
                <label key={t} className="flex items-center gap-2 px-2 py-1 text-sm cursor-pointer text-slate-100">
                  <input
                    type="checkbox"
                    className="accent-orange-600"
                    checked={selectedTags.has(t)}
                    onChange={() => toggleInParamList("tags", t)}
                  />
                  <span>{t}</span>
                </label>
              ))}
              {filteredTags.length === 0 && <div className="p-2 text-sm text-slate-400">No tags</div>}
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm font-medium text-slate-200">Ingredients</div>
            <input
              className="mb-2 h-8 w-full rounded-md border border-slate-700 bg-slate-800/70 px-2 text-sm text-slate-100 placeholder:text-slate-400"
              placeholder="Filter ingredients..."
              value={ingQuery}
              onChange={(e) => setIngQuery(e.target.value)}
            />
            <div className="max-h-40 overflow-auto rounded-md border border-slate-700">
              {filteredIngredients.map((t) => (
                <label key={t} className="flex items-center gap-2 px-2 py-1 text-sm cursor-pointer text-slate-100">
                  <input
                    type="checkbox"
                    className="accent-orange-600"
                    checked={selectedIngredients.has(t)}
                    onChange={() => toggleInParamList("ingredients", t)}
                  />
                  <span>{t}</span>
                </label>
              ))}
              {filteredIngredients.length === 0 && <div className="p-2 text-sm text-slate-400">No ingredients</div>}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-2 text-sm font-medium text-slate-200">Difficulty</div>
              <div className="flex flex-wrap gap-2">
                {difficulties.map((d) => (
                  <Button key={d} variant={difficulty === d ? "default" : "secondary"} className={difficulty === d ? "bg-orange-600 hover:bg-orange-700" : "bg-slate-700/70 text-slate-100 border-slate-600 hover:bg-slate-700"} onClick={() => setParam("difficulty", difficulty === d ? null : d)}>
                    {d}
                  </Button>
                ))}
                <Button variant="ghost" className="text-slate-200 hover:bg-slate-800/50" onClick={() => setParam("difficulty", null)}>Clear</Button>
              </div>
            </div>
            <div>
              <div className="mb-2 text-sm font-medium text-slate-200">Time</div>
              <div className="flex flex-wrap gap-2">
                {timePresets.map((p) => (
                  <Button key={p} variant={preset === p ? "default" : "secondary"} className={preset === p ? "bg-orange-600 hover:bg-orange-700" : "bg-slate-700/70 text-slate-100 border-slate-600 hover:bg-slate-700"} onClick={() => setParam("timePreset", preset === p ? null : p)}>
                    {p}
                  </Button>
                ))}
                <Button variant="ghost" className="text-slate-200 hover:bg-slate-800/50" onClick={() => setParam("timePreset", null)}>Clear</Button>
              </div>
            </div>
            <div>
              <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => setOpen(false)} disabled={isPending}>Done</Button>
            </div>
          </div>
        </div>
      )}

      {/* Active chips */}
      <div className="flex flex-wrap gap-2">
        {Array.from(selectedTags).map((t) => (
          <button key={t} className="text-xs rounded-full bg-slate-800 text-slate-100 border border-slate-700 px-2 py-0.5" onClick={() => toggleInParamList("tags", t)}>
            {t} ×
          </button>
        ))}
        {Array.from(selectedIngredients).map((t) => (
          <button key={t} className="text-xs rounded-full bg-slate-800 text-slate-100 border border-slate-700 px-2 py-0.5" onClick={() => toggleInParamList("ingredients", t)}>
            {t} ×
          </button>
        ))}
        {difficulty && (
          <button className="text-xs rounded-full bg-slate-800 text-slate-100 border border-slate-700 px-2 py-0.5" onClick={() => setParam("difficulty", null)}>
            {difficulty} ×
          </button>
        )}
        {preset && (
          <button className="text-xs rounded-full bg-slate-800 text-slate-100 border border-slate-700 px-2 py-0.5" onClick={() => setParam("timePreset", null)}>
            {preset} ×
          </button>
        )}
      </div>
    </div>
  );
} 