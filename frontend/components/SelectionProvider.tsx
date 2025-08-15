"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type SelectionContextValue = {
  selected: Set<string>;
  isSelected: (id: string) => boolean;
  toggleSelected: (id: string) => void;
  clearSelected: () => void;
  selectedCount: number;
  selectMode: boolean;
  setSelectMode: (on: boolean) => void;
};

const SelectionContext = createContext<SelectionContextValue | undefined>(undefined);
const STORAGE_KEY = "selection:recipeIds";

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSelected(new Set((JSON.parse(raw) as string[]).filter(Boolean)));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(selected)));
    } catch {}
  }, [selected]);

  const isSelected = useCallback((id: string) => selected.has(id), [selected]);
  const toggleSelected = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);
  const clearSelected = useCallback(() => setSelected(new Set()), []);

  const value = useMemo(
    () => ({ selected, isSelected, toggleSelected, clearSelected, selectedCount: selected.size, selectMode, setSelectMode }),
    [selected, isSelected, toggleSelected, clearSelected, selectMode]
  );

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error("useSelection must be used within SelectionProvider");
  return ctx;
} 