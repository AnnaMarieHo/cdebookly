import type { SectionChapterMetadata } from "../../types/codebook";

type Props = {
  meta: SectionChapterMetadata;
  contextLabel?: string;
};

export function SectionChapterBanner({
  meta,
  contextLabel = "Chapter context",
}: Props) {
  return (
    <section
      className="mb-8 rounded-xl border border-border-ui bg-card px-5 py-5 md:px-8 md:py-6"
      aria-labelledby="section-chapter-banner-title"
    >
      <p className="text-[0.7rem] uppercase tracking-wider text-primary font-semibold m-0 mb-2">
        {contextLabel}
      </p>
      <h2
        id="section-chapter-banner-title"
        className="text-xl md:text-2xl font-extrabold text-text-main m-0"
      >
        {meta.title}
      </h2>
      {meta.description ? (
        <p className="text-sm md:text-base text-text-muted mt-3 mb-0 leading-relaxed">
          {meta.description}
        </p>
      ) : null}
    </section>
  );
}
