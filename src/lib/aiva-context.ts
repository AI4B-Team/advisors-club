// AIVA Business Context — the reusable knowledge layer captured during onboarding.
// This is intentionally NOT disposable wizard state: courses, community content,
// coaching, funnels, landing pages, recommendations, member AI and automations all
// read from here. Backed by localStorage (same pattern as gs-store).

export type LearnSourceKind = "website" | "youtube" | "social" | "file" | "paste";

export type LearnSource = {
  id: string;
  kind: LearnSourceKind;
  /** URL, file name, or a short label for pasted content */
  label: string;
  /** Pasted text, when kind === "paste" */
  content?: string;
  addedAt: string;
};

/** Everything AIVA extracted. Always user-reviewable — never treated as verified truth. */
export type BusinessProfile = {
  business: string;
  expertise: string;
  audience: string;
  transformation: string;
  topics: string[];
  offers: string[];
  businessModel: string;
  brandVoice: string;
  /** Set to true only once a human has confirmed the extracted profile. */
  confirmed: boolean;
  /** How the profile was produced, so the UI can be honest about it. */
  origin: "ai" | "manual" | "empty";
};

export type MonetizationId =
  | "membership" | "courses" | "coaching-1on1" | "coaching-group"
  | "mastermind" | "events" | "digital-products" | "free-community" | "unsure";

export type ClubComponentId =
  | "community" | "starter-course" | "coaching-program" | "challenge"
  | "events" | "resources" | "member-onboarding" | "persona";

/**
 * Member-facing AI identity captured during onboarding. AIVA is the ADMIN
 * business operator and is never offered as a member-facing identity, so the
 * only choices are the expert's own persona or a separate AI identity.
 */
export type PersonaIdentityMode = "expert" | "separate";

export type PersonaSeed = {
  identityMode: PersonaIdentityMode;
  name: string;
  personality: string;
  avatarUrl: string;
  /** AI disclosure is mandatory in the product — kept here for copy, not as an opt-out. */
  disclosure: string;
  configured: boolean;
};

export type AivaContext = {
  version: 1;
  /** Raw first-person description the advisor gave AIVA. */
  description: string;
  websiteUrl: string;
  sources: LearnSource[];
  profile: BusinessProfile;
  monetization: MonetizationId[];
  components: ClubComponentId[];
  brand: { clubName: string; logoUrl: string; color: string; slug: string };
  persona: PersonaSeed;
  payments: { connected: boolean; deferred: boolean };
  /** Steps the build actually completed and persisted. */
  built: string[];
  onboardingCompleted: boolean;
  /** Launch checklist items the admin has ticked off / the app has satisfied. */
  checklistDone: string[];
  checklistDismissed: boolean;
};

const KEY = "aiva-context-v1";

export const EMPTY_PROFILE: BusinessProfile = {
  business: "",
  expertise: "",
  audience: "",
  transformation: "",
  topics: [],
  offers: [],
  businessModel: "",
  brandVoice: "",
  confirmed: false,
  origin: "empty",
};

const DEFAULTS: AivaContext = {
  version: 1,
  description: "",
  websiteUrl: "",
  sources: [],
  profile: EMPTY_PROFILE,
  monetization: [],
  components: [],
  brand: { clubName: "", logoUrl: "", color: "#F5A623", slug: "" },
  persona: {
    identityMode: "expert",
    name: "",
    personality: "",
    avatarUrl: "",
    disclosure: "You're chatting with AI. Responses are generated and may be imperfect.",
    configured: false,
  },
  payments: { connected: false, deferred: false },
  built: [],
  onboardingCompleted: false,
  checklistDone: [],
  checklistDismissed: false,
};

type Listener = (c: AivaContext) => void;
const listeners = new Set<Listener>();

function safeParse(raw: string | null): Partial<AivaContext> {
  if (!raw) return {};
  try { return JSON.parse(raw) as Partial<AivaContext>; } catch { return {}; }
}

