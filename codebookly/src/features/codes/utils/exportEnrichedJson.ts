import type { EnrichedCode } from "../../../types/codebook";

export type EnrichedExportError = { code: string; message: string };

export function downloadEnrichedJson(
  enriched: EnrichedCode[],
  filename: string,
  fetchErrors?: EnrichedExportError[]
) {
  const payload = {
    exportedAt: new Date().toISOString(),
    count: enriched.length,
    enriched,
    ...(fetchErrors?.length
      ? {
          fetchErrors,
          note: "Some codes failed to load; see fetchErrors.",
        }
      : {}),
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
