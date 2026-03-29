import { codeService } from "../../../services/codeApi";
import type { EnrichedCode } from "../../../types/codebook";

const DEFAULT_CONCURRENCY = 4;

/**
 * Fetches full-context payloads for each code id in parallel with a concurrency cap.
 * Preserves successful results in the same order as `codeIds`.
 */
export async function fetchEnrichedForExport(
  codeIds: string[],
  concurrency = DEFAULT_CONCURRENCY
): Promise<{
  enriched: EnrichedCode[];
  errors: { code: string; message: string }[];
}> {
  if (codeIds.length === 0) {
    return { enriched: [], errors: [] };
  }

  const slots: (EnrichedCode | undefined)[] = new Array(codeIds.length);
  const errors: { code: string; message: string }[] = [];
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const i = nextIndex++;
      if (i >= codeIds.length) return;
      const id = codeIds[i];
      try {
        slots[i] = await codeService.getFullCodeContext(id);
      } catch (e) {
        errors.push({
          code: id,
          message: e instanceof Error ? e.message : String(e),
        });
      }
    }
  }

  const pool = Math.min(Math.max(1, concurrency), codeIds.length);
  await Promise.all(Array.from({ length: pool }, () => worker()));

  const enriched = codeIds
    .map((_, i) => slots[i])
    .filter((x): x is EnrichedCode => x != null);

  return { enriched, errors };
}
