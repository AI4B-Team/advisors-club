// Purchase attribution for member recommendations.
//
// When a member buys something the Persona recommended in the last 30 days,
// the purchase is credited back to that recommendation so the creator can see
// which suggestions genuinely helped — and so the engine can learn.

import { onPurchase } from "@/lib/commerce/checkout";
import { getRecoEvents, trackReco } from "./reco-events";

const WINDOW = 30 * 86_400_000;
let attached = false;

export function attachRecoAttribution(): void {
  if (attached || typeof window === "undefined") return;
  attached = true;
  onPurchase(({ ref, viewer }) => {
    const nodeId = `${ref.kind}:${ref.id}`;
    const seen = getRecoEvents().find(
      e => e.nodeId === nodeId && e.memberId === viewer.id &&
        (e.type === "shown" || e.type === "clicked") &&
        Date.now() - new Date(e.at).getTime() < WINDOW,
    );
    if (!seen) return;
    trackReco({ nodeId, title: seen.title, owned: false, paid: true, type: "purchased", memberId: viewer.id });
  });
}
