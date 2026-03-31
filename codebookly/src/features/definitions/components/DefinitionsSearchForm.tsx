import { memo, useState } from "react";
import { Download, Loader2, Search } from "lucide-react";

type Props = {
  onSearch: (query: string) => void;
  loading: boolean;
  exportBusy: boolean;
  hasResults: boolean;
  onExport: () => void;
};

export const DefinitionsSearchForm = memo(function DefinitionsSearchForm({
  onSearch,
  loading,
  exportBusy,
  hasResults,
  onExport,
}: Props) {
  const [draft, setDraft] = useState("");

  return (
    <form
      className="flex flex-col sm:flex-row sm:items-end gap-3 p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-card)]"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(draft);
      }}
    >
      <div className="flex-1 min-w-0 relative">
        <label htmlFor="def-search" className="sr-only">
          Search definitions
        </label>
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
          size={18}
          aria-hidden
        />
        <input
          id="def-search"
          type="search"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Search terms, definitions, committee text…"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] pl-10 pr-3 py-2.5 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          autoComplete="off"
        />
      </div>
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 shrink-0 w-full sm:w-auto">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full sm:w-auto flex-1 sm:flex-initial justify-center items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--surface-hover)]/50 disabled:opacity-50 disabled:pointer-events-none min-h-[44px]"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" aria-hidden />
          ) : (
            <Search size={16} aria-hidden />
          )}
          Search
        </button>
        <button
          type="button"
          onClick={() => void onExport()}
          disabled={exportBusy || loading || !hasResults}
          className="inline-flex w-full sm:w-auto flex-1 sm:flex-initial justify-center items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold bg-[var(--primary)] text-white hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none min-h-[44px]"
        >
          {exportBusy ? (
            <Loader2 size={16} className="animate-spin" aria-hidden />
          ) : (
            <Download size={16} aria-hidden />
          )}
          Download JSON
        </button>
      </div>
    </form>
  );
});
