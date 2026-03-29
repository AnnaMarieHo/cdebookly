import { memo } from "react";
import type { EnrichedCode } from "../../../types/codebook";

function EnrichedCodeContentImpl({ enriched }: { enriched: EnrichedCode }) {
  const { code, standards, committee_designations, index_terms } = enriched;

  return (
    <div className="space-y-8 text-left">
      <section>
        <span className="block text-[0.75rem] uppercase text-primary tracking-wider mb-1 font-medium">
          {code.section_code}
          {code.section_title != null && code.section_title !== ""
            ? ` — ${code.section_title}`
            : ""}
        </span>
        <h2 className="text-xl font-extrabold m-0 text-text-main">{code.code}</h2>
        <h3 className="text-base font-semibold text-text-muted mt-1 mb-4">
          {code.title}
        </h3>
        <p className="leading-relaxed text-[0.95rem] text-text-main whitespace-pre-wrap">
          {code.content}
        </p>
        <div className="flex flex-wrap gap-3 items-center pt-4 mt-4 border-t border-border-ui">
          <span className="bg-border-ui px-2 py-0.5 rounded text-[0.7rem] font-bold uppercase text-text-main">
            Chapter {code.chapter}
          </span>
          {code.table ? (
            <span className="text-[0.8rem] text-text-muted">Table {code.table}</span>
          ) : null}
          {code.figure ? (
            <span className="text-[0.8rem] text-text-muted">Figure {code.figure}</span>
          ) : null}
        </div>
      </section>

      {standards.length > 0 ? (
        <section className="border-t border-border-ui pt-6">
          <h4 className="text-sm font-bold uppercase tracking-wide text-primary mb-3">
            Standards
          </h4>
          <ul className="list-none m-0 p-0 space-y-4">
            {standards.map((s, i) => (
              <li
                key={`${s.agency}-${s.standard_id}-${i}`}
                className="rounded-md border border-border-ui bg-[var(--bg-card)] p-3"
              >
                <div className="text-[0.8rem] font-bold text-text-main">
                  {s.agency} · {s.standard_id}
                </div>
                {s.definition ? (
                  <p className="text-[0.85rem] text-text-muted m-0 mt-2 leading-relaxed">
                    {s.definition}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {committee_designations.length > 0 ? (
        <section className="border-t border-border-ui pt-6">
          <h4 className="text-sm font-bold uppercase tracking-wide text-primary mb-3">
            Committee designations
          </h4>
          <ul className="list-none m-0 p-0 space-y-2">
            {committee_designations.map((c) => (
              <li key={c.letter_tag} className="text-[0.9rem]">
                <span className="font-bold text-text-main">{c.letter_tag}</span>
                {c.description ? (
                  <span className="text-text-muted"> — {c.description}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {index_terms.length > 0 ? (
        <section className="border-t border-border-ui pt-6">
          <h4 className="text-sm font-bold uppercase tracking-wide text-primary mb-3">
            Index terms
          </h4>
          <ul className="list-none m-0 p-0 space-y-3">
            {index_terms.map((t) => (
              <li
                key={t.id}
                className="text-[0.85rem] border-l-2 border-primary/40 pl-3"
              >
                <div className="font-semibold text-text-main">{t.term}</div>
                {t.label ? (
                  <div className="text-text-muted mt-0.5">{t.label}</div>
                ) : null}
                <div className="text-text-muted text-[0.8rem] mt-1">
                  {t.ref_type} {t.ref_id}
                  {t.breadcrumb ? ` · ${t.breadcrumb}` : ""}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

export const EnrichedCodeContent = memo(EnrichedCodeContentImpl);
