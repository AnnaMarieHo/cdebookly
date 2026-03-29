import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { sidebarNavBtnClass } from "./sidebarTokens";

type Props = {
  menuId: string;
  label: string;
  icon: ReactNode;
  isNavExpanded: boolean;
  openMenu: string | null;
  onToggle: (menuId: string) => void;
  collapsedTitle?: string;
  /** e.g. max-h scroll for long lists */
  panelClassName?: string;
  children: ReactNode;
};

export function SidebarAccordion({
  menuId,
  label,
  icon,
  isNavExpanded,
  openMenu,
  onToggle,
  collapsedTitle,
  panelClassName,
  children,
}: Props) {
  const isOpen = openMenu === menuId;

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => onToggle(menuId)}
        title={!isNavExpanded ? collapsedTitle : undefined}
        className={sidebarNavBtnClass(isOpen && isNavExpanded, isNavExpanded)}
      >
        <div className="flex items-center gap-3">
          {icon}
          {isNavExpanded && (
            <span className="font-semibold text-sm tracking-wide">{label}</span>
          )}
        </div>
        {isNavExpanded && (
          <ChevronDown
            size={16}
            className={isOpen ? "rotate-180" : "opacity-40"}
            aria-hidden
          />
        )}
      </button>

      {isNavExpanded && isOpen && (
        <div
          className={`ml-4 flex flex-col gap-1 border-l border-[var(--border)] pl-4 py-1 ${panelClassName ?? ""}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
