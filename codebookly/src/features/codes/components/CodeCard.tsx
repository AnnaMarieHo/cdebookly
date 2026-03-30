import { Expand } from "lucide-react";
import { memo } from "react";
import type { CodeRecord } from "../../../types/codebook";

type Props = {
  code: CodeRecord;
  index: number;
  selected: boolean;
  onSelectionClick: (
    e: React.MouseEvent<HTMLInputElement>,
    index: number,
    id: string,
  ) => void;
  onOpenDetail: () => void;
};

function CodeCardImpl({
  code,
  index,
  selected,
  onSelectionClick,
  onOpenDetail,
}: Props) {
  return (
    <article
      className={`rounded-md border bg-card ${
        selected
          ? "ring-2 ring-primary border-primary shadow-sm"
          : "border-border-ui hover:border-primary"
      }`}
    >
      <div className="flex gap-2 p-3">
        <label
          className="shrink-0 cursor-pointer pt-0.5 select-none"
          onClick={(e) => e.stopPropagation()}
          data-code-checkbox
        >
          <input
            type="checkbox"
            readOnly
            className="appearance-none size-3.5 rounded-full border bg-whiteborder-border-ui cursor-pointer checked:bg-[var(--primary)]"
            checked={selected}
            onClick={(e) => onSelectionClick(e, index, code.code)}
            aria-label={`Select code ${code.code}`}
          />
        </label>

        <div className="flex-1 min-w-0">
          <div className="flex gap-2 items-start justify-between mb-2">
            <div className="min-w-0 flex-1">
              <span className="block text-[0.80rem] uppercase text-primary tracking-wide mb-0.5 font-medium line-clamp-1">
                {code.section_code}
                {code.section_title != null && code.section_title !== ""
                  ? ` — ${code.section_title}`
                  : ""}
              </span>
              <h2 className="text-sm font-extrabold m-0 text-text-main leading-tight">
                {code.code}
              </h2>
              <h3 className="text-xs font-semibold text-text-muted mt-0.5 mb-0 line-clamp-2 leading-snug">
                {code.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={onOpenDetail}
              className="shrink-0 rounded-md border border-border-ui bg-card p-1.5 text-text-muted hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
              aria-label={`Open full context for ${code.code}`}
            >
              <Expand size={16} strokeWidth={2.25} aria-hidden />
            </button>
          </div>

          <div className="mb-2">
            <p className="leading-snug text-[0.8rem] text-text-main line-clamp-3 m-0">
              {code.content}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 items-center pt-2 border-t border-border-ui">
            <span className="bg-border-ui px-1.5 py-0.5 rounded text-[0.65rem] font-bold uppercase text-text-main">
              Ch. {code.chapter}
            </span>
            {code.table && (
              <span className="text-[0.7rem] text-text-muted truncate max-w-full">
                Tbl {code.table}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default memo(CodeCardImpl);
