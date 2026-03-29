import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { definitionsBrowse } from "../services/definitionsBrowse";
import type { DefinitionPageResponse } from "../../../types/definitions";

const PAGE_SIZE = 24;

export function useDefinitionsBrowse() {
  const [appliedQ, setAppliedQ] = useState("");
  const [data, setData] = useState<DefinitionPageResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportBusy, setExportBusy] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const loadPage = useCallback(async (targetPage: number, q: string) => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setError(null);
    try {
      const res = await definitionsBrowse.fetchPage(
        {
          page: targetPage,
          page_size: PAGE_SIZE,
          q: q || undefined,
        },
        ac.signal
      );
      if (ac.signal.aborted) return;
      setData(res);
      setAppliedQ(q);
    } catch (err) {
      if (
        ac.signal.aborted ||
        axios.isCancel(err) ||
        (axios.isAxiosError(err) && err.code === "ERR_CANCELED")
      ) {
        return;
      }
      setError(
        err instanceof Error ? err.message : "Failed to load definitions"
      );
      setData(null);
    } finally {
      if (!ac.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPage(1, "");
  }, [loadPage]);

  const runSearch = useCallback(
    (q: string) => {
      void loadPage(1, q.trim());
    },
    [loadPage]
  );

  const goToPage = useCallback(
    (nextPage: number) => {
      if (!data || nextPage < 1 || nextPage > data.total_pages) return;
      void loadPage(nextPage, appliedQ);
    },
    [data, appliedQ, loadPage]
  );

  const exportJson = useCallback(async () => {
    setExportBusy(true);
    try {
      await definitionsBrowse.downloadExport({
        q: appliedQ || undefined,
      });
    } finally {
      setExportBusy(false);
    }
  }, [appliedQ]);

  const rangeLabel = useMemo(() => {
    if (!data) return loading ? "Loading…" : "";
    if (data.total === 0) return "No results";
    const start = (data.page - 1) * data.page_size + 1;
    const end = Math.min(data.page * data.page_size, data.total);
    return `${start}–${end} of ${data.total}`;
  }, [data, loading]);

  return {
    data,
    loading,
    error,
    exportBusy,
    runSearch,
    goToPage,
    exportJson,
    rangeLabel,
    hasResults: data != null,
  };
}
