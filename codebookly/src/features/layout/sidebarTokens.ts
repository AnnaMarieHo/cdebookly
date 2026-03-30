/** Shared sidebar list / accordion styling */
export const SIDEBAR_SUB_LINK =
  "text-sm py-2 px-3 rounded-md hover:text-[var(--primary)] hover:bg-[var(--surface-hover)] text-[var(--text-muted)]";

export function sidebarNavBtnClass(active: boolean, isExpanded: boolean) {
  return `w-full flex items-center p-3 rounded-lg group
    ${active ? "bg-[var(--surface-hover)] text-[var(--primary)]" : "text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-main)]"}
    ${isExpanded ? "justify-between" : "justify-center"}`;
}
