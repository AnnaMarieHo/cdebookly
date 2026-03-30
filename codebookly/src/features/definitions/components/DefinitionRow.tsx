import { memo } from "react";
import type { DefinitionEntry } from "../../../types/definitions";

export const DefinitionRow = memo(function DefinitionRow({
  row,
}: {
  row: DefinitionEntry;
}) {
  return (
    <tr className="border-b border-[var(--border)] hover:bg-[var(--surface-hover)]/80 align-top">
      <td className="py-2 px-2 md:py-2.5 md:px-3 text-xs md:text-sm font-semibold text-[var(--text-main)] max-w-[8rem] md:max-w-[12rem]">
        <span className="line-clamp-2" title={row.term}>
          {row.term}
        </span>
      </td>
      <td className="py-2 px-2 md:py-2.5 md:px-3 text-[0.65rem] md:text-xs text-primary uppercase whitespace-nowrap">
        {row.letter_tag || "—"}
      </td>
      <td className="py-2 px-2 md:py-2.5 md:px-3 text-[0.65rem] md:text-xs text-[var(--text-muted)] max-w-[7rem] md:max-w-[10rem] hidden sm:table-cell">
        <span className="line-clamp-2" title={row.committee_designation}>
          {row.committee_designation}
        </span>
      </td>
      <td className="py-2 px-2 md:py-2.5 md:px-3 text-xs md:text-sm text-[var(--text-main)]">
        <span
          className="line-clamp-3 md:line-clamp-4 leading-snug"
          title={row.definition}
        >
          {row.definition}
        </span>
      </td>
    </tr>
  );
});
