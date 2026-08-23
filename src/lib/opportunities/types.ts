// Product Opportunity model.
//
// An opportunity is a PATTERN, not an analytics row: AIVA noticed something in
// aggregate member behavior, has evidence for it, can explain why it matters,
// and proposes a concrete thing to build. Content-type agnostic on purpose.

import type { SignalKind } from "@/lib/signals/types";

export type OpportunityKind =
  | "app" | "course" | "resource" | "coaching" | "event" | "content" | "monetization" | "engagement";

export const OPPORTUNITY_LABEL: Record<OpportunityKind, string> = {
  app: "Product Opportunity",
  course: "Course Opportunity",
  resource: "Resource Opportunity",
  coaching: "Coaching Opportunity",
  event: "Event Opportunity",
  content: "Content Opportunity",
  monetization: "Revenue Opportunity",
  engagement: "Engagement Opportunity",
};

export const OPPORTUNITY_CTA: Record<OpportunityKind, string> = {
  app: "Build With AI",
  course: "Build Course With AI",
  resource: "Create Resource With AI",
  coaching: "Design Program With AI",
  event: "Plan Event With AI",
  content: "Draft Content With AI",
  monetization: "Create Offer With AI",
  engagement: "Review Module",
};

export type OpportunityEvidence = {
  kind: SignalKind;
  count: number;
  /** A few real member phrasings, when available. */
  samples: string[];
};

export type OpportunityStatus = "open" | "planned" | "dismissed" | "built";

export type Opportunity = {
  id: string;
  kind: OpportunityKind;
  /** The topic cluster this pattern formed around. */
  topic: string;
  /** What AI noticed, in plain language. */
  noticed: string;
  /** Why it matters for the business / members. */
  why: string;
  /** One-line headline insight shown on the card. */
  insight: string;
  /** The supporting signal, in one short line. */
  signal: string;
  /** The recommended action, in one short line. */
  action: string;
  /** Where "Build It" should take the expert. */
  buildHref?: string;
  /** What to build. */
  suggestedTitle: string;
  suggestedSummary: string;
  /** Existing content the new thing should be built from. */
  buildFrom: { id: string; title: string }[];
  evidence: OpportunityEvidence[];
  /** Unique members whose behavior formed this pattern. */
  audience: number;
  /** Rolling window the evidence was measured over, in days. */
  windowDays: number;
  confidence: number;
  /** True when derived from sample data rather than real behavior. */
  isDemo: boolean;
  status: OpportunityStatus;
};
