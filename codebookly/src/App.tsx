import "./App.css";
// import { CODEBOOKLY_ICON_SRC } from "./branding";
import { Library } from "lucide-react";
import { CodeListSection } from "./features/codes/components/CodeListSection";
import { DefinitionsExplorer } from "./features/definitions/components/DefinitionsExplorer";
import { SectionChapterBanner } from "./features/layout/SectionChapterBanner";
import SideBar from "./features/layout/SideBar";
import { useCodebookApp } from "./hooks/useCodebookApp";

function App() {
  const {
    mainView,
    setMainView,
    codes,
    codesAreaLoading,
    sectionChapterMeta,
    designationMeta,
    agencyMeta,
    sections,
    chapters,
    designations,
    agencies,
    handleSectionSelect,
    handleChapterSelect,
    handleDesignationSelect,
    handleAgencySelect,
  } = useCodebookApp();

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <SideBar
        sections={sections}
        chapters={chapters}
        designations={designations}
        agencies={agencies}
        onSectionSelect={handleSectionSelect}
        onChapterSelect={handleChapterSelect}
        onDesignationSelect={handleDesignationSelect}
        onAgencySelect={handleAgencySelect}
        onDefinitionsSelect={() => setMainView("definitions")}
        definitionsActive={mainView === "definitions"}
      />

      <div className="flex-1 ml-20 md:ml-72">
        <main className="max-w-[1600px] mx-auto px-4 py-6 sm:px-6 md:px-10 md:py-10 lg:px-12 lg:py-12">
          <header className="mb-12 flex flex-wrap items-center gap-4 md:gap-5">
            <Library size={60} className="text-blue-500" />

            <h1 className="text-3xl md:text-3xl font-black text-[var(--text-h)] m-0">
              Codebookly Admin
            </h1>
          </header>

          {mainView === "definitions" ? (
            <DefinitionsExplorer />
          ) : (
            <>
              {sectionChapterMeta ? (
                <SectionChapterBanner meta={sectionChapterMeta} />
              ) : null}
              {designationMeta ? (
                <SectionChapterBanner
                  meta={designationMeta}
                  contextLabel="Committee designation"
                />
              ) : null}
              {agencyMeta ? (
                <SectionChapterBanner meta={agencyMeta} contextLabel="Agency" />
              ) : null}
              <CodeListSection codes={codes} loading={codesAreaLoading} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
