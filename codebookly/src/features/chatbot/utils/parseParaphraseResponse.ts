import type { ParaphraseRow } from "../types/paraphrase";

/** If `message` is JSON array of paraphrase rows, return them; otherwise `null`. */
export function tryParseParaphraseJson(message: string): ParaphraseRow[] | null {
  const t = message.trim();
  if (!t.startsWith("[")) return null;
  try {
    const data: unknown = JSON.parse(t);
    if (!Array.isArray(data) || data.length === 0) return null;
    const first = data[0];
    if (typeof first !== "object" || first === null) return null;
    if (!("code" in first) || !("body" in first)) return null;
    return data as ParaphraseRow[];
  } catch {
    return null;
  }
}
