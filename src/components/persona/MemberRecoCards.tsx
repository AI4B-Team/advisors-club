import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Lock, Sparkles, X } from "lucide-react";
import type { MemberReco } from "@/lib/persona/recommend";
import { trackReco } from "@/lib/persona/reco-events";

/**
 * Help-first recommendation cards, rendered UNDER an answer — never instead
 * of one. Paid items are always labelled as paid, and every card can be
 * dismissed, which teaches the engine to back off.
 */
export function MemberRecoCards({
  recos, memberId, query, onDismiss, onNavigate,
}: {
  recos: MemberReco[];
  memberId: string;
  query: string;
  onDismiss: (nodeId: string) => void;
  onNavigate?: () => void;
}) {
  const nav = useNavigate();
  if (!recos.length) return null;

  return (
    <div className="mrec-wrap">
      {recos.map(r => (
        <div key={r.nodeId} className={`mrec${r.paid ? " paid" : ""}`}>
          <span className="mrec-ic">{r.owned ? <Sparkles size={13} /> : <Lock size={13} />}</span>
          <div className="mrec-t">
            <div className="mrec-title">
              {r.title}
              {r.owned
                ? <em className="mrec-tag own">Included</em>
                : r.paid
                  ? <em className="mrec-tag pay">Paid{r.priceLabel ? ` · ${r.priceLabel}` : ""}</em>
                  : <em className="mrec-tag free">Free</em>}
            </div>
            <p className="mrec-why">{r.reason}</p>
          </div>
          <button
            className="mrec-go"
            onClick={() => {
              trackReco({ nodeId: r.nodeId, title: r.title, owned: r.owned, paid: r.paid, type: "clicked", query, memberId });
              if (r.href) {
                onNavigate?.();
                void nav({ to: r.href as never });
              }
            }}
          >
            {r.owned ? "Open" : "View"} <ArrowRight size={12} />
          </button>
          <button
            className="mrec-x"
            aria-label={`Dismiss ${r.title}`}
            onClick={() => {
              trackReco({ nodeId: r.nodeId, title: r.title, owned: r.owned, paid: r.paid, type: "dismissed", query, memberId });
              onDismiss(r.nodeId);
            }}
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
