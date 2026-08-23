// Builder Core — one AI page bar for every page type.
//
// Club surfaces get an arrangement (blocks + optional theme); marketing
// surfaces get a written draft (blocks + copy). Both calls go through the
// shared AI gateway server functions.

import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, ArrowUp, Loader2, Check, X } from "lucide-react";
import { aivaBuildSalesPage, aivaDesignLayout } from "@/lib/ai.functions";
import { blocksForPageType, blockLabel } from "@/lib/builder/catalog";
import { pageTypeConfig } from "@/lib/builder/page-types";
import type { BlockDraft } from "@/lib/builder/session";
import type { BuilderTheme, PageTypeId } from "@/lib/builder/types";
import { businessBrief } from "@/lib/sell/knowledge";

const LEGACY_PAGE: Record<string, string> = {
  "club-home": "home",
  "club-community": "community",
  "club-course-home": "course-home",
  "club-member-dashboard": "member-dashboard",
  "club-public": "public-club",
};

const EXAMPLES: Record<"app" | "marketing", string[]> = {
  app: [
    "Make My Home Page Focus On Accountability, Upcoming Coaching Calls, And Course Progress.",
    "Make This Feel Like A Premium Mastermind.",
    "Put Community First And Keep Learning Below It.",
  ],
  marketing: [
    "Build A Landing Page For My $997 8-Week Program.",
    "Create A Page For My $49/Month Membership.",
    "Draft My Public Club Page From What You Know About My Business.",
  ],
};

export function AiPageBar({
  pageType, currentTypes, clubName, onApply,
}: {
  pageType: PageTypeId;
  currentTypes: string[];
  clubName: string;
  onApply: (blocks: BlockDraft[], theme: Partial<BuilderTheme> | null) => void;
}) {
  const cfg = pageTypeConfig(pageType);
  const marketing = cfg.surface === "marketing";
  const runSales = useServerFn(aivaBuildSalesPage);
  const runDesign = useServerFn(aivaDesignLayout);

  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposal, setProposal] = useState<{ blocks: BlockDraft[]; theme: Partial<BuilderTheme> | null; notes: string } | null>(null);

  async function submit(text?: string) {
    const q = (text ?? prompt).trim();
    if (!q || busy) return;
    setBusy(true); setError(null); setProposal(null);
    try {
      const allowed = blocksForPageType(pageType).map(b => b.type);
      if (marketing) {
        const res = await runSales({
          data: { prompt: q, surface: pageType === "club-public" ? "club" : "landing", allowed, brief: businessBrief() },
        });
        if (res.error) setError(res.error);
        else setProposal({ blocks: res.blocks, theme: null, notes: res.notes });
      } else {
        const res = await runDesign({
          data: { prompt: q, page: LEGACY_PAGE[pageType] ?? "home", allowed, current: currentTypes, clubName },
        });
        if (res.error) setError(res.error);
        else setProposal({
          blocks: res.blocks.map(t => ({ type: t })),
          theme: (res.theme as Partial<BuilderTheme> | null) ?? null,
          notes: res.notes,
        });
      }
    } catch {
      setError("AIVA is unavailable right now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="cz-aiva">
      <div className="cz-aiva-row">
        <span className="cz-aiva-chip"><Sparkles size={12} /> {marketing ? "Build With AIVA" : "Design With AIVA"}</span>
        <input
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") submit(); }}
          placeholder={marketing
            ? "Describe Your Offer — AIVA Writes The Page From What It Knows About Your Business."
            : "Describe The Page You Want — AIVA Arranges The Blocks."}
        />
        <button className="cz-aiva-go" onClick={() => submit()} disabled={busy || !prompt.trim()} aria-label="Ask AIVA">
          {busy ? <Loader2 size={14} className="cz-spin" /> : <ArrowUp size={14} />}
        </button>
      </div>

      {!proposal && !error && !busy ? (
        <div className="cz-aiva-ex">
          {EXAMPLES[marketing ? "marketing" : "app"].map(x => (
            <button key={x} onClick={() => { setPrompt(x); submit(x); }}>{x}</button>
          ))}
        </div>
      ) : null}

      {busy ? <div className="cz-aiva-note">AIVA Is Drafting This Page…</div> : null}
      {error ? <div className="cz-aiva-err">{error} <button onClick={() => setError(null)} aria-label="Dismiss"><X size={12} /></button></div> : null}

      {proposal ? (
        <div className="cz-aiva-prop">
          <div className="cz-aiva-note">{proposal.notes || "AIVA Drafted This Page."}</div>
          <div className="cz-aiva-chips">
            {proposal.blocks.map((b, i) => <span key={`${b.type}-${i}`}>{blockLabel(b.type)}</span>)}
            {proposal.theme
              ? Object.entries(proposal.theme).map(([k, v]) => <span key={k}>{k}: {String(v)}</span>)
              : null}
          </div>
          <div className="cz-aiva-acts">
            <button className="cz-btn-mini primary" onClick={() => { onApply(proposal.blocks, proposal.theme); setProposal(null); setPrompt(""); }}>
              <Check size={12} /> Apply Draft
            </button>
            <button className="cz-btn-mini" onClick={() => setProposal(null)}>Discard</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
