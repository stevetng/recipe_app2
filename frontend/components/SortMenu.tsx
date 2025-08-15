"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/components/FavoritesProvider";

const sorts = [
  { key: "name", label: "Name" },
  { key: "prepTimeMinutes", label: "Prep time" },
  { key: "cookTimeMinutes", label: "Cook time" },
  { key: "difficulty", label: "Difficulty" },
] as const;

export function SortMenu() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { favoritesCsv } = useFavorites();

  const sortBy = searchParams.get("sortBy") || "name";
  const sortOrder = searchParams.get("sortOrder") || "asc";
  const favoritesOnly = searchParams.get("favoritesOnly") === "1";

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(searchParams.toString());
    if (!value) next.delete(key); else next.set(key, value);
    router.push(`${pathname}?${next.toString()}`);
  }

  function toggleFavoritesOnly() {
    const next = new URLSearchParams(searchParams.toString());
    const nextVal = favoritesOnly ? null : "1";
    if (!nextVal) next.delete("favoritesOnly"); else next.set("favoritesOnly", nextVal);
    if (!favoritesOnly && favoritesCsv) next.set("favorites", favoritesCsv); else next.delete("favorites");
    router.push(`${pathname}?${next.toString()}`);
  }

  // Keep favorites param in sync while viewing favoritesOnly so unfavoriting hides immediately
  useEffect(() => {
    if (!favoritesOnly) return;
    const next = new URLSearchParams(searchParams.toString());
    if (favoritesCsv) next.set("favorites", favoritesCsv); else next.delete("favorites");
    router.replace(`${pathname}?${next.toString()}`);
  }, [favoritesCsv, favoritesOnly, pathname, router, searchParams]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-300">Sort by</span>
      {sorts.map((s) => (
        <Button key={s.key} variant={sortBy === s.key ? "default" : "secondary"} className={sortBy === s.key ? "bg-orange-600 hover:bg-orange-700" : "bg-slate-700/70 text-slate-100 border-slate-600 hover:bg-slate-700"} onClick={() => setParam("sortBy", s.key)}>
          {s.label}
        </Button>
      ))}
      <Button variant={favoritesOnly ? "default" : "secondary"} className={favoritesOnly ? "bg-orange-600 hover:bg-orange-700" : "bg-slate-700/70 text-slate-100 border-slate-600 hover:bg-slate-700"} onClick={toggleFavoritesOnly}>
        Favorites
      </Button>
      <Button variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-800/50" onClick={() => setParam("sortOrder", sortOrder === "asc" ? "desc" : "asc")}>
        {sortOrder === "asc" ? "Asc" : "Desc"}
      </Button>
    </div>
  );
} 