export function getAivaContext(): AivaContext {
  if (typeof window === "undefined") return { ...DEFAULTS };
  const data = safeParse(window.localStorage.getItem(KEY));
  return {
    ...DEFAULTS,
    ...data,
    profile: { ...EMPTY_PROFILE, ...(data.profile || {}) },
    brand: { ...DEFAULTS.brand, ...(data.brand || {}) },
    persona: { ...DEFAULTS.persona, ...(data.persona || {}) },
    payments: { ...DEFAULTS.payments, ...(data.payments || {}) },
    sources: data.sources || [],
  };
}

export function setAivaContext(partial: Partial<AivaContext>): AivaContext {
  const next: AivaContext = { ...getAivaContext(), ...partial };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
  }
  listeners.forEach(l => l(next));
  return next;
}

export function markBuilt(id: string): AivaContext {
  const cur = getAivaContext();
  if (cur.built.includes(id)) return cur;
  return setAivaContext({ built: [...cur.built, id] });
}

export function markChecklist(id: string): AivaContext {
  const cur = getAivaContext();
  if (cur.checklistDone.includes(id)) return cur;
  return setAivaContext({ checklistDone: [...cur.checklistDone, id] });
}

export function subscribeAivaContext(fn: Listener): () => void {
  listeners.add(fn);
  const onStorage = () => fn(getAivaContext());
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

export function resetAivaContext() { setAivaContext(DEFAULTS); }

/* ---------- Shared option catalogs (reused by onboarding + later surfaces) ---------- */

export const MONETIZATION_OPTIONS: { id: MonetizationId; label: string; desc: string }[] = [
  { id: "membership",       label: "Paid Membership",              desc: "Recurring access to your community and content." },
  { id: "courses",          label: "Online Courses",               desc: "Self-paced programs your members buy or unlock." },
  { id: "coaching-1on1",    label: "1:1 Coaching",                 desc: "Private sessions booked directly with you." },
  { id: "coaching-group",   label: "Group Coaching",               desc: "Cohort calls and shared accountability." },
  { id: "mastermind",       label: "Mastermind",                   desc: "High-touch peer group for advanced members." },
  { id: "events",           label: "Events & Workshops",           desc: "Live sessions, webinars, and in-person meetups." },
  { id: "digital-products", label: "Digital Products",             desc: "Templates, playbooks, and downloads." },
  { id: "free-community",   label: "Free Community With Paid Offers", desc: "Open community that feeds paid programs." },
  { id: "unsure",           label: "Not Sure Yet",                 desc: "Explore it later — AIVA will suggest a path." },
];

export const COMPONENT_CATALOG: { id: ClubComponentId; label: string; desc: string }[] = [
  { id: "community",         label: "Community",            desc: "Feed, discussions, and announcements." },
  { id: "starter-course",    label: "Starter Course",       desc: "A first course outline drafted from your expertise." },
  { id: "coaching-program",  label: "Coaching Program",     desc: "Sessions, booking, and client tracking." },
  { id: "challenge",         label: "Challenge",            desc: "A short guided sprint to activate members." },
  { id: "events",            label: "Events",               desc: "Live calls, workshops, and replays." },
  { id: "resources",         label: "Resources",            desc: "A library for templates, files, and links." },
  { id: "member-onboarding", label: "Member Onboarding",    desc: "A welcome path so new members know where to start." },
  { id: "persona",           label: "AI Persona",           desc: "Your member-facing AI, trained on your content and method." },
];

/** Curated — never the full feature list. Driven by how the advisor wants to earn. */
export function recommendComponents(monetization: MonetizationId[]): ClubComponentId[] {
  const set = new Set<ClubComponentId>(["community", "member-onboarding"]);
  const has = (m: MonetizationId) => monetization.includes(m);
  if (has("courses") || has("membership") || has("free-community") || monetization.length === 0) set.add("starter-course");
  if (has("coaching-1on1") || has("coaching-group") || has("mastermind")) set.add("coaching-program");
  if (has("events") || has("mastermind") || has("coaching-group")) set.add("events");
  if (has("digital-products") || has("membership")) set.add("resources");
  if (has("free-community") || has("membership") || has("unsure")) set.add("challenge");
  set.add("persona");
  return COMPONENT_CATALOG.map(c => c.id).filter(id => set.has(id));
}

export function slugifyClub(s: string) {
  return s.toLowerCase().trim().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
}
