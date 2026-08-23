import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import { Sparkles, ArrowUp, X, Loader2, Copy, Check, ArrowRight } from "lucide-react";
import { aivaCommand } from "@/lib/ai.functions";
import type { AttentionItem } from "@/hooks/use-aiva-attention";
import { ACTIVITY_TONE, SAFE_VERB } from "@/lib/aiva/activity/types";

type Ctx = { area: string; suggestions: string[] };

export function areaForPath(path: string): Ctx {
  const p = path.toLowerCase();
  if (p.includes("/courses")) return { area: "Courses", suggestions: ["Build A Course", "Write A Lesson", "Create A Quiz", "Generate Resources"] };
  if (p.includes("/coaching")) return { area: "Coaching", suggestions: ["Prepare For My Next Session", "Find Clients Who Need Attention", "Create An Accountability Plan"] };
  if (p.includes("/members")) return { area: "Members", suggestions: ["Find Members At Risk", "Identify Top Contributors", "Create A Re-Engagement Plan"] };
  if (p.includes("/event") || p.includes("/calendar")) return { area: "Events", suggestions: ["Create An Event", "Write Event Reminder", "Turn A Replay Into A Lesson"] };
  if (p.includes("/analytics") || p.includes("/insights")) return { area: "Analytics", suggestions: ["Explain This Week's Performance", "Why Did Engagement Drop?", "What Should I Improve?"] };
  if (p.includes("/funnel") || p.includes("/pages") || p.includes("/site")) return { area: "Funnels & Pages", suggestions: ["Build A Landing Page", "Create An Offer", "Improve This Page"] };
  if (p.includes("/aiva")) return { area: "AIVA", suggestions: ["Teach AIVA Something New", "Summarize What AIVA Knows", "Suggest Better Instructions"] };
  if (p.includes("/club") || p.includes("/feed") || p.includes("/space")) return { area: "Community", suggestions: ["Create A Post", "Start A Discussion", "Find Unanswered Questions", "Find Inactive Members"] };
  return { area: "Dashboard", suggestions: ["What Needs My Attention Today?", "Create A Post", "Build A Course", "Plan This Week's Content", "Write An Email", "Review Member Activity"] };
}

type Turn = { id: string; role: "you" | "aiva"; text: string; error?: boolean };

export type PaletteBriefing = {
  greeting: string;
  headline: string;
  items: AttentionItem[];
  overflow: number;
};

