// Cross-section data store backed by localStorage.
// Source of truth for AIVA-built content surfaced in Courses, Coaching,
// Challenges, Events and the Community feed.

export type GSCourse = {
  id: string;
  title: string;
  tagline: string;
  modules: { title: string; lessons: number }[];
  price: number;
  published: boolean;
};

export type GSCoachingProgram = {
  id: string;
  type: "1on1" | "group" | "both";
  name: string;
  desc: string;
  sessionsPerMonth: number;
  price: number;
};

export type GSChallenge = {
  id: string;
  name: string;
  days: 7 | 14 | 30;
  tagline: string;
  tasks: { day: number; label: string }[];
  published: boolean;
};

export type GSEvent = {
  id: string;
  type: "webinar" | "qa" | "workshop" | "summit";
  title: string;
  desc: string;
  date: string;
  time: string;
  maxAttendees: number;
};

export type GSMembership = {
  hasPaid: boolean;
  freeLabel: string;
  paidLabel: string;
  paidPrice: number;
  stripeConnected: boolean;
};

export type GSWelcomePost = {
  title: string;
  body: string;
  published: boolean;
};

export type GSStore = {
  clubName: string;
  clubTagline: string;
  clubDesc: string;
  niche: string;
  coverColor: string;
  course: GSCourse | null;
  coaching: GSCoachingProgram[];
  challenge: GSChallenge | null;
  events: GSEvent[];
  membership: GSMembership;
  welcomePost: GSWelcomePost;
  completedSteps: string[];
  launched: boolean;
};

const KEY = "gs-store-v1";

const DEFAULTS: GSStore = {
  clubName: "Real Estate Empire",
  clubTagline: "",
  clubDesc: "",
  niche: "Real Estate",
  coverColor: "#F5A623",
  course: null,
  coaching: [],
  challenge: null,
  events: [],
  membership: {
    hasPaid: false,
    freeLabel: "Free Member",
    paidLabel: "Pro",
    paidPrice: 49,
    stripeConnected: false,
  },
  welcomePost: { title: "", body: "", published: false },
  completedSteps: [],
  launched: false,
};

type Listener = (s: GSStore) => void;
const listeners = new Set<Listener>();

function safeParse(raw: string | null): Partial<GSStore> {
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

export function getGS(): GSStore {
  if (typeof window === "undefined") return { ...DEFAULTS };
  const data = safeParse(window.localStorage.getItem(KEY));
  return { ...DEFAULTS, ...data, membership: { ...DEFAULTS.membership, ...(data.membership || {}) }, welcomePost: { ...DEFAULTS.welcomePost, ...(data.welcomePost || {}) } };
}

export function setGS(partial: Partial<GSStore>): GSStore {
  const next: GSStore = { ...getGS(), ...partial };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    // Cross-tab + same-tab notify
    window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
  }
  listeners.forEach(l => l(next));
  return next;
}

export function markStep(stepId: string): GSStore {
  const cur = getGS();
  if (cur.completedSteps.includes(stepId)) return cur;
  return setGS({ completedSteps: [...cur.completedSteps, stepId] });
}

export function subscribeGS(fn: Listener): () => void {
  listeners.add(fn);
  const onStorage = () => fn(getGS());
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

export function resetGS() { setGS(DEFAULTS); }
