"use client";

import { Button } from "@/components/ui/button";
import { useSelection } from "@/components/SelectionProvider";

export function ShoppingControls({ onGenerate }: { onGenerate: () => void }) {
  const { selectMode, setSelectMode, selectedCount, clearSelected } = useSelection();
  return (
    <div className="flex items-center gap-3">
      <Button
        variant={selectMode ? "default" : "secondary"}
        className={selectMode ? "bg-orange-600 hover:bg-orange-700" : "bg-slate-700/70 text-slate-100 border-slate-600 hover:bg-slate-700"}
        onClick={() => setSelectMode(!selectMode)}
      >
        Grocery list
      </Button>
      <Button
        variant="outline"
        className="border-slate-600 text-slate-200 hover:bg-slate-800/50"
        onClick={onGenerate}
        disabled={!selectMode || selectedCount === 0}
      >
        Generate
      </Button>
      {selectMode && selectedCount > 0 && (
        <Button variant="ghost" className="text-slate-200 hover:bg-slate-800/50" onClick={clearSelected}>Clear ({selectedCount})</Button>
      )}
      {selectMode && selectedCount === 0 && (
        <span className="text-sm text-slate-400">Select recipes to shop for</span>
      )}
    </div>
  );
} 