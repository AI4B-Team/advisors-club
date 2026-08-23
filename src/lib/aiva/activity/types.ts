// AIVA Activity — a reusable record of work the AI business operator performed.
//
// This is deliberately generic: any future AIVA system can emit an activity by
// filling in this object, without the feed knowing anything about that system.
// It sits on top of the existing intelligence layers (graph, signals,
// opportunities, recommendations, commerce, flywheel log) — it does not replace
// or duplicate them.

export type AivaActivityType =
  | "analyzed"
  | "discovered"
  | "opportunity"
  | "recommendation"
  | "created"
  | "updated"
  | "connected"
  | "automated"
  | "completed"
  | "needs-approval"
  | "monitoring";

export const ACTIVITY_TYPE_LABEL: Record<AivaActivityType, string> = {
  analyzed: "Analyzed",
  discovered: "Discovered",
  opportunity: "Opportunity",
  recommendation: "Recommendation",
  created: "Created",
  updated: "Updated",
  connected: "Connected",
  automated: "Automated",
  completed: "Completed",
  "needs-approval": "Needs Approval",
  monitoring: "Monitoring",
};

/** Small accent per type. Intentionally a narrow palette — no rainbow. */
export type ActivityTone = "neutral" | "insight" | "opportunity" | "attention" | "done";

export const ACTIVITY_TONE: Record<AivaActivityType, ActivityTone> = {
  analyzed: "neutral",
  discovered: "insight",
  opportunity: "opportunity",
  recommendation: "insight",
  created: "insight",
  updated: "done",
  connected: "done",
  automated: "done",
  completed: "done",
  "needs-approval": "attention",
  monitoring: "neutral",
};

export type AivaActivityStatus =
  | "informational"
  | "in-progress"
  | "needs-approval"
  | "completed"
  | "dismissed"
  | "failed";

export const ACTIVITY_STATUS_LABEL: Record<AivaActivityStatus, string> = {
  informational: "Informational",
  "in-progress": "In Progress",
  "needs-approval": "Needs Approval",
  completed: "Completed",
  dismissed: "Dismissed",
  failed: "Failed",
};

/** Areas of the business an activity can belong to — powers the light filter. */
export type ActivityArea =
  | "courses" | "community" | "apps" | "resources"
  | "coaching" | "events" | "persona" | "offers" | "business";

export const AREA_LABEL: Record<ActivityArea, string> = {
  courses: "Courses",
  community: "Community",
  apps: "Apps",
  resources: "Resources",
  coaching: "Coaching",
  events: "Events",
  persona: "AI Persona",
  offers: "Offers",
  business: "Business",
};

/** How the work was authorized — supports future autonomy levels. */
export type AivaAutonomy = "observed" | "requires-approval" | "automatic";

export type ActivityDetailList = {
  label: string;
  items: { label: string; value?: string }[];
};

export type AivaActivityRecord = {
  id: string;
  /** Reserved for multi-workspace support; single workspace today. */
  workspaceId: string;
  activityType: AivaActivityType;
  title: string;
  description: string;
  area: ActivityArea;
  sourceEntityType?: string;
  sourceEntityId?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  status: AivaActivityStatus;
  requiresApproval: boolean;
  autonomy: AivaAutonomy;
  ctaLabel?: string;
  ctaDestination?: string;
  /** Optional expanded context — kept out of the collapsed row. */
  details?: ActivityDetailList[];
  metadata?: Record<string, string | number | boolean>;
  createdAt: string;
  completedAt?: string;
  /** True when the record comes from development fixtures, not real work. */
  isDemo?: boolean;
};

/** Verb precision — AIVA must never imply it changed something it only proposed. */
export const SAFE_VERB: Record<AivaActivityStatus, string> = {
  informational: "Found",
  "in-progress": "Preparing",
  "needs-approval": "Prepared",
  completed: "Applied",
  dismissed: "Dismissed",
  failed: "Could Not Complete",
};
