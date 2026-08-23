// Advisors Club commerce — one shared product / access / entitlement model.
//
// Every monetizable thing in the club (apps today; resources, courses,
// coaching and events next) is described by the same `AccessPolicy` and sold
// through the same `Offer`. Features never implement their own payment or
// permission logic — they describe *what* they sell and ask this layer
// whether the current viewer may open it.

/** Every content type that can carry an access policy. */
export type ProductKind = "app" | "course" | "coaching" | "resource" | "event" | "bundle";

export const PRODUCT_KIND_LABEL: Record<ProductKind, string> = {
  app: "App",
  course: "Course",
  coaching: "Coaching Program",
  resource: "Resource",
  event: "Event",
  bundle: "Bundle",
};

/** A stable pointer to any monetizable entity. */
export type ProductRef = { kind: ProductKind; id: string };

export function productKey(ref: ProductRef): string {
  return `${ref.kind}:${ref.id}`;
}

/* ------------------------------------------------------------------ */
/* Offers                                                              */
/* ------------------------------------------------------------------ */

export type BillingInterval = "month" | "year";

/**
 * What the member is asked to buy. The same shape backs one-time purchases
 * and paid upgrades so checkout stays a single code path.
 */
export type Offer = {
  price: number;
  currency?: string;
  /** Omitted for one-time purchases. */
  interval?: BillingInterval;
  /** Optional strike-through price for a launch or member discount. */
  compareAtPrice?: number;
  /** Button copy, e.g. "Unlock App". */
  ctaLabel?: string;
  /** Short benefit line shown on the upgrade screen. */
  benefit?: string;
  /** Longer "what this helps you accomplish" copy for the purchase screen. */
  purchaseDescription?: string;
  /** Bullet points shown under the price. */
  includes?: string[];
};

export function offerPriceLabel(o: Offer | undefined): string {
  if (!o) return "Free";
  const money = `$${o.price}`;
  return o.interval ? `${money}/${o.interval === "year" ? "yr" : "mo"}` : money;
}

/* ------------------------------------------------------------------ */
/* Access policy                                                       */
/* ------------------------------------------------------------------ */

export type AccessMode =
  | "free"
  | "membership"
  | "plan"
  | "course"
  | "coaching"
  | "purchase"
  | "upgrade"
  | "admin"
  | "custom";

export const ACCESS_MODE_LABEL: Record<AccessMode, string> = {
  free: "Free",
  membership: "Included With Membership",
  plan: "Included With Specific Plan",
  course: "Included With Course",
  coaching: "Included With Coaching Program",
  purchase: "One-Time Purchase",
  upgrade: "Paid Upgrade",
  admin: "Admin Only",
  custom: "Custom Access",
};

export const ACCESS_MODE_HINT: Record<AccessMode, string> = {
  free: "Anyone In The Club Can Open It.",
  membership: "Any Paying Member Gets It.",
  plan: "Only The Plans You Choose Get It.",
  course: "Unlocked By Enrolling In A Course.",
  coaching: "Unlocked By Joining A Coaching Program.",
  purchase: "Sold On Its Own For A One-Time Price.",
  upgrade: "Included With Some Plans, Purchasable By Everyone Else.",
  admin: "Only You And Your Team.",
  custom: "Any Of Several Ways To Unlock It.",
};

/** One way to qualify. Custom access is simply a list of these. */
export type AccessRule =
  | { kind: "membership" }
  | { kind: "plan"; plan: string }
  | { kind: "course"; courseId: string; label?: string }
  | { kind: "coaching"; programId: string; label?: string }
  | { kind: "purchase" }
  | { kind: "member"; memberId: string; label?: string };

export type AccessPolicy = {
  mode: AccessMode;
  /** Plans that include this product (mode: plan / upgrade / custom). */
  plans?: string[];
  /** Courses that include it. */
  courseIds?: string[];
  courseLabels?: Record<string, string>;
  /** Coaching programs that include it. */
  programIds?: string[];
  programLabels?: Record<string, string>;
  /** Individually granted members (custom). */
  memberIds?: string[];
  /** Extra qualifying rules for custom access. */
  rules?: AccessRule[];
  /** Required for purchase / upgrade, optional elsewhere. */
  offer?: Offer;
};

export const FREE_ACCESS: AccessPolicy = { mode: "free" };

/** True when the policy can be satisfied by paying. */
export function isPurchasable(p: AccessPolicy): boolean {
  if (!p.offer) return false;
  if (p.mode === "purchase" || p.mode === "upgrade") return true;
  return p.mode === "custom" && (p.rules ?? []).some(r => r.kind === "purchase");
}

/** Short label used on cards and lists. */
export function accessLabel(p: AccessPolicy): string {
  switch (p.mode) {
    case "free": return "Free";
    case "membership": return "Included With Membership";
    case "plan": return p.plans?.length ? `${p.plans.join(" Or ")} Plan` : "Specific Plan";
    case "course": return labelsOf(p.courseIds, p.courseLabels, "Course");
    case "coaching": return labelsOf(p.programIds, p.programLabels, "Coaching Program");
    case "purchase": return p.offer ? `${offerPriceLabel(p.offer)} One-Time` : "One-Time Purchase";
    case "upgrade": {
      const included = p.plans?.length ? `${p.plans.join(" Or ")}` : "Some Plans";
      return p.offer ? `${included} Or ${offerPriceLabel(p.offer)}` : `Included With ${included}`;
    }
    case "admin": return "Admin Only";
    case "custom": return "Custom Access";
  }
}

function labelsOf(ids: string[] | undefined, labels: Record<string, string> | undefined, fallback: string) {
  const named = (ids ?? []).map(id => labels?.[id]).filter(Boolean) as string[];
  if (named.length) return `Included With ${named.join(" Or ")}`;
  return `Included With A ${fallback}`;
}

/** Every rule that could unlock the policy, normalized for the resolver. */
export function policyRules(p: AccessPolicy): AccessRule[] {
  const out: AccessRule[] = [];
  const addPlans = () => (p.plans ?? []).forEach(plan => out.push({ kind: "plan", plan }));
  const addCourses = () => (p.courseIds ?? []).forEach(courseId => out.push({ kind: "course", courseId, label: p.courseLabels?.[courseId] }));
  const addPrograms = () => (p.programIds ?? []).forEach(programId => out.push({ kind: "coaching", programId, label: p.programLabels?.[programId] }));

  switch (p.mode) {
    case "membership": out.push({ kind: "membership" }); break;
    case "plan": addPlans(); break;
    case "course": addCourses(); break;
    case "coaching": addPrograms(); break;
    case "purchase": out.push({ kind: "purchase" }); break;
    case "upgrade": addPlans(); addCourses(); addPrograms(); out.push({ kind: "purchase" }); break;
    case "custom":
      addPlans(); addCourses(); addPrograms();
      (p.memberIds ?? []).forEach(memberId => out.push({ kind: "member", memberId }));
      (p.rules ?? []).forEach(r => out.push(r));
      break;
    default: break;
  }
  return out;
}

export function ruleLabel(r: AccessRule): string {
  switch (r.kind) {
    case "membership": return "Any Paid Membership";
    case "plan": return `${r.plan} Plan`;
    case "course": return r.label ? `The ${r.label} Course` : "An Included Course";
    case "coaching": return r.label ? `${r.label} Coaching` : "An Included Coaching Program";
    case "purchase": return "A One-Time Purchase";
    case "member": return r.label ? `Granted To ${r.label}` : "Individually Granted";
  }
}
