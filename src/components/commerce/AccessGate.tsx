import { useState, type ReactNode } from "react";
import { Check, Lock, Sparkles } from "lucide-react";
import { useAccess } from "@/hooks/use-commerce";
import {
  accessLabel, includedWithLabel, offerPriceLabel, ruleLabel,
  type AccessPolicy, type ProductRef,
} from "@/lib/commerce";

/**
 * The shared paywall / upgrade surface for every monetizable content type.
 *
 * Features hand it a product ref, its policy and the presentation copy; the
 * gate resolves access centrally and renders either the real experience, a
 * teaser with the upgrade panel beneath it, or the upgrade panel alone.
 */
export function AccessGate({
  productRef,
  policy,
  title,
  description,
  icon,
  accent = "#F5A623",
  teaser,
  children,
}: {
  productRef: ProductRef;
  policy: AccessPolicy;
  title: string;
  description?: string;
  icon?: ReactNode;
  accent?: string;
  /** Optional blurred preview shown above the upgrade panel. */
  teaser?: ReactNode;
  children: ReactNode;
}) {
  const { decision, buy } = useAccess(productRef, policy);
  const [busy, setBusy] = useState(false);

  if (decision.allowed) return <>{children}</>;

  if (decision.reason === "admin-only") {
    return (
      <div className="cmx-gate" style={{ ["--club" as string]: accent }}>
        <div className="cmx-lock"><Lock size={18} /></div>
        <h2 className="cmx-gate-t">{title} Isn't Available To Members</h2>
        <p className="cmx-gate-d">This Tool Is Kept For The Club Team Only.</p>
      </div>
    );
  }

  const offer = decision.offer;
  const included = includedWithLabel(decision);

  async function unlock() {
    if (!offer) return;
    setBusy(true);
    await buy(offer);
    setBusy(false);
  }

  return (
    <div className="cmx-wrap" style={{ ["--club" as string]: accent }}>
      {teaser && (
        <div className="cmx-teaser">
          <div className="cmx-teaser-inner" aria-hidden>{teaser}</div>
          <span className="cmx-teaser-tag"><Lock size={12} /> Preview</span>
        </div>
      )}

      <div className="cmx-gate">
        <div className="cmx-lock">{icon ?? <Sparkles size={18} />}</div>
        <h2 className="cmx-gate-t">{title}</h2>
        {(offer?.benefit || description) && <p className="cmx-gate-d">{offer?.benefit || description}</p>}
        {offer?.purchaseDescription && <p className="cmx-gate-copy">{offer.purchaseDescription}</p>}

        {offer?.includes?.length ? (
          <ul className="cmx-includes">
            {offer.includes.map((i, n) => <li key={n}><Check size={13} /> {i}</li>)}
          </ul>
        ) : null}

        {offer ? (
          <>
            <div className="cmx-price">
              {offer.compareAtPrice ? <s>${offer.compareAtPrice}</s> : null}
              <strong>{offerPriceLabel(offer)}</strong>
              {!offer.interval && <span>One-Time</span>}
            </div>
            <button className="cmx-cta" onClick={unlock} disabled={busy}>
              {busy ? "Unlocking…" : offer.ctaLabel || `Unlock For ${offerPriceLabel(offer)}`}
            </button>
          </>
        ) : (
          <div className="cmx-paths">
            <span className="cmx-paths-t">How To Unlock</span>
            {decision.unlockPaths.length
              ? <ul>{decision.unlockPaths.map((r, n) => <li key={n}><Check size={13} /> {ruleLabel(r)}</li>)}</ul>
              : <p className="cmx-gate-copy">{accessLabel(policy)}</p>}
          </div>
        )}

        {offer && included && <p className="cmx-included">{included}</p>}
      </div>
    </div>
  );
}

/** Small lock chip for cards and lists. */
export function AccessChip({ policy }: { policy: AccessPolicy }) {
  if (policy.mode === "free") return null;
  return <span className="cmx-chip"><Lock size={11} /> {accessLabel(policy)}</span>;
}
