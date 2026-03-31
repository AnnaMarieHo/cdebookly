import { memo } from "react";
import type { DefinitionEntry } from "../../../types/definitions";

/** Stacked card for viewports below the table breakpoint (sm). */
export const DefinitionCard = memo(function DefinitionCard({
  row,
}: {
  row: DefinitionEntry;
}) {
  return (
    <article className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2 gap-y-1">
        <h3 className="m-0 text-sm font-semibold text-[var(--text-main)] break-words min-w-0 flex-1">
          {row.term}
        </h3>
        <span className="shrink-0 rounded-md bg-[var(--surface-subtle)] px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--primary)]">
          {row.letter_tag || "—"}
        </span>
      </div>
      {row.committee_designation ? (
        <p className="mt-2 mb-0 text-xs text-[var(--text-muted)] break-words">
          <span className="font-medium text-[var(--text-muted)]">
            Committee:{" "}
          </span>
          {row.committee_designation}
        </p>
      ) : null}
      <p className="mt-2 mb-0 text-sm leading-snug text-[var(--text-main)] break-words">
        {row.definition}
      </p>
    </article>
  );
});

export const DefinitionRow = memo(function DefinitionRow({
  row,
}: {
  row: DefinitionEntry;
}) {
  return (
    <tr className="border-b border-[var(--border)] hover:bg-[var(--surface-hover)]/80 align-top">
      <td className="py-2 px-2 md:py-2.5 md:px-3 text-xs md:text-sm font-semibold text-[var(--text-main)] max-w-[8rem] md:max-w-[12rem]">
        <span className="line-clamp-2 break-words" title={row.term}>
          {row.term}
        </span>
      </td>
      <td className="py-2 px-2 md:py-2.5 md:px-3 text-[0.65rem] md:text-xs text-primary uppercase whitespace-nowrap">
        {row.letter_tag || "—"}
      </td>
      <td className="py-2 px-2 md:py-2.5 md:px-3 text-[0.65rem] md:text-xs text-[var(--text-muted)] max-w-[7rem] md:max-w-[10rem] hidden sm:table-cell">
        <span className="line-clamp-2 break-words" title={row.committee_designation}>
          {row.committee_designation}
        </span>
      </td>
      <td className="py-2 px-2 md:py-2.5 md:px-3 text-xs md:text-sm text-[var(--text-main)] min-w-0">
        <span
          className="line-clamp-3 md:line-clamp-4 leading-snug break-words"
          title={row.definition}
        >
          {row.definition}
        </span>
      </td>
    </tr>
  );
});
