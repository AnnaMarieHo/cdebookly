import type { ParaphraseRow } from "../types/paraphrase";

const tableWrap =
  "w-full border-collapse text-left text-xs text-[var(--text-main)] sm:text-sm";
const th =
  "sticky top-0 z-[1] border border-[var(--border)] bg-[var(--bg)] px-2 py-2 font-semibold text-[var(--text-h)]";
const td =
  "max-w-[12rem] border border-[var(--border)] px-2 py-2 align-top text-[var(--text-main)] sm:max-w-[16rem]";

function formatStandardsCell(row: ParaphraseRow): string {
  const list = row.standards ?? [];
  return list
    .map((s) => {
      const id = s.standard_id ?? "";
      const def = (s.definition ?? "").trim();
      if (id && def) return `${id}: ${def}`;
      return id || def;
    })
    .filter(Boolean)
    .join("; ");
}

/** Renders API body text that may use `<br>` as line breaks. */
function CellBody({ html }: { html: string }) {
  const parts = html.split(/<br\s*\/?>/gi);
  return (
    <div className="whitespace-pre-wrap break-words">
      {parts.map((part, i) => (
        <span key={i}>
          {i > 0 ? <br /> : null}
          {part.replace(/<[^>]+>/g, "")}
        </span>
      ))}
    </div>
  );
}

type ParaphraseTableProps = {
  rows: ParaphraseRow[];
  /** Max height for scrollable body (e.g. compact transcript preview). */
  maxHeight?: string;
  className?: string;
};

/**
 * Table viewer for paraphrase batch JSON (code, chapter, rewrites, standards).
 */
export function ParaphraseTable({
  rows,
  maxHeight,
  className = "",
}: ParaphraseTableProps) {
  return (
    <div
      className={`rounded-lg border border-[var(--border)] ${maxHeight ? "overflow-auto" : "overflow-x-auto"} ${className}`}
      style={maxHeight ? { maxHeight } : undefined}
    >
      <table className={tableWrap}>
        <thead>
          <tr>
            <th className={th}>Code</th>
            <th className={th}>Chapter</th>
            <th className={th}>Section</th>
            <th className={th}>Body</th>
            <th className={th}>Simplified</th>
            <th className={th}>Standards</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={`${row.code}-${idx}`}>
              <td className={td}>
                <span className="font-mono text-[0.8125rem]">{row.code}</span>
                {row.found === false ? (
                  <span className="ml-1 text-[var(--text-muted)]">(not found)</span>
                ) : null}
              </td>
              <td className={td}>{row.chapter}</td>
              <td className={td}>{row.section_title ?? "—"}</td>
              <td className={td}>
                <CellBody html={row.body ?? ""} />
              </td>
              <td className={td}>
                <CellBody html={row.simplified_body ?? ""} />
              </td>
              <td className={`${td} max-w-[14rem]`}>
                <span className="block break-words text-[var(--text-muted)]">
                  {formatStandardsCell(row) || "—"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** @deprecated Use `ParaphraseTable` with structured rows. */
export function CSVPreview({ csvData }: { csvData: string }) {
  const rows = csvData.trim().split("\n");
  const header = rows[0]?.split("|") ?? [];
  const body = rows.slice(1);

  return (
    <table className="csv-table">
      <thead>
        <tr>
          {header.map((h, i) => (
            <th key={i}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {body.map((row, i) => (
          <tr key={i}>
            {row.split("|").map((cell, j) => (
              <td key={j} dangerouslySetInnerHTML={{ __html: cell }} />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
