import { memo, useMemo } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { DefinitionPageResponse } from "../../../types/definitions";
import { DefinitionRow } from "./DefinitionRow";

type Props = {
  data: DefinitionPageResponse | null;
  loading: boolean;
  error: string | null;
  rangeLabel: string;
  goToPage: (p: number) => void;
};

export const DefinitionsTableSection = memo(function DefinitionsTableSection({
  data,
  loading,
  error,
  rangeLabel,
  goToPage,
}: Props) {
  const tableRows = useMemo(
    () =>
      data?.items.map((row, i) => (
        <DefinitionRow
          key={`${data.page}-${i}-${row.term}-${row.letter_tag}`}
          row={row}
        />
      )),
    [data],
  );

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-[var(--text-muted)] min-h-[1.5rem]">
        <span>{rangeLabel}</span>
        {data && data.total_pages > 1 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={data.page <= 1 || loading}
              onClick={() => goToPage(data.page - 1)}
              className="p-2 rounded-lg border border-[var(--border)] text-[var(--text-main)] hover:bg-[var(--surface-hover)] disabled:opacity-40 disabled:pointer-events-none"
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="tabular-nums px-2 text-[var(--text-main)]">
              Page {data.page} / {data.total_pages}
            </span>
            <button
              type="button"
              disabled={data.page >= data.total_pages || loading}
              onClick={() => goToPage(data.page + 1)}
              className="p-2 rounded-lg border border-[var(--border)] text-[var(--text-main)] hover:bg-[var(--surface-hover)] disabled:opacity-40 disabled:pointer-events-none"
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-400 m-0" role="alert">
          {error}
        </p>
      )}

      <div className="relative rounded-lg border border-[var(--border)] overflow-hidden bg-[var(--bg-card)]">
        {loading && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--bg-card)]/70 backdrop-blur-[2px]"
            aria-busy="true"
            aria-label="Loading"
          >
            <Loader2 className="animate-spin text-[var(--primary)]" size={32} />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="bg-[var(--surface-subtle)] text-[var(--text-muted)] text-[0.65rem] md:text-xs uppercase tracking-wide">
                <th className="py-2.5 px-2 md:px-3 font-semibold">Term</th>
                <th className="py-2.5 px-2 md:px-3 font-semibold">Tag</th>
                <th className="py-2.5 px-2 md:px-3 font-semibold hidden sm:table-cell">
                  Committee
                </th>
                <th className="py-2.5 px-2 md:px-3 font-semibold">
                  Definition
                </th>
              </tr>
            </thead>
            <tbody>{tableRows}</tbody>
          </table>
        </div>
        {!loading && data && data.items.length === 0 && (
          <p className="text-sm text-[var(--text-muted)] p-8 text-center m-0">
            No definitions match your search.
          </p>
        )}
      </div>
    </>
  );
});
