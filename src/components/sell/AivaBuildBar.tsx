import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, ArrowUp, Loader2, Check, X } from "lucide-react";
import { aivaBuildSalesPage } from "@/lib/ai.functions";
import { sellBlocksForSurface, sellDefForType } from "@/lib/sell/blocks";
import { businessBrief } from "@/lib/sell/knowledge";
import type { Surface } from "@/lib/sell/types";

const EXAMPLES: Record<Surface, string[]> = {
  landing: [
    "Build A Landing Page For My $997 8-Week Wholesaling Program.",
    "Create A Page For My $49/Month Fitness Membership.",
    "Write An Application Page For My High-Ticket Mastermind.",
  ],
  club: [
    "Draft My Public Club Page From What You Know About My Business.",
    "Make It Lead With Community And Coaching.",
    "Rewrite It For Complete Beginners.",
  ],
};

export type Draft = { type: string; props: Record<string, string> };

export function AivaBuildBar({
  surface, onApply, label = "Build With AIVA",
}: {
  surface: Surface;
  onApply: (blocks: Draft[]) => void;
  label?: string;
}) {
  const run = useServerFn(aivaBuildSalesPage);
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposal, setProposal] = useState<{ blocks: Draft[]; notes: string } | null>(null);

  async function submit(text?: string) {
    const q = (text ?? prompt).trim();
    if (!q || busy) return;
    setBusy(true); setError(null); setProposal(null);
    try {
      const allowed = sellBlocksForSurface(surface).map(b => b.type);
      const res = await run({ data: { prompt: q, surface, allowed, brief: businessBrief() } });
      if (res.error) setError(res.error);
      else setProposal({ blocks: res.blocks, notes: res.notes });
    } catch {
      setError("AIVA is unavailable right now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="cz-aiva">
      <div className="cz-aiva-row">
        <span className="cz-aiva-chip"><Sparkles size={12} /> {label}</span>
        <input
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") submit(); }}
          placeholder="Describe Your Offer — AIVA Writes The Page From What It Knows About Your Business."
        />
        <button className="cz-aiva-go" onClick={() => submit()} disabled={busy || !prompt.trim()} aria-label="Ask AIVA">
          {busy ? <Loader2 size={14} className="cz-spin" /> : <ArrowUp size={14} />}
        </button>
      </div>

      {!proposal && !error && !busy ? (
        <div className="cz-aiva-ex">
          {EXAMPLES[surface].map(x => <button key={x} onClick={() => { setPrompt(x); submit(x); }}>{x}</button>)}
        </div>
      ) : null}

      {busy ? <div className="cz-aiva-note">AIVA Is Drafting Your Page From Your Business Knowledge…</div> : null}
      {error ? <div className="cz-aiva-err">{error} <button onClick={() => setError(null)}><X size={12} /></button></div> : null}

      {proposal ? (
        <div className="cz-aiva-prop">
          <div className="cz-aiva-note">{proposal.notes || "AIVA Drafted This Page."}</div>
          <div className="cz-aiva-chips">
            {proposal.blocks.map((b, i) => <span key={i}>{sellDefForType(b.type)?.label ?? b.type}</span>)}
          </div>
          <div className="cz-aiva-acts">
            <button className="cz-btn-mini primary" onClick={() => { onApply(proposal.blocks); setProposal(null); setPrompt(""); }}>
              <Check size={12} /> Apply Draft
            </button>
            <button className="cz-btn-mini" onClick={() => setProposal(null)}>Discard</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
