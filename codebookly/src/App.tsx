import "./App.css";
// import { CODEBOOKLY_ICON_SRC } from "./branding";
import { Library } from "lucide-react";
import Login from "./features/auth/Login";
import { useAuth } from "./features/auth/AuthContext";
import { CodeListSection } from "./features/codes/components/CodeListSection";
import { DefinitionsExplorer } from "./features/definitions/components/DefinitionsExplorer";
import { SectionChapterBanner } from "./features/layout/SectionChapterBanner";
import SideBar from "./features/layout/SideBar";
import { useCodebookApp } from "./hooks/useCodebookApp";

type AuthenticatedAppProps = {
  signOut: () => Promise<void>;
};

function AuthenticatedApp({ signOut }: AuthenticatedAppProps) {
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
          <header className="mb-12 flex flex-wrap items-center justify-between gap-4 md:gap-5">
            <div className="flex flex-wrap items-center gap-4 md:gap-5 min-w-0">
              <Library size={60} className="text-primary" />

              <h1 className="text-3xl md:text-3xl font-black text-[var(--text-h)] m-0">
                Codebookly Admin
              </h1>
            </div>
            <button
              type="button"
              onClick={() => void signOut()}
              className="shrink-0 rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm font-medium text-[var(--text-h)] hover:bg-black/5 dark:hover:bg-white/10"
            >
              Sign out
            </button>
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

function App() {
  const { session, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-[var(--text)]">
        Loading…
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return <AuthenticatedApp signOut={signOut} />;
}

export default App;
