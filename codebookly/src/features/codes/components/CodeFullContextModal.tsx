import { useEnrichedCode } from "../hooks/useEnrichedCode";
import { EnrichedCodeContent } from "./EnrichedCodeContent";

type Props = {
  open: boolean;
  codeId: string | null;
  onClose: () => void;
};

export function CodeFullContextModal({ open, codeId, onClose }: Props) {
  const state = useEnrichedCode(open ? codeId : null);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] cursor-default border-0 p-0"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="full-context-title"
        className="relative z-10 w-full max-w-3xl max-h-[min(90vh,900px)] overflow-y-auto custom-scrollbar rounded-xl border border-border-ui bg-card p-6 md:p-8 shadow-xl text-left"
      >
        <div className="flex justify-between items-start gap-4 mb-6 sticky top-0 bg-card pb-2 border-b border-border-ui -mx-6 px-6 md:-mx-8 md:px-8 z-10">
          <h2
            id="full-context-title"
            className="text-lg font-bold text-text-main m-0"
          >
            Full code context
            {codeId != null ? (
              <span className="text-text-muted font-normal"> · {codeId}</span>
            ) : null}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold bg-border-ui text-text-main hover:opacity-90 border-0 cursor-pointer"
          >
            Close
          </button>
        </div>

        {state.status === "idle" || state.status === "loading" ? (
          <p className="text-text-muted m-0">Loading…</p>
        ) : null}

        {state.status === "error" ? (
          <p className="text-red-400 m-0" role="alert">
            {state.message}
          </p>
        ) : null}

        {state.status === "ok" ? (
          <div className="space-y-4">
            {state.partial ? (
              <p className="text-sm text-text-muted m-0 rounded-lg border border-border-ui bg-[var(--bg-card)] px-3 py-2">
                Loaded code text only; standards, committee designations, and
                index terms were not available.
              </p>
            ) : null}
            <EnrichedCodeContent enriched={state.data} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
