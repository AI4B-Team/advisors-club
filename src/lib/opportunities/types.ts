// Product Opportunity model.
//
// An opportunity is a PATTERN, not an analytics row: AIVA noticed something in
// the creator's real ecosystem (conversations, questions, search, consumption,
// completion, coaching, events, resources, apps, offers, purchases), has
// evidence for it, can explain why it matters, proposes a concrete next step,
// and lists exactly what it can do about it if the creator approves.

import type { SignalKind } from "@/lib/signals/types";

export type OpportunityKind =
  | "app" | "course" | "content" | "resource" | "coaching" | "event"
  | "product" | "upsell" | "cross-sell" | "automation" | "engagement" | "retention"
  /** Legacy alias kept so stored decisions and older code keep resolving. */
  | "monetization";

export const OPPORTUNITY_LABEL: Record<OpportunityKind, string> = {
  app: "App Opportunity",
  course: "Course Opportunity",
  content: "Content Opportunity",
  resource: "Resource Opportunity",
  coaching: "Coaching Opportunity",
  event: "Event Opportunity",
  product: "Product Opportunity",
  upsell: "Upsell Opportunity",
  "cross-sell": "Cross-Sell Opportunity",
  automation: "Automation Opportunity",
  engagement: "Engagement Opportunity",
  retention: "Retention Opportunity",
  monetization: "Revenue Opportunity",
};

export const OPPORTUNITY_CTA: Record<OpportunityKind, string> = {
  app: "Build It",
  course: "Build It",
  content: "Review Connections",
  resource: "Build It",
  coaching: "Build It",
  event: "Build It",
  product: "Build It",
  upsell: "Build It",
  "cross-sell": "Build It",
  automation: "Turn It On",
  engagement: "Build It",
  retention: "Turn It On",
  monetization: "Build It",
};

/** Coarse grouping used for the (optional) filter row. */
export type OpportunityFamily = "build" | "revenue" | "members";

export const OPPORTUNITY_FAMILY: Record<OpportunityKind, OpportunityFamily> = {
  app: "build", course: "build", resource: "build", event: "build", coaching: "build", content: "build",
  product: "revenue", upsell: "revenue", "cross-sell": "revenue", monetization: "revenue",
  automation: "members", engagement: "members", retention: "members",
};

export const FAMILY_LABEL: Record<OpportunityFamily, string> = {
  build: "Build",
  revenue: "Revenue",
  members: "Members",
};

export type OpportunityEvidence = {
  kind: SignalKind;
  count: number;
  /** A few real member phrasings, when available. */
  samples: string[];
};

/**
 * Lifecycle. Approving an opportunity hands it to AIVA Activity, where the work
 * itself is reported — Opportunities is where AIVA thinks, Activity is where
 * AIVA works.
 */
export type OpportunityStatus =
  | "new" | "reviewing" | "approved" | "building" | "completed" | "dismissed";

export const STATUS_LABEL: Record<OpportunityStatus, string> = {
  new: "New",
  reviewing: "Reviewing",
  approved: "Approved",
  building: "Building",
  completed: "Completed",
  dismissed: "Dismissed",
};

/** Older stored decisions used a shorter vocabulary. */
export function normalizeStatus(value: string | undefined): OpportunityStatus {
  switch (value) {
    case "open": return "new";
    case "planned": return "reviewing";
    case "built": return "completed";
    case "new": case "reviewing": case "approved": case "building": case "completed": case "dismissed":
      return value;
    default: return "new";
  }
}

export type MonetizationOption = "free" | "included" | "paid";

export const MONETIZATION_LABEL: Record<MonetizationOption, string> = {
  free: "Free",
  included: "Included With Membership",
  paid: "Paid Upgrade",
};

/** One concrete thing AIVA is offering to do if the creator approves. */
export type OpportunityCapability = {
  label: string;
  /** True when this step needs the creator's eyes before anything is published. */
  needsApproval?: boolean;
};

/** Existing content a connection-style opportunity would touch. */
export type ConnectionTarget = { group: string; count: number };

export type Opportunity = {
  id: string;
  kind: OpportunityKind;
  /** The topic cluster or asset this pattern formed around. */
  topic: string;
  /** What AIVA noticed, in plain language. */
  noticed: string;
  /** Why it matters for the business / members. */
  why: string;
  /** One-line headline insight shown on the row. */
  insight: string;
  /** The supporting signal, in one short line. */
  signal: string;
  /** The recommended action, in one short line. */
  action: string;
  /** Where "Explore" should take the creator. */
  buildHref?: string;
  /** What to build. */
  suggestedTitle: string;
  suggestedSummary: string;
  /** Existing content the new thing should be built from. */
  buildFrom: { id: string; title: string }[];
  /** Exactly what AIVA can do about it. */
  canDo: OpportunityCapability[];
  /** Monetization choices offered when the thing could be sold. */
  monetization?: MonetizationOption[];
  /** For content-connection opportunities: where the connections would land. */
  connections?: ConnectionTarget[];
  evidence: OpportunityEvidence[];
  /** Unique members whose behavior formed this pattern. */
  audience: number;
  /** Rolling window the evidence was measured over, in days. */
  windowDays: number;
  confidence: number;
  /** 0-1 business impact estimate — drives emphasis, not a dashboard metric. */
  impact: number;
  /** True when derived from sample data rather than real behavior. */
  isDemo: boolean;
  status: OpportunityStatus;
};
