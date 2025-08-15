"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/components/FavoritesProvider";
import { cn } from "@/lib/utils";

export function FavoriteButton({ id }: { id: string }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(id);
  return (
    <button
      aria-label={active ? "Unfavorite" : "Favorite"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(id);
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-full border p-2 transition-colors",
        active
          ? "bg-rose-600/20 text-rose-400 border-rose-500/30 hover:bg-rose-600/30"
          : "bg-slate-800/50 text-slate-200 border-slate-600 hover:bg-slate-700/50"
      )}
    >
      <Heart className={cn("w-4 h-4", active && "fill-current")} />
    </button>
  );
} 