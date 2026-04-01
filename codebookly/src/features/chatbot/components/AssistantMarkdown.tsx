import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function AssistantMarkdown({ text }: { text: string; className?: string }) {
  const assistantBubbleBase =
    "m-0 max-w-[90%] rounded-2xl rounded-bl-md border border-[var(--border)] bg-black/5 px-3 py-2 text-sm text-[var(--text-main)] dark:bg-white/10";

  return (
    <div className={assistantBubbleBase}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="mb-2 last:mb-0 whitespace-normal">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-2 list-disc pl-4 last:mb-0">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-2 list-decimal pl-4 last:mb-0">{children}</ol>
          ),
          li: ({ children }) => <li className="mb-0.5">{children}</li>,
          h1: ({ children }) => (
            <h3 className="mb-1 mt-3 text-base font-semibold first:mt-0">
              {children}
            </h3>
          ),
          h2: ({ children }) => (
            <h3 className="mb-1 mt-3 text-base font-semibold first:mt-0">
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <h4 className="mb-1 mt-2 text-sm font-semibold first:mt-0">
              {children}
            </h4>
          ),
          h4: ({ children }) => (
            <h4 className="mb-1 mt-2 text-sm font-semibold first:mt-0">
              {children}
            </h4>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
          hr: () => <hr className="my-2 border-[var(--border)]" />,
          code: ({ className, children }) => {
            const inline = !className;
            if (inline) {
              return (
                <code className="rounded bg-black/15 px-1 py-0.5 font-mono text-[0.85em] dark:bg-white/20">
                  {children}
                </code>
              );
            }
            return <code className={className}>{children}</code>;
          },
          pre: ({ children }) => (
            <pre className="mb-2 overflow-x-auto rounded-lg bg-black/15 p-2 text-xs dark:bg-black/40">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mb-2 border-l-2 border-[var(--primary)] pl-2 text-[var(--text-muted)]">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-[var(--primary)] underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b border-[var(--border)] bg-black/5 dark:bg-white/5">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="p-2 font-semibold text-[var(--text-h)]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-[var(--border)] p-2 align-top last:border-0">
              {children}
            </td>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              {children}
            </tr>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

export default AssistantMarkdown;
