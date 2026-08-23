// Contextual Recommendations — a reusable, content-type-agnostic model.
//
// A recommendation always answers: "inside THIS piece of content, THIS product
// or resource would genuinely help the member — here's why, where, and how to
// say it." Nothing is ever applied automatically: the expert approves, edits or
// dismisses every suggestion.
//
// Deliberately NOT course-specific. Source and destination are graph node ids,
// so the same model serves lessons, posts, events, coaching sessions, apps,
// sales pages and anything added later.

import type { NodeId } from "@/lib/graph/types";

export type RecoType =
  | "helpful-resource"
  | "free-tool"
  | "included-product"
  | "paid-upgrade"
  | "coaching-offer"
  | "course"
  | "event";

export const RECO_TYPE_LABEL: Record<RecoType, string> = {
  "helpful-resource": "Helpful Resource",
  "free-tool": "Free Tool",
  "included-product": "Included Product",
  "paid-upgrade": "Paid Upgrade",
  "coaching-offer": "Coaching Offer",
  course: "Course",
  event: "Event",
};

/** Commercial weight — used to keep suggestions useful rather than spammy. */
export const RECO_TYPE_TONE: Record<RecoType, "value" | "offer"> = {
  "helpful-resource": "value",
  "free-tool": "value",
  "included-product": "value",
  "paid-upgrade": "offer",
  "coaching-offer": "offer",
  course: "offer",
  event: "value",
};

export type RecoStatus = "suggested" | "approved" | "rejected" | "applied" | "removed";

export const RECO_STATUS_LABEL: Record<RecoStatus, string> = {
  suggested: "Suggested",
  approved: "Approved",
  rejected: "Rejected",
  applied: "Applied",
  removed: "Removed",
};

/** Where inside the source content the recommendation belongs. */
export type RecoPlacement =
  | "intro" | "inline" | "after-content" | "sidebar" | "resources" | "next-step" | "completion";

export const RECO_PLACEMENT_LABEL: Record<RecoPlacement, string> = {
  intro: "Intro",
  inline: "Inline",
  "after-content": "After The Content",
  sidebar: "Sidebar",
  resources: "Resources",
  "next-step": "Next Step",
  completion: "On Completion",
};

export type ContentRecommendation = {
  id: string;
  /** Graph node the recommendation lives inside (lesson, post, event, page…). */
  sourceId: NodeId;
  sourceTitle: string;
  /** Graph node being recommended (app, resource, course, coaching, event, offer…). */
  targetId: NodeId;
  targetTitle: string;
  type: RecoType;
  reason: string;
  placement: RecoPlacement;
  /** Short member-facing copy the expert can edit before approving. */
  copy: string;
  /** 0–1 relevance. */
  confidence: number;
  status: RecoStatus;
  origin: "ai" | "rule" | "manual";
  createdAt: string;
  updatedAt: string;
};

export type RecoDraft = Omit<ContentRecommendation, "id" | "status" | "createdAt" | "updatedAt"> &
  Partial<Pick<ContentRecommendation, "status">>;
