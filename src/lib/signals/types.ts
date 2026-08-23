// Behavioral signals — the raw evidence the Product Opportunity layer reads.
//
// Everything a member does that reveals intent lands here as a small, uniform
// record. Real instrumentation can write to this store later; until it does the
// app runs on clearly labeled sample data (see `demo.ts`) and every derived
// opportunity is marked as sample so no metric is ever presented as real.

export type SignalKind =
  | "community-question"
  | "persona-chat"
  | "search"
  | "course-question"
  | "comment"
  | "resource-view"
  | "app-run"
  | "course-complete"
  | "abandon"
  | "purchase";

export const SIGNAL_LABEL: Record<SignalKind, string> = {
  "community-question": "Community Questions",
  "persona-chat": "AI Persona Conversations",
  search: "Searches",
  "course-question": "Course Questions",
  comment: "Comments",
  "resource-view": "Resource Usage",
  "app-run": "App Usage",
  "course-complete": "Course Completions",
  abandon: "Abandoned Content",
  purchase: "Purchases",
};

export type Signal = {
  id: string;
  kind: SignalKind;
  /** Anonymous member reference — used only for unique-member counts. */
  memberId: string;
  /** Normalized topic terms extracted from the member's own words. */
  topics: string[];
  /** Verbatim (or paraphrased) member language, when available. */
  text?: string;
  /** Graph node the signal happened on, when it happened somewhere specific. */
  nodeId?: string;
  /** ISO timestamp. */
  at: string;
  /** True when the record is sample data rather than real member behavior. */
  demo?: boolean;
};
