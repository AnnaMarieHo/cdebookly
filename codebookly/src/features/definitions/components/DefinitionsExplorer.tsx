import { useDefinitionsBrowse } from "../hooks/useDefinitionsBrowse";
import { DefinitionsSearchForm } from "./DefinitionsSearchForm";
import { DefinitionsTableSection } from "./DefinitionsTableSection";

export function DefinitionsExplorer() {
  const {
    data,
    loading,
    error,
    exportBusy,
    runSearch,
    goToPage,
    exportJson,
    rangeLabel,
    hasResults,
  } = useDefinitionsBrowse();

  return (
    <section className="space-y-4" aria-labelledby="definitions-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2
            id="definitions-heading"
            className="text-2xl md:text-3xl font-black text-[var(--text-h)] m-0 flex items-center gap-2"
          >
            {/* <BookOpen
              className="shrink-0 text-[var(--primary)]"
              size={28}
              aria-hidden
            /> */}
            Definitions
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-2 mb-0 max-w-2xl">
            The first page loads automatically so you can browse. Use Search to
            run a server query over terms, definitions, and committee text (
            <code className="text-[var(--text-main)]">
              GET /api/definitions?q=…
            </code>
            ). Pagination keeps the same query. Download matches the results you
            are viewing.
          </p>
        </div>
      </div>

      <DefinitionsSearchForm
        onSearch={runSearch}
        loading={loading}
        exportBusy={exportBusy}
        hasResults={hasResults}
        onExport={exportJson}
      />

      <DefinitionsTableSection
        data={data}
        loading={loading}
        error={error}
        rangeLabel={rangeLabel}
        goToPage={goToPage}
      />
    </section>
  );
}
