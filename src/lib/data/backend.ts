// Which backend each domain reads and writes.
//
// The production migration happens DOMAIN BY DOMAIN. Every domain keeps its
// existing store interface; only the implementation behind it changes. This
// module is the single switch that decides where a domain's data lives, so a
// domain can be flipped to Supabase (and flipped back) without touching UI.

export type DataDomain =
  | "clubs"
  | "memberships"
  | "navigation"
  | "community"
  | "courses"
  | "resources"
  | "events"
  | "apps"
  | "coaching"
  | "commerce"
  | "aiva"
  | "persona"
  | "signals";

export type Backend = "local" | "supabase";

/**
 * Migration state. A domain is only moved to "supabase" once its repository
 * is implemented AND verified — until then the localStorage implementation
 * stays authoritative so the prototype keeps working.
 */
const DEFAULTS: Record<DataDomain, Backend> = {
  clubs: "local",
  memberships: "local",
  navigation: "local",
  community: "local",
  courses: "local",
  resources: "local",
  events: "local",
  apps: "local",
  coaching: "local",
  commerce: "local",
  aiva: "local",
  persona: "local",
  signals: "local",
};

const OVERRIDE_KEY = "ac:data-backend";

function overrides(): Partial<Record<DataDomain, Backend>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(OVERRIDE_KEY);
    return raw ? (JSON.parse(raw) as Partial<Record<DataDomain, Backend>>) : {};
  } catch {
    return {};
  }
}

/** Where this domain currently lives. */
export function backendFor(domain: DataDomain): Backend {
  return overrides()[domain] ?? DEFAULTS[domain];
}

export function isSupabaseBacked(domain: DataDomain): boolean {
  return backendFor(domain) === "supabase";
}

/** Dev/QA switch used while verifying a domain migration. */
export function setBackend(domain: DataDomain, backend: Backend): void {
  if (typeof window === "undefined") return;
  const next = { ...overrides(), [domain]: backend };
  window.localStorage.setItem(OVERRIDE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("ac:data-backend:change"));
}

export function backendStatus(): Record<DataDomain, Backend> {
  return { ...DEFAULTS, ...overrides() } as Record<DataDomain, Backend>;
}
