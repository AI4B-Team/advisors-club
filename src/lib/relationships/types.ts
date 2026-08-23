// Relationships — the foundational connection model for Advisors Club.
//
// Everything a Club contains (community posts, courses, lessons, coaching
// programs, events, resources, apps, products, offers, challenges, member
// questions, automations, landing pages) is already projected into the
// Business Graph as a node. This layer describes how those nodes RELATE, in
// one structured, reusable shape — never as hard-coded links inside a page and
// never as free text an AI generated once.
//
// One relationship answers seven questions:
//   what → what, of what kind, why, how sure, is it free or paid,
//   who proposed it, and has the creator approved it.
//
// Every downstream system reads this same model: recommendations, search,
// Member AI, courses, apps, upsells, cross-sells, onboarding, automations,
// AIVA Opportunities, AIVA Activity, and analytics.

import type { EntityType, NodeId } from "@/lib/graph/types";

/* ------------------------------------------------------------------ kind */

/** WHAT the connection is. Deliberately small and reusable. */
export type RelationshipKind =
  | "supports"        // a tool/resource helps a member do what this content teaches
  | "explains"        // content that teaches the concept behind the target
  | "prerequisite"    // should be understood before the target
  | "next-step"       // the natural thing to do afterwards
  | "companion-tool"  // use alongside this content
  | "deep-dive"       // a fuller treatment of the same subject
  | "answers"         // directly answers a recurring member question
  | "included-in"     // access comes with the target
  | "upgrade"         // a paid step up from the source
  | "bundle"          // commonly bought or used together
  | "replaces"        // supersedes something older (a spreadsheet, an old guide)
  | "related";        // generic association

export const KIND_LABEL: Record<RelationshipKind, string> = {
  supports: "Supports",
  explains: "Explains",
  prerequisite: "Prerequisite",
  "next-step": "Next Step",
  "companion-tool": "Companion Tool",
  "deep-dive": "Deep Dive",
  answers: "Answers A Question",
  "included-in": "Included In",
  upgrade: "Upgrade",
  bundle: "Better Together",
  replaces: "Replaces",
  related: "Related",
};

/* ---------------------------------------------------------------- intent */

/**
 * WHY the connection exists. Not every connection is a sales opportunity, and
 * AIVA must know the difference: "this calculator answers the member's
 * question" is a different act from "this $49 upgrade may solve the problem".
 */
export type ConnectionIntent = "educational" | "helpful" | "navigational" | "promotional";

export const INTENT_LABEL: Record<ConnectionIntent, string> = {
  educational: "Educational",
  helpful: "Helpful",
  navigational: "Navigational",
  promotional: "Promotional",
};

export const INTENT_HINT: Record<ConnectionIntent, string> = {
  educational: "Teaches Or Deepens Understanding.",
  helpful: "Solves The Member's Immediate Problem.",
  navigational: "Points Members To Where Something Lives.",
  promotional: "Introduces Something The Member Would Need To Buy.",
};

/* -------------------------------------------------------------- commerce */

/** Free vs paid, from the member's point of view. */
export type CommerceMode = "free" | "included" | "paid";

export const COMMERCE_LABEL: Record<CommerceMode, string> = {
  free: "Free",
  included: "Included",
  paid: "Paid",
};

/* ---------------------------------------------------------------- status */

/** Default lifecycle: discover → suggest → creator approves → active. */
export type RelationshipStatus = "suggested" | "approved" | "active" | "rejected" | "removed";

export const STATUS_LABEL: Record<RelationshipStatus, string> = {
  suggested: "Suggested",
  approved: "Approved",
  active: "Live",
  rejected: "Rejected",
  removed: "Removed",
};

/** Who proposed it. AIVA discovering is not AIVA publishing. */
export type RelationshipAuthor = "aiva" | "creator" | "rule";

/** Where in the source experience the connection should surface. */
export type ConnectionPlacement =
  | "inline" | "after-content" | "resources" | "sidebar"
  | "next-step" | "completion" | "member-ai" | "onboarding";

export const PLACEMENT_LABEL: Record<ConnectionPlacement, string> = {
  inline: "Inline",
  "after-content": "After The Content",
  resources: "Recommended Resources",
  sidebar: "Sidebar",
  "next-step": "Next Step",
  completion: "On Completion",
  "member-ai": "Member AI Answers",
  onboarding: "Onboarding",
};

/* ---------------------------------------------------------- relationship */

export type Relationship = {
  id: string;
  /** Where the connection lives. */
  sourceId: NodeId;
  sourceType: EntityType;
  sourceTitle: string;
  /** What it points at. */
  targetId: NodeId;
  targetType: EntityType;
  targetTitle: string;

  kind: RelationshipKind;
  intent: ConnectionIntent;
  commerce: CommerceMode;
  placement: ConnectionPlacement;

  /** Creator-facing explanation of why AIVA proposed this. */
  reason: string;
  /** Member-facing copy — editable before approval, never auto-published. */
  memberCopy: string;
  /** What the pattern was built on (question counts, matching topics…). */
  evidence: string[];
  /** 0-1 relevance. */
  confidence: number;

  status: RelationshipStatus;
  createdBy: RelationshipAuthor;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
};

export type RelationshipDraft =
  Omit<Relationship, "id" | "status" | "createdAt" | "updatedAt" | "approvedAt"> &
  Partial<Pick<Relationship, "status">>;

/** A connection the member can actually act on, once approved. */
export const LIVE_STATUSES: RelationshipStatus[] = ["approved", "active"];

/** Promotional connections can never skip the creator, whatever autonomy says. */
export function requiresApproval(r: { intent: ConnectionIntent; commerce: CommerceMode }): boolean {
  return r.intent === "promotional" || r.commerce === "paid";
}
