import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, ArrowUp, Loader2, Check, X } from "lucide-react";
import { aivaDesignLayout } from "@/lib/ai.functions";
import { blocksForPage, defForType } from "@/lib/customize/blocks";
import type { PageId, Theme } from "@/lib/customize/types";

const EXAMPLES = [
  "Make My Home Page Focus On Accountability, Upcoming Coaching Calls, And Course Progress.",
  "Make This Feel Like A Premium Mastermind.",
  "Put Community First And Keep Learning Below It.",
];

export function AivaDesignBar({
  page, currentTypes, clubName, onApply,
}: {
  page: PageId;
  currentTypes: string[];
  clubName: string;
  onApply: (blocks: string[], theme: Partial<Theme> | null) => void;
}) {
  const run = useServerFn(aivaDesignLayout);
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposal, setProposal] = useState<{ blocks: string[]; theme: Record<string, string> | null; notes: string } | null>(null);

  async function submit(text?: string) {
    const q = (text ?? prompt).trim();
    if (!q || busy) return;
    setBusy(true); setError(null); setProposal(null);
    try {
      const allowed = blocksForPage(page).map(b => b.type);
      const res = await run({ data: { prompt: q, page, allowed, current: currentTypes, clubName } });
      if (res.error) setError(res.error);
      else setProposal({ blocks: res.blocks, theme: res.theme, notes: res.notes });
    } catch {
      setError("AIVA is unavailable right now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="cz-aiva">
      <div className="cz-aiva-row">
        <span className="cz-aiva-chip"><Sparkles size={12} /> Design With AIVA</span>
        <input
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") submit(); }}
          placeholder="Describe The Page You Want — AIVA Arranges The Blocks."
        />
        <button className="cz-aiva-go" onClick={() => submit()} disabled={busy || !prompt.trim()}>
          {busy ? <Loader2 size={14} className="cz-spin" /> : <ArrowUp size={14} />}
        </button>
      </div>
      {!proposal && !error ? (
        <div className="cz-aiva-ex">
          {EXAMPLES.map(x => <button key={x} onClick={() => { setPrompt(x); submit(x); }}>{x}</button>)}
        </div>
      ) : null}
      {error ? <div className="cz-aiva-err">{error}</div> : null}
      {proposal ? (
        <div className="cz-aiva-prop">
          <div className="cz-aiva-prop-head">
            <strong>AIVA Proposes This Arrangement</strong>
            <button className="cz-x" onClick={() => setProposal(null)} aria-label="Dismiss"><X size={13} /></button>
          </div>
          {proposal.notes ? <p>{proposal.notes}</p> : null}
          <div className="cz-aiva-blocks">
            {proposal.blocks.map((t, i) => (
              <span key={`${t}-${i}`} className="cz-aiva-block">{i + 1}. {defForType(t)?.label ?? t}</span>
            ))}
            {proposal.theme
              ? Object.entries(proposal.theme).map(([k, v]) => <span key={k} className="cz-aiva-theme">{k}: {v}</span>)
              : null}
          </div>
          <div className="cz-aiva-actions">
            <button className="cz-primary sm" onClick={() => { onApply(proposal.blocks, proposal.theme as Partial<Theme> | null); setProposal(null); setPrompt(""); }}>
              <Check size={13} /> Apply Arrangement
            </button>
            <button className="cz-ghost sm" onClick={() => setProposal(null)}>Discard</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
