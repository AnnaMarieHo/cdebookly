import { useCallback, useState } from "react";
import {
  BookOpen,
  Building2,
  ChevronLeft,
  Layers,
  List,
  Menu,
} from "lucide-react";
import { CODEBOOKLY_ICON_SRC } from "../../branding";
import type { Agency, CommitteeDesignation } from "../../types/codebook";
import { SidebarAccordion } from "./SidebarAccordion";
import { SIDEBAR_SUB_LINK, sidebarNavBtnClass } from "./sidebarTokens";

type Props = {
  sections: { section: string; title: string }[];
  chapters: { chapter: string; title: string }[];
  designations: CommitteeDesignation[];
  agencies: Agency[];
  onSectionSelect: (sectionCode: string) => void;
  onChapterSelect: (chapterKey: string) => void;
  onDesignationSelect: (d: CommitteeDesignation) => void;
  onAgencySelect: (a: Agency) => void;
  onDefinitionsSelect: () => void;
  definitionsActive?: boolean;
};

const SCROLL_PANEL = "max-h-[min(50vh,20rem)] overflow-y-auto custom-scrollbar";

export default function SideBar({
  sections,
  chapters,
  designations: _designations,
  agencies,
  onSectionSelect,
  onChapterSelect,
  onDesignationSelect: _onDesignationSelect,
  onAgencySelect,
  onDefinitionsSelect,
  definitionsActive = false,
}: Props) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const expandAndToggle = useCallback((menuName: string) => {
    setIsExpanded(true);
    setOpenMenu((prev) => (prev === menuName ? null : menuName));
  }, []);

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-[var(--bg-card)] border-r border-[var(--border)] flex flex-col z-50
      ${isExpanded ? "w-72" : "w-20"}`}
    >
      <div
        className={`h-20 border-b border-[var(--border)] flex items-center gap-2 shrink-0 ${
          isExpanded
            ? "px-6 justify-between flex-row"
            : "px-2 flex-col justify-center"
        }`}
      >
        <div
          className={`flex items-center gap-3 min-w-0 ${
            isExpanded ? "flex-1" : "justify-center"
          }`}
        >
          {isExpanded ? (
            <span className="text-xl font-bold tracking-tighter text-[var(--text-main)] truncate">
              <img
                src={CODEBOOKLY_ICON_SRC}
                alt=""
                width={500}
                height={500}
                className="size-32 shrink-0"
                decoding="async"
              />
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((e) => !e)}
          className="p-2 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isExpanded ? <ChevronLeft size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => {
              onDefinitionsSelect();
              setOpenMenu(null);
            }}
            title={!isExpanded ? "Definitions" : undefined}
            className={sidebarNavBtnClass(!!definitionsActive, isExpanded)}
          >
            <div className="flex items-center gap-3">
              <BookOpen size={22} className="shrink-0" aria-hidden />
              {isExpanded && (
                <span className="font-semibold text-sm tracking-wide">
                  Definitions
                </span>
              )}
            </div>
            {isExpanded && <span className="w-4 shrink-0" aria-hidden />}
          </button>
        </div>

        <SidebarAccordion
          menuId="sections"
          label="Sections"
          icon={<Layers size={22} className="shrink-0" aria-hidden />}
          isNavExpanded={isExpanded}
          openMenu={openMenu}
          onToggle={expandAndToggle}
        >
          {sections.map((section) => (
            <button
              type="button"
              key={section.section}
              className={`${SIDEBAR_SUB_LINK} w-full text-left border-0 bg-transparent cursor-pointer font-inherit`}
              onClick={() => onSectionSelect(section.section)}
            >
              <div className="flex flex-row items-center gap-3  pb-2">
                <span className="">{section.section}</span>
                <span className="block text-[0.75rem] text-[var(--text-muted)]">
                  {section.title}
                </span>
              </div>
            </button>
          ))}
        </SidebarAccordion>

        <SidebarAccordion
          menuId="chapters"
          label="Chapters"
          icon={<List size={22} className="shrink-0" aria-hidden />}
          isNavExpanded={isExpanded}
          openMenu={openMenu}
          onToggle={expandAndToggle}
        >
          {chapters.map((chapter) => (
            <button
              type="button"
              key={chapter.chapter}
              className={`${SIDEBAR_SUB_LINK} w-full text-left border-0 bg-transparent cursor-pointer font-inherit`}
              onClick={() => onChapterSelect(chapter.chapter)}
            >
              <div className="flex flex-row items-center gap-3  pb-2">
                <span className="">Chapter {chapter.chapter}</span>
                {/* <span className="block text-[0.75rem] text-[var(--text-muted)]">
                  {chapter.title}
                </span> */}
              </div>
            </button>
          ))}
        </SidebarAccordion>

        {/* <SidebarAccordion
          menuId="designations"
          label="Designations"
          icon={<Tags size={22} className="shrink-0" aria-hidden />}
          isNavExpanded={isExpanded}
          openMenu={openMenu}
          onToggle={expandAndToggle}
          collapsedTitle="Designations"
          panelClassName={SCROLL_PANEL}
        >
          {designations.length === 0 ? (
            <span
              className={`${SIDEBAR_SUB_LINK} text-[var(--text-muted)] cursor-default`}
            >
              None loaded
            </span>
          ) : (
            designations.map((d) => (
              <button
                type="button"
                key={d.letter_tag}
                className={`${SIDEBAR_SUB_LINK} w-full text-left border-0 bg-transparent cursor-pointer font-inherit`}
                title={d.description || undefined}
                onClick={() => onDesignationSelect(d)}
              >
                <span className="block text-[0.75rem] text-[var(--text-muted)] mt-0.5 line-clamp-2">
                  {d.description}
                </span>
                {d.description ? (
                  <span className="font-semibold text-[var(--text-main)]">
                    {d.letter_tag}
                  </span>
                ) : null}
              </button>
            ))
          )}
        </SidebarAccordion> */}

        <SidebarAccordion
          menuId="agencies"
          label="Referenced Standards"
          icon={<Building2 size={22} className="shrink-0" aria-hidden />}
          isNavExpanded={isExpanded}
          openMenu={openMenu}
          onToggle={expandAndToggle}
          collapsedTitle="Agencies"
          panelClassName={SCROLL_PANEL}
        >
          {agencies.length === 0 ? (
            <span
              className={`${SIDEBAR_SUB_LINK} text-[var(--text-muted)] cursor-default`}
            >
              None loaded
            </span>
          ) : (
            agencies.map((a) => (
              <button
                type="button"
                key={a.agency}
                className={`${SIDEBAR_SUB_LINK} w-full text-left border-0 bg-transparent cursor-pointer font-inherit`}
                title={a.agency_info || undefined}
                onClick={() => onAgencySelect(a)}
              >
                <span className="font-semibold text-[var(--text-main)]">
                  {a.agency}
                </span>
                {a.agency_info ? (
                  <span className="block text-[0.75rem] text-[var(--text-muted)] mt-0.5 line-clamp-2">
                    {a.agency_info}
                  </span>
                ) : null}
              </button>
            ))
          )}
        </SidebarAccordion>
      </nav>
    </aside>
  );
}
