// AIVA Build Plan — reusable model.
// Used by initial onboarding AND by any future "Build With AI" request
// ("Build me a coaching program", "Create a new course", ...).
// A plan is a list of proposed items grouped by category. The admin keeps
// or removes items, then AIVA builds only what stayed selected.

export type BuildCategory =
  | "identity" | "community" | "courses" | "coaching" | "events"
  | "resources" | "apps" | "persona" | "content";

export const CATEGORY_LABEL: Record<BuildCategory, string> = {
  identity: "Identity",
  community: "Community",
  courses: "Courses",
  coaching: "Coaching",
  events: "Events",
  resources: "Resources",
  apps: "Apps",
  persona: "AI Persona",
  content: "Content",
};

export const CATEGORY_ORDER: BuildCategory[] = [
  "identity", "community", "courses", "coaching", "events",
  "resources", "apps", "persona", "content",
];

/** Where a proposed item came from — the UI stays honest about this. */
export type ItemOrigin = "aiva" | "static" | "user";

export type BuildPlanItem = {
  id: string;
  label: string;
  category: BuildCategory;
  /** One short supporting line. Optional — the page must stay scannable. */
  description?: string;
  required?: boolean;
  recommended?: boolean;
  /** Selected by default when AIVA recommends it. */
  selected: boolean;
  /** AIVA bubble copy during / after the build. */
  building: string;
  done: string;
  /** Which real builder persists this item (see persist.ts). */
  builder?: string;
  builderInput?: Record<string, string>;
  /** Where the admin can configure it afterwards. */
  editTo?: string;
  origin: ItemOrigin;
};

export type BuildPlanKind =
  | "onboarding" | "community" | "course" | "coaching" | "challenge"
  | "event" | "resource" | "app" | "offer" | "custom";

export type BuildPlan = {
  id: string;
  kind: BuildPlanKind;
  /** AIVA's opening line at the top of the page. */
  intro: string;
  /** Primary CTA — context aware ("Build My Club", "Build This Program"). */
  cta: string;
  /** Where to send the admin once the build finishes. */
  returnTo: string;
  returnLabel: string;
  items: BuildPlanItem[];
  createdAt: string;
};

export type BuildResult = {
  itemId: string;
  label: string;
  category: BuildCategory;
  status: "built" | "skipped" | "failed";
  at: string;
  editTo?: string;
};

export type BuildPlanState = {
  planId: string;
  phase: "plan" | "build" | "result";
  /** Ids the admin kept. Persisted so Save & Exit never loses work. */
  selected: string[];
  results: BuildResult[];
  updatedAt: string;
};

export const BUILD_STEPS = ["Plan", "Customize", "Build", "Launch"] as const;
export type BuildStep = (typeof BUILD_STEPS)[number];
