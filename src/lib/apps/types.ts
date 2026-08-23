// Apps — a first-class content type inside a creator's community.
//
// An App is an interactive tool (calculator, assessment, planner, tracker,
// generator, intake form, checklist, AI tool...). This module defines the
// extensible model only — rendering engines for each kind are added later.

/** What kind of interactive tool this app is. Drives the future runtime. */
export type AppKind =
  | "calculator"
  | "assessment"
  | "quiz"
  | "planner"
  | "tracker"
  | "generator"
  | "intake"
  | "checklist"
  | "ai-tool"
  | "embed";

export const APP_KIND_LABEL: Record<AppKind, string> = {
  calculator: "Calculator",
  assessment: "Assessment",
  quiz: "Quiz",
  planner: "Planner",
  tracker: "Tracker",
  generator: "Generator",
  intake: "Intake Tool",
  checklist: "Checklist",
  "ai-tool": "AI Tool",
  embed: "Embedded Tool",
};

/** Icon keys map to lucide icons in the UI layer. */
export type AppIconKey =
  | "calculator" | "clipboard" | "target" | "chart" | "sparkles"
  | "list" | "wand" | "gauge" | "wrench" | "layers";

/**
 * Access reuses the same access vocabulary as other Advisors Club content
 * (courses, coaching programs, sell pages) rather than inventing a second
 * permission system.
 */
export type AppAccess =
  | { type: "all" }
  | { type: "membership"; membership: string }
  | { type: "course"; courseId: string; courseLabel?: string }
  | { type: "paid" }
  | { type: "admin" };

export const MEMBERSHIP_TIERS = ["Free", "Pro", "Founding"] as const;

export function accessLabel(a: AppAccess): string {
  switch (a.type) {
    case "all": return "All Members";
    case "membership": return `${a.membership} Membership`;
    case "course": return a.courseLabel ? `Program: ${a.courseLabel}` : "Specific Program";
    case "paid": return "Paid Access";
    case "admin": return "Admin Only";
  }
}

export type AppStatus = "draft" | "published";

/**
 * Config is intentionally open-ended: each kind (and, later, the AI app
 * builder) writes its own schema here without changing the App model.
 */
export type AppConfig = Record<string, unknown>;

export type App = {
  id: string;
  name: string;
  description: string;
  kind: AppKind;
  icon: AppIconKey;
  status: AppStatus;
  access: AppAccess;
  /** Template this app was created from, when applicable. */
  templateId?: string;
  /** Set when the app was drafted by the AI app builder. */
  source: "blank" | "library" | "ai";
  config: AppConfig;
  createdAt: string;
  updatedAt: string;
};

/** A library entry — a starting point, never auto-installed. */
export type AppTemplate = {
  id: string;
  name: string;
  description: string;
  kind: AppKind;
  icon: AppIconKey;
  /** Niche grouping shown in the App Library ("Real Estate", "Fitness"...). */
  category: string;
  config?: AppConfig;
};
