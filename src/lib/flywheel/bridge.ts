// Bridge — the only place that wires existing layers into the lifecycle log.
//
// Feature code stays unchanged: it keeps calling `setOppStatus`, `setRecoStatus`,
// `trackReco`, `purchaseProduct` and `recordSignal` as before. This module
// listens to those stores and records what happened once, in one log, so the
// loop has a continuous history instead of scattered per-feature records.

import { subscribeOppStatuses, getOppStatuses } from "@/lib/opportunities/store";
import { subscribeRecos, getRecos } from "@/lib/recos/store";
import { subscribeEntitlements, getEntitlements } from "@/lib/commerce/entitlements";
import { subscribeRecoEvents, getRecoEvents } from "@/lib/persona/reco-events";
import { logFlywheel } from "./log";
import type { RecoStatus } from "@/lib/recos/types";

let installed = false;
const unsubs: (() => void)[] = [];

/** Safe to call from any admin surface; installs once per page. */
export function initFlywheel(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;

  unsubs.push(
    subscribeOppStatuses(() => {
      for (const [id, status] of Object.entries(getOppStatuses())) {
        if (status === "approved") {
          logFlywheel({
            kind: "approved", actor: "expert", opportunityId: id,
            title: "Opportunity Approved To Build",
            detail: "The Expert Accepted An AI Recommendation.",
            dedupeKey: `opp-approved-${id}`,
          });
        }
        if (status === "completed") {
          logFlywheel({
            kind: "built", actor: "ai", opportunityId: id,
            title: "Product Built From An Opportunity",
            detail: "AI Turned An Observed Pattern Into A Real Product.",
            dedupeKey: `opp-completed-${id}`,
          });
        }
        if (status === "dismissed") {
          logFlywheel({
            kind: "rejected", actor: "expert", opportunityId: id,
            title: "Opportunity Dismissed",
            dedupeKey: `opp-dismissed-${id}`,
          });
        }
      }
    }),
  );

  unsubs.push(
    subscribeRecos(() => {
      for (const r of getRecos()) {
        const map: Partial<Record<RecoStatus, { kind: "recommended" | "approved" | "rejected" | "connected"; title: string; actor: "ai" | "expert" }>> = {
          suggested: { kind: "recommended", title: "AI Suggested A Placement", actor: "ai" },
          approved: { kind: "approved", title: "Placement Approved", actor: "expert" },
          rejected: { kind: "rejected", title: "Placement Rejected", actor: "expert" },
          applied: { kind: "connected", title: "Ecosystem Connection Applied", actor: "ai" },
        };
        const m = map[r.status];
        if (!m) continue;
        logFlywheel({
          kind: m.kind, actor: m.actor, title: m.title,
          detail: r.reason ?? undefined,
          nodeId: r.targetId, recoId: r.id,
          dedupeKey: `reco-${r.status}-${r.id}`,
        });
      }
    }),
  );

  unsubs.push(
    subscribeEntitlements(() => {
      for (const e of getEntitlements()) {
        if (e.source !== "purchase") continue;
        logFlywheel({
          kind: "monetized", actor: "member",
          title: "Purchase Completed",
          detail: `${e.product}${e.amount ? ` · $${e.amount}` : ""}`,
          dedupeKey: `ent-${e.id}`,
        });
      }
    }),
  );

  unsubs.push(
    subscribeRecoEvents(() => {
      for (const e of getRecoEvents()) {
        if (e.type !== "purchased") continue;
        logFlywheel({
          kind: "monetized", actor: "member",
          title: "AI Recommendation Converted",
          detail: "A Member Bought Something The AI Persona Suggested.",
          dedupeKey: `reco-event-${e.id}`,
        });
      }
    }),
  );
}

export function resetFlywheelBridge(): void {
  unsubs.splice(0).forEach(u => u());
  installed = false;
}
