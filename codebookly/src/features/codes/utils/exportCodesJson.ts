import type { CodeRecord } from "../../../types/codebook";

export function downloadCodesJson(rows: CodeRecord[], filename: string) {
  const payload = {
    exportedAt: new Date().toISOString(),
    count: rows.length,
    codes: rows,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".json") ? filename : `${filename}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
