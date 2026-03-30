import { Download, Layers, Loader2 } from "lucide-react";

type Props = {
  count: number;
  onClear: () => void;
  onSelectAllVisible: () => void;
  onDownloadJson: () => void;
  onDownloadEnrichedJson: () => void;
  enrichedDownloadBusy: boolean;
  visibleCount: number;
};

export function SelectionActionBar({
  count,
  onClear,
  onSelectAllVisible,
  onDownloadJson,
  onDownloadEnrichedJson,
  enrichedDownloadBusy,
  visibleCount,
}: Props) {
  if (count === 0) return null;

  return (
    <div
      className="fixed bottom-0 right-0 z-40 border-t border-[var(--border)] bg-[var(--bg-card)]/95 backdrop-blur-sm px-4 py-3 shadow-lg left-20 md:left-72"
      role="region"
      aria-label="Selection actions"
    >
      <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--text-main)] m-0">
          <span className="font-semibold tabular-nums">{count}</span> selected
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onSelectAllVisible}
            disabled={visibleCount === 0}
            className="text-sm font-medium rounded-lg px-3 py-2 border border-[var(--border)] text-[var(--text-main)] hover:bg-[var(--surface-hover)] disabled:opacity-40 disabled:pointer-events-none"
          >
            Select all visible
          </button>
          <button
            type="button"
            onClick={onClear}
            className="text-sm font-medium rounded-lg px-3 py-2 border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-hover)]"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onDownloadJson}
            className="inline-flex items-center gap-2 text-sm font-semibold rounded-lg px-4 py-2 bg-[var(--primary)] text-white hover:opacity-90"
          >
            <Download size={16} aria-hidden />
            Codes JSON
          </button>
          <button
            type="button"
            onClick={onDownloadEnrichedJson}
            disabled={enrichedDownloadBusy}
            className="inline-flex items-center gap-2 text-sm font-semibold rounded-lg px-4 py-2 border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--surface-hover)]/50 disabled:opacity-50 disabled:pointer-events-none"
          >
            {enrichedDownloadBusy ? (
              <Loader2 size={16} className="animate-spin" aria-hidden />
            ) : (
              <Layers size={16} aria-hidden />
            )}
            {enrichedDownloadBusy ? "Fetching…" : "Enriched JSON"}
          </button>
        </div>
      </div>
    </div>
  );
}
