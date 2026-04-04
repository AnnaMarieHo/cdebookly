import type { ParaphraseRow } from "../types/paraphrase";

function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatStandards(row: ParaphraseRow): string {
  const list = row.standards ?? [];
  return list
    .map((s) => {
      const id = s.standard_id ?? "";
      const def = (s.definition ?? "").replace(/\s+/g, " ").trim();
      if (id && def) return `${id}: ${def}`;
      if (id) return id;
      return def;
    })
    .filter(Boolean)
    .join("; ");
}

/** HTML `<br>` from API → single line for CSV cells. */
function flattenBody(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .trim();
}

const HEADERS = [
  "code",
  "chapter",
  "section_title",
  "body",
  "simplified_body",
  "standards",
  "found",
] as const;

export function paraphraseRowsToCsv(rows: ParaphraseRow[]): string {
  const lines = [HEADERS.join(",")];
  for (const row of rows) {
    const cells = [
      row.code ?? "",
      row.chapter ?? "",
      row.section_title ?? "",
      flattenBody(row.body ?? ""),
      flattenBody(row.simplified_body ?? ""),
      formatStandards(row),
      row.found === false ? "false" : "true",
    ].map((c) => escapeCsvField(String(c)));
    lines.push(cells.join(","));
  }
  return "\uFEFF" + lines.join("\r\n");
}
