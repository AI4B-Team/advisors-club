import { useEffect, useMemo, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import { Sparkles, ArrowUp, X, Loader2, Copy, Check } from "lucide-react";
import { aivaCommand } from "@/lib/ai.functions";

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
  return { area: "Dashboard", suggestions: ["What Needs My Attention Today?", "Create A Post", "Build A Course", "Plan This Week's Content"] };
}

export function AivaCommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const ctx = useMemo(() => areaForPath(path), [path]);
  const run = useServerFn(aivaCommand);
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [reply, setReply] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [asked, setAsked] = useState("");
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 40);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function submit(text?: string) {
    const q = (text ?? prompt).trim();
    if (!q || busy) return;
    setBusy(true); setError(null); setReply(""); setAsked(q); setCopied(false);
    try {
      const res = await run({ data: { prompt: q, area: ctx.area, path } });
      if (res.error) setError(res.error); else setReply(res.reply);
    } catch {
      setError("AIVA is unavailable right now.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div className="acp-overlay" onMouseDown={onClose}>
      <div className="acp" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-label="Ask AIVA">
        <div className="acp-head">
          <span className="acp-mark"><Sparkles size={15} /></span>
          <div className="acp-titles">
            <div className="acp-title">Ask AIVA</div>
            <div className="acp-sub">{ctx.area}</div>
          </div>
          <button className="acp-x" onClick={onClose} aria-label="Close"><X size={15} /></button>
        </div>

        <div className="acp-input">
          <textarea
            ref={inputRef}
            rows={2}
            value={prompt}
            placeholder="Ask AIVA anything or tell her what to do..."
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
          />
          <button className="acp-send" onClick={() => submit()} disabled={busy || !prompt.trim()} aria-label="Send">
            {busy ? <Loader2 size={15} className="acp-spin" /> : <ArrowUp size={15} strokeWidth={3} />}
          </button>
        </div>

        <div className="acp-chips">
          {ctx.suggestions.map((s) => (
            <button key={s} className="acp-chip" onClick={() => { setPrompt(s); submit(s); }} disabled={busy}>
              <Sparkles size={12} /> {s}
            </button>
          ))}
        </div>

        {(busy || reply || error) && (
          <div className="acp-out">
            {asked && <div className="acp-asked">{asked}</div>}
            {busy && <div className="acp-thinking"><Loader2 size={14} className="acp-spin" /> AIVA Is Thinking…</div>}
            {error && <div className="acp-error">{error}</div>}
            {reply && (
              <>
                <div className="acp-md"><ReactMarkdown>{reply}</ReactMarkdown></div>
                <button
                  className="acp-copy"
                  onClick={() => { navigator.clipboard.writeText(reply); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                >
                  {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
                </button>
              </>
            )}
          </div>
        )}

        <div className="acp-foot">
          <span><kbd>Enter</kbd> Send</span>
          <span><kbd>Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}
