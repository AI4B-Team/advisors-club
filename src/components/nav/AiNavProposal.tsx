// Shared review surface for an AI-proposed navigation structure.
//
// AI drafts it, the creator edits it here, and applying it writes into the one
// shared navigation config (Settings → Club Navigation) — no second nav system.

import { Loader2, RotateCw, Sparkles, X } from "lucide-react";
import { NavIcon } from "@/lib/nav/icons";
import { DEFAULT_MEMBER_NAV, type NavItemType } from "@/lib/nav/config";
import type { NavProposalItem } from "@/lib/nav/ai";

function iconFor(type: NavItemType) {
  return DEFAULT_MEMBER_NAV.find(i => i.type === type)?.icon ?? "apps";
}

function typeLabel(type: NavItemType) {
  return DEFAULT_MEMBER_NAV.find(i => i.type === type)?.label ?? type;
}

export function AiNavProposal({
  items, setItems, rationale, busy, onRegenerate,
}: {
  items: NavProposalItem[];
  setItems: (rows: NavProposalItem[]) => void;
  rationale?: string;
  busy?: boolean;
  onRegenerate?: () => void;
}) {
  const patch = (i: number, next: Partial<NavProposalItem>) =>
    setItems(items.map((row, idx) => (idx === i ? { ...row, ...next } : row)));

  return (
    <div className="ainav">
      <div className="ainav-hd">
        <span className="ainav-ico"><Sparkles size={15} /></span>
        <div>
          <strong>Your Starting Navigation</strong>
          <p>{rationale || "AI Named These For Your Business. Rename Anything — The Underlying Content Never Changes."}</p>
        </div>
        {onRegenerate && (
          <button className="ainav-regen" onClick={onRegenerate} disabled={busy}>
            {busy ? <Loader2 size={13} className="ob-spin" /> : <RotateCw size={13} />} Regenerate
          </button>
        )}
      </div>

      <div className="ainav-rows">
        <div className="ainav-row ainav-row-locked">
          <span className="ainav-i"><NavIcon name="home" size={16} /></span>
          <span className="ainav-name">Home</span>
          <span className="ainav-type">Home</span>
        </div>

        {items.map((row, i) => (
          <div className="ainav-row" key={`${row.type}-${i}`}>
            <span className="ainav-i"><NavIcon name={iconFor(row.type)} size={16} /></span>
            <input
              className="ainav-input"
              value={row.label}
              onChange={e => patch(i, { label: e.target.value })}
              aria-label={`Navigation label for ${typeLabel(row.type)}`}
            />
            <span className="ainav-type">{typeLabel(row.type)}</span>
            <button
              className="ainav-x"
              onClick={() => setItems(items.filter((_, idx) => idx !== i))}
              aria-label={`Remove ${row.label} from navigation`}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <p className="ainav-foot">
        This Only Sets Your Starting Menu. You Can Rename, Reorder, Hide Or Add Items Anytime In Settings → Club Navigation.
      </p>
    </div>
  );
}
