import { useEffect, useState } from "react";
import { codeService } from "../../../services/codeService";
import type { EnrichedCode } from "../../../types/codebook";
import { singleCodeResponseToEnriched } from "../utils/singleCodeToEnriched";

export type EnrichedCodeState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; data: EnrichedCode; partial?: boolean }
  | { status: "error"; message: string };

export function useEnrichedCode(codeId: string | null): EnrichedCodeState {
  const [state, setState] = useState<EnrichedCodeState>({ status: "idle" });

  useEffect(() => {
    if (codeId == null || codeId === "") {
      setState({ status: "idle" });
      return;
    }

    let cancelled = false;
    setState({ status: "loading" });

    codeService
      .getFullCodeContext(codeId)
      .then((data) => {
        if (!cancelled) setState({ status: "ok", data });
      })
      .catch(() => {
        if (cancelled) return;
        codeService
          .getCode(codeId)
          .then((single) => {
            if (!cancelled) {
              setState({
                status: "ok",
                data: singleCodeResponseToEnriched(single),
                partial: true,
              });
            }
          })
          .catch(() => {
            if (!cancelled)
              setState({
                status: "error",
                message: "Could not load full context for this code.",
              });
          });
      });

    return () => {
      cancelled = true;
    };
  }, [codeId]);

  return state;
}
