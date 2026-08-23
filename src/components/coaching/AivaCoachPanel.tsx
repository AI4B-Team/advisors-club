import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import { aivaCoachingInsight } from "@/lib/ai.functions";

type Preset = { label: string; prompt: string; kind?: "attention" | "prep" | "goal" | "ask" };

export function AivaCoachPanel({
  title = "AIVA Coaching Intelligence",
  subtitle = "AIVA reads your real client data and tells you where to spend your time.",
  snapshot,
  presets,
  defaultKind = "ask",
  compact = false,
}: {
  title?: string;
  subtitle?: string;
  snapshot: () => string;
  presets: Preset[];
  defaultKind?: "attention" | "prep" | "goal" | "ask";
  compact?: boolean;
}) {
  const [input, setInput] = useState("");
  const [reply, setReply] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(prompt: string, kind: Preset["kind"]) {
    const snap = snapshot();
    if (!snap.trim()) { setError("There isn't enough data here yet for AIVA to read."); return; }
    setBusy(true); setError(null); setReply("");
    try {
      const res = await aivaCoachingInsight({ data: { kind: kind ?? defaultKind, prompt, snapshot: snap } });
      if (res.error) setError(res.error); else setReply(res.reply);
    } catch {
      setError("AIVA is unavailable right now.");
    } finally { setBusy(false); }
  }

  return (
    <section className={`coach-aiva${compact ? " is-compact" : ""}`}>
      <header className="coach-aiva-head">
        <span className="coach-aiva-icon"><Sparkles size={compact ? 15 : 18} /></span>
        <div>
          <h3>{title}</h3>
          {!compact && <p>{subtitle}</p>}
        </div>
      </header>

      <div className="coach-aiva-chips">
        {presets.map(p => (
          <button key={p.label} className="coach-chip" disabled={busy} onClick={() => run(p.prompt, p.kind)}>
            {p.label}
          </button>
        ))}
      </div>

      <form
        className="coach-aiva-form"
        onSubmit={(e) => { e.preventDefault(); if (input.trim() && !busy) { run(input.trim(), "ask"); setInput(""); } }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AIVA About Your Clients…"
          aria-label="Ask AIVA about your clients"
        />
        <button type="submit" disabled={busy || !input.trim()} aria-label="Ask AIVA">
          {busy ? <Loader2 size={14} className="coach-spin" /> : <ArrowRight size={14} />}
        </button>
      </form>

      {busy && <div className="coach-aiva-busy"><Loader2 size={14} className="coach-spin" /> AIVA Is Reading Your Data…</div>}
      {error && <div className="coach-aiva-error">{error}</div>}
      {reply && <div className="coach-aiva-reply"><ReactMarkdown>{reply}</ReactMarkdown></div>}
    </section>
  );
}
