import { useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  Maximize2,
  MessageCircle,
  SendHorizontal,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { chatService } from "../../../services/chatService";
import { downloadChatMarkdown } from "../utils/downloadChatMarkdown";

type ChatBotProps = {
  /** Code IDs currently selected in the list (shared lifted state). */
  selectedCodeIds: readonly string[];
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  /** Assistant reply when >2 codes were selected: stub in thread; full text in modal. */
  assistantExpandedUi?: boolean;
};

function nextId() {
  return (
    crypto.randomUUID?.() ??
    `m-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

const assistantBubbleBase =
  "m-0 max-w-[90%] rounded-2xl rounded-bl-md border border-[var(--border)] bg-black/5 px-3 py-2 text-sm text-[var(--text-main)] dark:bg-white/10";

const downloadIconButtonClass =
  "rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-black/5 hover:text-[var(--text-main)] dark:hover:bg-white/10";

function AssistantMarkdown({
  text,
  className,
}: {
  text: string;
  /** Override wrapper; default is the compact chat bubble. */
  className?: string;
}) {
  return (
    <div className={className ?? assistantBubbleBase}>
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
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

export function ChatBot({ selectedCodeIds }: ChatBotProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [responseModalText, setResponseModalText] = useState<string | null>(
    null,
  );
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const responseModalCloseRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (responseModalText === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setResponseModalText(null);
    };
    window.addEventListener("keydown", onKey);
    queueMicrotask(() => responseModalCloseRef.current?.focus());
    return () => window.removeEventListener("keydown", onKey);
  }, [responseModalText]);

  const sortedIds = useMemo(
    () => [...selectedCodeIds].sort((a, b) => a.localeCompare(b)),
    [selectedCodeIds],
  );

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    const codeCountAtSend = selectedCodeIds.length;
    const useResponseModal = codeCountAtSend > 2;
    setMessages((prev) => [...prev, { id: nextId(), role: "user", text }]);
    setDraft("");
    setSending(true);
    queueMicrotask(() =>
      transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" }),
    );
    try {
      const response = await chatService.sendMessage(text, selectedCodeIds);
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: "assistant",
          text: response.message,
          assistantExpandedUi: useResponseModal,
        },
      ]);
      if (useResponseModal) {
        setResponseModalText(response.message);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: "assistant",
          text: "Something went wrong. Check the API and try again.",
          assistantExpandedUi: useResponseModal,
        },
      ]);
      if (useResponseModal) {
        setResponseModalText(
          "Something went wrong. Check the API and try again.",
        );
      }
    } finally {
      setSending(false);
      queueMicrotask(() =>
        transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      );
    }
  };

  const modalMarkdownClass =
    "m-0 w-full max-w-none rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-main)] sm:text-[0.9375rem]";

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col items-end gap-3 p-2 sm:bottom-15 sm:right-6">
      {responseModalText !== null ? (
        <div
          className="pointer-events-auto fixed inset-0 z-[200] flex items-end justify-center bg-black/45 p-4 sm:items-center sm:p-6"
          role="presentation"
          onClick={() => setResponseModalText(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Assistant response"
            className="flex max-h-[min(90dvh,48rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
              <p className="m-0 text-sm font-semibold text-[var(--text-h)]">
                Assistant response
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    downloadChatMarkdown(responseModalText, {
                      selectedCodeIds: sortedIds,
                    })
                  }
                  className={downloadIconButtonClass}
                  aria-label="Download response as Markdown"
                >
                  <Download size={18} aria-hidden />
                </button>
                <button
                  ref={responseModalCloseRef}
                  type="button"
                  onClick={() => setResponseModalText(null)}
                  className={downloadIconButtonClass}
                  aria-label="Close response"
                >
                  <X size={18} aria-hidden />
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <AssistantMarkdown
                text={responseModalText}
                className={modalMarkdownClass}
              />
            </div>
          </div>
        </div>
      ) : null}

      {open ? (
        <div
          id="chatbot-panel"
          className="pointer-events-auto flex max-h-[min(32rem,75vh)] w-[min(100vw-2rem,22rem)] flex-col overflow-hidden rounded-2xl border border-slate-500 bg-[var(--bg-card)] text-[var(--text-main)] shadow-lg shadow-black/20 dark:shadow-black/40"
          role="dialog"
          aria-modal="false"
          aria-label="Chat assistant"
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
            <h2 className="m-0 text-sm font-semibold text-[var(--text-h)]">
              Chat assistant
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-black/5 hover:text-[var(--text-main)] dark:hover:bg-white/10"
              aria-label="Close chat"
            >
              <X size={18} aria-hidden />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="shrink-0 border-b border-[var(--border)] px-4 py-2">
              <p className="m-0 text-xs text-[var(--text-muted)]">
                Selected codes ({sortedIds.length})
              </p>
              {sortedIds.length === 0 ? (
                <p className="mt-1 m-0 text-xs text-[var(--text-muted)]">
                  None selected — assistant has no code context yet.
                </p>
              ) : (
                <p
                  className="mt-1 m-0 max-h-16 overflow-y-auto text-xs font-mono text-[var(--text-main)]"
                  title={sortedIds.join(", ")}
                >
                  {sortedIds.join(", ")}
                </p>
              )}
            </div>

            <div className="min-h-[5.5rem] flex-1 overflow-y-auto px-4 py-3">
              {messages.length === 0 ? (
                <p className="m-0 text-sm text-[var(--text-muted)]">
                  Ask for a quiz, a paraphrase, or anything else about the codes
                  you select — for example: &quot;Generate a 5-question multiple
                  choice quiz&quot; or &quot;Paraphrase this code given the
                  context&quot;.
                </p>
              ) : (
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {messages.map((m) => (
                    <li
                      key={m.id}
                      className={
                        m.role === "user"
                          ? "flex justify-end"
                          : "flex justify-start"
                      }
                    >
                      {m.role === "user" ? (
                        <p className="m-0 max-w-[90%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-[var(--primary)] px-3 py-2 text-sm text-white">
                          {m.text}
                        </p>
                      ) : m.assistantExpandedUi ? (
                        <div className={assistantBubbleBase}>
                          <p className="m-0 mb-2 text-sm text-[var(--text-main)]">
                            This reply opened in a larger window (3+ codes
                            selected). Use the button to open it again anytime.
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setResponseModalText(m.text)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/10"
                            >
                              <Maximize2 size={14} aria-hidden />
                              Open full response
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                downloadChatMarkdown(m.text, {
                                  selectedCodeIds: sortedIds,
                                })
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/10"
                            >
                              <Download size={14} aria-hidden />
                              Download .md
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative max-w-[90%] self-start">
                          <button
                            type="button"
                            onClick={() =>
                              downloadChatMarkdown(m.text, {
                                selectedCodeIds: sortedIds,
                              })
                            }
                            className={`absolute right-1 top-2 z-10 ${downloadIconButtonClass}`}
                            aria-label="Download reply as Markdown"
                          >
                            <Download size={14} aria-hidden />
                          </button>
                          <AssistantMarkdown
                            text={m.text}
                            className={`${assistantBubbleBase} pr-10`}
                          />
                        </div>
                      )}
                    </li>
                  ))}
                  {sending ? (
                    <li className="flex justify-start">
                      <p
                        className={`${assistantBubbleBase} text-[var(--text-muted)]`}
                      >
                        Thinking…
                      </p>
                    </li>
                  ) : null}
                  <div ref={transcriptEndRef} aria-hidden />
                </ul>
              )}
            </div>

            <form
              className="shrink-0 border-t border-[var(--border)] p-3"
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
            >
              <label htmlFor="chatbot-message" className="sr-only">
                Message
              </label>
              <div className="flex gap-2">
                <textarea
                  id="chatbot-message"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  rows={2}
                  placeholder="Write a message…"
                  className="min-h-[2.75rem] flex-1 resize-none rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || sending}
                  className="flex shrink-0 items-center justify-center rounded-xl p-2.5 text-white disabled:cursor-not-allowed disabled:opacity-40 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-card)]"
                  aria-label="Send message"
                >
                  <SendHorizontal size={20} aria-hidden />
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--primary)] text-white shadow-lg shadow-black/25 transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
        aria-expanded={open}
        aria-controls="chatbot-panel"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? (
          <X size={24} aria-hidden />
        ) : (
          <MessageCircle size={26} aria-hidden />
        )}
      </button>
    </div>
  );
}

export default ChatBot;
