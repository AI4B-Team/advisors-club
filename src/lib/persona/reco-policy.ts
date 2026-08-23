// Member-facing recommendation policy.
//
// The AI Persona may point a member toward an existing resource, app, course,
// coaching program, event or offer — but only when it genuinely helps, and
// only inside the limits the creator sets here. Nothing aggressive is ever
// enabled by default: the shipped mode is "conservative".

export type RecoMode = "off" | "conservative" | "balanced" | "growth";

export const RECO_MODES: { id: RecoMode; label: string; hint: string }[] = [
  { id: "off", label: "Off", hint: "Never Recommend Products. Help Only." },
  { id: "conservative", label: "Conservative", hint: "Rarely. Only When Clearly Relevant." },
  { id: "balanced", label: "Balanced", hint: "Suggest When It Genuinely Helps." },
  { id: "growth", label: "Growth", hint: "More Often, Still Help-First." },
];

export type RecoCategoryId =
  | "free-resources" | "included" | "paid" | "coaching" | "events";

export const RECO_CATEGORIES: { id: RecoCategoryId; label: string; hint: string }[] = [
  { id: "free-resources", label: "Recommend Free Resources", hint: "Guides, Templates And Free Tools." },
  { id: "included", label: "Recommend Included Products", hint: "Things The Member Already Has Access To." },
  { id: "paid", label: "Recommend Paid Products", hint: "Courses, Apps And Offers They Don't Own Yet." },
  { id: "coaching", label: "Recommend Coaching", hint: "1:1 And Group Coaching Programs." },
  { id: "events", label: "Recommend Events", hint: "Live Calls, Workshops And Replays." },
];

export type RecoFrequency = {
  /** Hard cap on recommendations inside a single conversation. */
  maxPerConversation: number;
  /** Member turns that must pass between two recommendations. */
  minTurnsBetween: number;
  /** Days before the same product may be recommended to the same member again. */
  cooldownDays: number;
  /** Cap on PAID recommendations per conversation. */
  maxPaidPerConversation: number;
};

export type RecoPolicy = {
  version: 1;
  mode: RecoMode;
  categories: Record<RecoCategoryId, boolean>;
  frequency: RecoFrequency;
  /** Stop recommending a product after this many dismissals by a member. */
  dismissLimit: number;
  /** Node ids the Persona may never recommend. */
  blocked: string[];
};

export const MODE_FREQUENCY: Record<RecoMode, RecoFrequency> = {
  off: { maxPerConversation: 0, minTurnsBetween: 99, cooldownDays: 365, maxPaidPerConversation: 0 },
  conservative: { maxPerConversation: 1, minTurnsBetween: 5, cooldownDays: 21, maxPaidPerConversation: 1 },
  balanced: { maxPerConversation: 2, minTurnsBetween: 3, cooldownDays: 10, maxPaidPerConversation: 1 },
  growth: { maxPerConversation: 4, minTurnsBetween: 1, cooldownDays: 4, maxPaidPerConversation: 2 },
};

/** How relevant a match must be before it may be shown, per mode. */
export const MODE_THRESHOLD: Record<RecoMode, number> = {
  off: 99, conservative: 0.55, balanced: 0.38, growth: 0.24,
};

export const RECO_POLICY_DEFAULTS: RecoPolicy = {
  version: 1,
  // Deliberately not "growth". Selling is opt-in, never a default.
  mode: "conservative",
  categories: {
    "free-resources": true,
    included: true,
    paid: false,
    coaching: false,
    events: true,
  },
  frequency: { ...MODE_FREQUENCY.conservative },
  dismissLimit: 2,
  blocked: [],
};

const KEY = "ac_persona_recos_v1";
export const RECO_POLICY_EVENT = "ac:persona-reco-policy";

export function getRecoPolicy(): RecoPolicy {
  if (typeof window === "undefined") return { ...RECO_POLICY_DEFAULTS };
  let data: Partial<RecoPolicy> = {};
  try { data = JSON.parse(window.localStorage.getItem(KEY) || "{}"); } catch { data = {}; }
  return {
    ...RECO_POLICY_DEFAULTS,
    ...data,
    categories: { ...RECO_POLICY_DEFAULTS.categories, ...(data.categories || {}) },
    frequency: { ...RECO_POLICY_DEFAULTS.frequency, ...(data.frequency || {}) },
    blocked: data.blocked || [],
  };
}

export function setRecoPolicy(patch: Partial<RecoPolicy>): RecoPolicy {
  const next: RecoPolicy = { ...getRecoPolicy(), ...patch };
  // Switching modes resets frequency to that mode's baseline unless the
  // caller explicitly passed its own numbers.
  if (patch.mode && !patch.frequency) next.frequency = { ...MODE_FREQUENCY[patch.mode] };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(RECO_POLICY_EVENT));
  }
  return next;
}

export function subscribeRecoPolicy(fn: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const h = () => fn();
  window.addEventListener(RECO_POLICY_EVENT, h);
  return () => window.removeEventListener(RECO_POLICY_EVENT, h);
}
