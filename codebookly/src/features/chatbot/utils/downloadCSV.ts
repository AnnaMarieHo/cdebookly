import type { ParaphraseRow } from "../types/paraphrase";
import { paraphraseRowsToCsv } from "./rowsToCsv";

export function downloadCSV(
  csvString: string,
  filename = "plumbing_rewrite.csv",
) {
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Download paraphrase table rows as UTF-8 CSV (Excel-friendly BOM). */
export function downloadParaphraseCsv(
  rows: ParaphraseRow[],
  options?: { filename?: string; selectedCodeIds?: readonly string[] },
) {
  const exportedAt = new Date().toISOString();
  const stamp = exportedAt.replace(/[:.]/g, "-").slice(0, 19);
  const base =
    options?.filename?.replace(/\.csv$/i, "") ?? `codebookly-paraphrase-${stamp}`;
  const filename = base.endsWith(".csv") ? base : `${base}.csv`;
  const csv = paraphraseRowsToCsv(rows);
  downloadCSV(csv, filename);
}
