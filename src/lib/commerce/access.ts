// Central access resolution.
//
// One function answers "can this viewer open this product, and if not, how do
// they unlock it?". Every gate in the product — apps today, courses and
// resources next — renders from this decision instead of inventing its own
// permission checks or upgrade copy.

import { ownsProduct, type Entitlement } from "./entitlements";
import {
  isPurchasable, policyRules, ruleLabel,
  type AccessPolicy, type AccessRule, type Offer, type ProductRef,
} from "./types";

export type CommerceViewer = {
  id: string;
  name?: string;
  isAdmin: boolean;
  /** The member's current plan / membership tier name, e.g. "Pro". */
  plan?: string;
  /** True when the plan is a paid membership (any tier above free). */
  paidMember?: boolean;
  courseIds?: string[];
  programIds?: string[];
};

export type DenyReason = "locked" | "admin-only" | "purchase-required";

export type AccessDecision = {
  allowed: boolean;
  /** Why the viewer already has it — used for the "You Own This" note. */
  grantedBy?: "admin" | "owned" | AccessRule["kind"];
  reason?: DenyReason;
  /** Every remaining way to unlock, in the order they should be shown. */
  unlockPaths: AccessRule[];
  /** Present when buying is one of the unlock paths. */
  offer?: Offer;
};

export function resolveAccess(
  ref: ProductRef,
  policy: AccessPolicy,
  viewer: CommerceViewer,
  entitlements?: Entitlement[],
): AccessDecision {
  if (viewer.isAdmin) return { allowed: true, grantedBy: "admin", unlockPaths: [] };
  if (policy.mode === "free") return { allowed: true, unlockPaths: [] };
  if (policy.mode === "admin") return { allowed: false, reason: "admin-only", unlockPaths: [] };

  // A purchase or a manual grant always wins, whatever the policy says today.
  if (ownsProduct(ref, viewer.id, entitlements)) {
    return { allowed: true, grantedBy: "owned", unlockPaths: [] };
  }

  const rules = policyRules(policy);
  for (const rule of rules) {
    if (satisfies(rule, viewer)) return { allowed: true, grantedBy: rule.kind, unlockPaths: [] };
  }

  const buyable = isPurchasable(policy);
  return {
    allowed: false,
    reason: buyable ? "purchase-required" : "locked",
    unlockPaths: rules.filter(r => r.kind !== "member"),
    offer: buyable ? policy.offer : undefined,
  };
}

function satisfies(rule: AccessRule, v: CommerceViewer): boolean {
  switch (rule.kind) {
    case "membership": return Boolean(v.paidMember);
    case "plan": return normalize(v.plan) === normalize(rule.plan);
    case "course": return Boolean(v.courseIds?.includes(rule.courseId));
    case "coaching": return Boolean(v.programIds?.includes(rule.programId));
    case "member": return rule.memberId === v.id;
    case "purchase": return false; // resolved through the entitlement ledger
  }
}

function normalize(s?: string) {
  return (s ?? "").toLowerCase().replace(/\s*(plan|member|membership)\s*/g, "").trim();
}

/** Human sentence for "how else can I get in", excluding the purchase path. */
export function includedWithLabel(decision: AccessDecision): string | null {
  const included = decision.unlockPaths.filter(r => r.kind !== "purchase");
  if (!included.length) return null;
  return `Also Included With ${included.map(ruleLabel).join(" Or ")}`;
}
