// How loudly a piece of AIVA work should speak to the expert.
//
// Only "important" and "action-required" ever surface globally — everything
// else stays inside the full Activity report.

import type { AivaActivityRecord } from "@/lib/aiva/activity/types";

export type AttentionLevel = "routine" | "useful" | "important" | "action-required";

export const ATTENTION_RANK: Record<AttentionLevel, number> = {
  "action-required": 3,
  important: 2,
  useful: 1,
  routine: 0,
};

export function attentionLevel(a: AivaActivityRecord): AttentionLevel {
  if (a.requiresApproval && a.status === "needs-approval") return "action-required";
  if (a.activityType === "opportunity" || a.activityType === "discovered") return "important";
  if (a.activityType === "recommendation" || a.activityType === "connected" || a.activityType === "created") return "useful";
  return "routine";
}

export function isGlobal(a: AivaActivityRecord): boolean {
  return ATTENTION_RANK[attentionLevel(a)] >= ATTENTION_RANK.important;
}

/** Time-of-day greeting — AIVA talks like a person, not a bell. */
export function greeting(now = new Date()): string {
  const h = now.getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
}

/** "I found 3 things you should see." — never a bare number. */
export function briefingLine(count: number, away: boolean): string {
  if (count <= 0) return "Nothing needs you right now. What are we working on?";
  const things = count === 1 ? "one thing" : `${count} things`;
  return away
    ? `I found ${things} while you were away that you should see.`
    : `I found ${things} you should see.`;
}
