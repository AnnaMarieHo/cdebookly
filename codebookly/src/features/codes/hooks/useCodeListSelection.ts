import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CodeRecord } from "../../../types/codebook";

export function useCodeListSelection(items: CodeRecord[]) {
  const orderedIds = useMemo(() => items.map((c) => c.code), [items]);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const lastIndexRef = useRef<number | null>(null);

  useEffect(() => {
    setSelected(new Set());
    lastIndexRef.current = null;
  }, [items]);

  const clear = useCallback(() => {
    setSelected(new Set());
    lastIndexRef.current = null;
  }, []);

  const selectAllVisible = useCallback(() => {
    setSelected(new Set(orderedIds));
    lastIndexRef.current = orderedIds.length > 0 ? orderedIds.length - 1 : null;
  }, [orderedIds]);

  const handleCheckboxClick = useCallback(
    (e: React.MouseEvent<HTMLInputElement>, index: number, id: string) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.shiftKey && lastIndexRef.current !== null) {
        const a = Math.min(lastIndexRef.current, index);
        const b = Math.max(lastIndexRef.current, index);
        const range = orderedIds.slice(a, b + 1);
        setSelected((prev) => {
          const next = new Set(prev);
          for (const rid of range) next.add(rid);
          return next;
        });
        lastIndexRef.current = index;
        return;
      }

      if (e.metaKey || e.ctrlKey) {
        setSelected((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
        lastIndexRef.current = index;
        return;
      }

      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      lastIndexRef.current = index;
    },
    [orderedIds],
  );

  const selectedRecords = useMemo(
    () => items.filter((row) => selected.has(row.code)),
    [items, selected],
  );

  return {
    selected,
    selectedCount: selected.size,
    clear,
    selectAllVisible,
    handleCheckboxClick,
    selectedRecords,
  };
}
