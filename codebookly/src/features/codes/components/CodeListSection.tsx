import { useCallback, useState } from "react";
import { Loader2 } from "lucide-react";
import type { CodeRecord } from "../../../types/codebook";
import CodeCard from "./CodeCard";
import { CodeFullContextModal } from "./CodeFullContextModal";
import { SelectionActionBar } from "./SelectionActionBar";
import type { CodeListSelectionState } from "../hooks/useCodeListSelection";
import { downloadCodesJson } from "../utils/exportCodesJson";
import { downloadEnrichedJson } from "../utils/exportEnrichedJson";
import { fetchEnrichedForExport } from "../utils/fetchEnrichedForExport";

type Props = {
  codes: CodeRecord[];
  /** True while initial shell fetch or a browse navigation (section/chapter/etc.) is in flight */
  loading?: boolean;
  selection: CodeListSelectionState;
};

export function CodeListSection({ codes, loading = false, selection }: Props) {
  const [detailCode, setDetailCode] = useState<string | null>(null);
  const [enrichedDownloadBusy, setEnrichedDownloadBusy] = useState(false);

  const {
    selected,
    selectedCount,
    clear,
    selectAllVisible,
    handleCheckboxClick,
    selectedRecords,
  } = selection;

  const handleOpenDetail = useCallback((code: string) => {
    setDetailCode(code);
  }, []);

  const handleCloseModal = useCallback(() => {
    setDetailCode(null);
  }, []);

  const handleDownloadJson = useCallback(() => {
    if (selectedRecords.length === 0) return;
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCodesJson(selectedRecords, `codebookly-export-${stamp}.json`);
  }, [selectedRecords]);

  const handleDownloadEnrichedJson = useCallback(async () => {
    if (selectedRecords.length === 0) return;
    setEnrichedDownloadBusy(true);
    try {
      const ids = selectedRecords.map((c) => c.code);
      const { enriched, errors } = await fetchEnrichedForExport(ids);
      const stamp = new Date().toISOString().slice(0, 10);
      downloadEnrichedJson(
        enriched,
        `codebookly-enriched-${stamp}.json`,
        errors.length > 0 ? errors : undefined,
      );
    } finally {
      setEnrichedDownloadBusy(false);
    }
  }, [selectedRecords]);

  if (loading) {
    return (
      <div
        className="flex min-h-[12rem] flex-col items-center justify-center gap-3 rounded-xl border border-border-ui bg-card px-6 py-16 text-text-muted"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <Loader2 className="animate-spin text-primary" size={36} aria-hidden />
        <p className="m-0 text-sm font-medium text-text-main">Loading codes…</p>
      </div>
    );
  }

  if (codes.length === 0) return null;

  return (
    <>
      <div className={selectedCount > 0 ? "pb-28 md:pb-24" : undefined}>
        <p className="text-sm text-text-muted m-0 mb-4 max-w-3xl">
          Use checkboxes to select codes.{" "}
          <span className="text-text-main">Ctrl/Cmd+click</span> toggles one
          without clearing others.{" "}
          <span className="text-text-main">Shift+click</span> selects a range
          from the last checkbox you used.{" "}
          <span className="text-text-main">Codes JSON</span> uses the list only;{" "}
          <span className="text-text-main">Enriched JSON</span> loads chapter
          info, standards, designations, and index terms per code (one request
          each).
        </p>

        {/* <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-[80%]"> */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
          {codes.map((code, index) => (
            <CodeCard
              key={code.code}
              code={code}
              index={index}
              selected={selected.has(code.code)}
              onSelectionClick={handleCheckboxClick}
              onOpenDetail={() => handleOpenDetail(code.code)}
            />
          ))}
        </div>
      </div>

      <CodeFullContextModal
        open={detailCode !== null}
        codeId={detailCode}
        onClose={handleCloseModal}
      />

      <SelectionActionBar
        count={selectedCount}
        visibleCount={codes.length}
        onClear={clear}
        onSelectAllVisible={selectAllVisible}
        onDownloadJson={handleDownloadJson}
        onDownloadEnrichedJson={handleDownloadEnrichedJson}
        enrichedDownloadBusy={enrichedDownloadBusy}
      />
    </>
  );
}