export function AivaCommandPalette({
  open,
  onClose,
  briefing,
}: {
  open: boolean;
  onClose: () => void;
  /** When present, AIVA opens the conversation with what she found. */
  briefing?: PaletteBriefing | null;
}) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const nav = useNavigate();
  const ctx = useMemo(() => areaForPath(path), [path]);
  const run = useServerFn(aivaCommand);
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  const brief = briefing && briefing.items.length > 0 ? briefing : null;

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 40);
    if (!open) { setTurns([]); setPrompt(""); }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, busy]);

  /** Gives the model the discoveries so follow-ups like "Build it" make sense. */
  function briefingContext() {
    if (!brief) return "";
    const lines = brief.items.map((i, n) =>
      `${n + 1}. [${i.level === "action-required" ? "Needs Approval" : "Discovery"}] ${SAFE_VERB[i.status]}: ${i.title} — ${i.description}`,
    ).join("\n");
    return `\n\nContext — discoveries AIVA just reported to the admin:\n${lines}\n\nWhen the admin refers to "it" or one of these, assume they mean the matching discovery. Give a concrete plan or draft; never claim it is already applied.`;
  }

  async function submit(text?: string) {
    const q = (text ?? prompt).trim();
    if (!q || busy) return;
    setPrompt("");
    setBusy(true);
    setTurns(t => [...t, { id: `u${Date.now()}`, role: "you", text: q }]);
    try {
      const res = await run({ data: { prompt: q + briefingContext(), area: ctx.area, path } });
      setTurns(t => [...t, res.error
        ? { id: `a${Date.now()}`, role: "aiva", text: res.error, error: true }
        : { id: `a${Date.now()}`, role: "aiva", text: res.reply }]);
    } catch {
      setTurns(t => [...t, { id: `a${Date.now()}`, role: "aiva", text: "AIVA is unavailable right now.", error: true }]);
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  const chips = brief
    ? ["Tell Me More", "What Should I Do First?", "Build It"]
    : ctx.suggestions;

  return (
    <div className="acp-overlay" onMouseDown={onClose}>
      <div className={`acp${brief ? " brief" : ""}`} onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-label="Ask AIVA">
        <div className="acp-head">
          <span className="acp-mark"><Sparkles size={15} /></span>
          <div className="acp-titles">
            <div className="acp-title">Ask AIVA</div>
            <div className="acp-sub">{ctx.area}</div>
          </div>
          <button className="acp-x" onClick={onClose} aria-label="Close"><X size={15} /></button>
        </div>

        {(brief || turns.length > 0 || busy) && (
          <div className="acp-thread" ref={threadRef}>
            {brief && (
              <div className="acp-brief">
                <div className="acp-brief-say">
                  <strong>{brief.greeting}.</strong> {brief.headline}
                </div>
                <div className="acp-brief-list">
                  {brief.items.map(item => (
                    <div key={item.id} className={`acp-disc t-${ACTIVITY_TONE[item.activityType]}`}>
                      <div className="acp-disc-top">
                        <span className="acp-disc-kind">
                          {item.level === "action-required" ? "Needs Your Approval" : "Discovery"}
                        </span>
                        <span className="acp-disc-area">{item.area}</span>
                      </div>
                      <div className="acp-disc-title">{item.title}</div>
                      <div className="acp-disc-desc">{item.description}</div>
                      <div className="acp-disc-acts">
                        <button className="acp-disc-a" onClick={() => submit(`Tell me more about: ${item.title}`)}>
                          Tell Me More
                        </button>
                        <button className="acp-disc-a" onClick={() => submit(`Build it: ${item.title}. Give me the exact plan and the drafts I'd need to approve.`)}>
                          Build It
                        </button>
                        {item.ctaDestination && (
                          <button
                            className="acp-disc-a ghost"
                            onClick={() => { onClose(); nav({ to: item.ctaDestination as never }); }}
                          >
                            {item.ctaLabel ?? "Open"} <ArrowRight size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {brief.overflow > 0 && (
                  <button
                    className="acp-brief-more"
                    onClick={() => { onClose(); nav({ to: "/app/aiva" as never }); }}
                  >
                    {brief.overflow} More {brief.overflow === 1 ? "Item" : "Items"} In My Full Activity Report <ArrowRight size={12} />
                  </button>
                )}
              </div>
            )}

            {turns.map(t => (
              t.role === "you" ? (
                <div key={t.id} className="acp-you">{t.text}</div>
              ) : (
                <div key={t.id} className={`acp-reply${t.error ? " err" : ""}`}>
                  {t.error ? t.text : (
                    <>
                      <div className="acp-md"><ReactMarkdown>{t.text}</ReactMarkdown></div>
                      <button
                        className="acp-copy"
                        onClick={() => { navigator.clipboard.writeText(t.text); setCopied(t.id); setTimeout(() => setCopied(null), 1500); }}
                      >
                        {copied === t.id ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
                      </button>
                    </>
                  )}
                </div>
              )
            ))}

            {busy && <div className="acp-thinking"><Loader2 size={14} className="acp-spin" /> AIVA Is Thinking…</div>}
          </div>
        )}

        <div className="acp-input">
          <textarea
            ref={inputRef}
            rows={2}
            value={prompt}
            placeholder={brief ? "Reply to AIVA — “Tell me more about the first one”…" : "Ask AIVA anything or tell her what to do..."}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
          />
          <button className="acp-send" onClick={() => submit()} disabled={busy || !prompt.trim()} aria-label="Send">
            {busy ? <Loader2 size={15} className="acp-spin" /> : <ArrowUp size={15} strokeWidth={3} />}
          </button>
        </div>

        <div className="acp-chips">
          {chips.map((s) => (
            <button key={s} className="acp-chip" onClick={() => submit(s)} disabled={busy}>
              <Sparkles size={12} /> {s}
            </button>
          ))}
        </div>

        <div className="acp-foot">
          <span><kbd>Enter</kbd> Send</span>
          <span><kbd>Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}
