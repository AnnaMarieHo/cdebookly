/** Download assistant reply as a Markdown file (browser save dialog). */
export function downloadChatMarkdown(
  markdown: string,
  options?: { filename?: string; selectedCodeIds?: readonly string[] },
) {
  const exportedAt = new Date().toISOString();
  const stamp = exportedAt.replace(/[:.]/g, "-").slice(0, 19);
  const base =
    options?.filename?.replace(/\.md$/i, "") ?? `codebookly-chat-${stamp}`;
  const filename = base.endsWith(".md") ? base : `${base}.md`;

  const codesLine =
    options?.selectedCodeIds?.length &&
    ` codes: ${options.selectedCodeIds.join(", ")}`;
  const header = `<!-- Codebookly | exported ${exportedAt}${codesLine ? ` |${codesLine}` : ""} -->\n\n`;

  const blob = new Blob([header + markdown], {
    type: "text/markdown;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
