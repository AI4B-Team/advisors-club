// The creator-facing shape of a retroactive scan.
//
//   "I Found 8 Places Where Your New Rehab Estimator Could Help Members."
//
// Grouped by area (Courses, Community, Resources, Onboarding…), each with a
// plain-language recommendation. The report is derived, never stored: the
// relationships themselves are the record.

import type { BusinessGraph } from "@/lib/graph/types";
import { GROUP_ORDER, groupFor } from "./discover";
import type { ConnectionIntent, Relationship } from "./types";

export type ConnectionGroup = {
  group: string;
  items: Relationship[];
  /** One sentence describing what approving this group would do. */
  summary: string;
};

export type ConnectionReport = {
  total: number;
  helpful: number;
  promotional: number;
  groups: ConnectionGroup[];
};

function summaryFor(group: string, items: Relationship[]): string {
  const n = items.length;
  const plural = n === 1 ? "" : "s";
  switch (group) {
    case "Courses": return `Add It Inside ${n} Lesson${plural} Where Members Are Already Doing This Work.`;
    case "Community": return `${n} Previous Discussion${plural} Relate To This — Let AIVA Suggest It When Similar Questions Appear.`;
    case "Resources": return `List It Under Recommended Resources On ${n} Existing Item${plural}.`;
    case "Coaching": return `Bring It Into ${n} Coaching Touchpoint${plural}.`;
    case "Events": return `Demonstrate It Live Across ${n} Session${plural}.`;
    case "Member AI": return "Let Your Member AI Offer It When The Question Comes Up.";
    case "Member Questions": return `Answer ${n} Recurring Question${plural} With It Directly.`;
    case "Onboarding": return "Members Are Currently Pointed Somewhere Older — Replace Or Augment That.";
    case "Offers": return `Attach It To ${n} Existing Offer${plural}.`;
    default: return `${n} Connection${plural} Found.`;
  }
}

export function buildReport(graph: BusinessGraph, items: Relationship[]): ConnectionReport {
  const map = new Map<string, Relationship[]>();
  for (const r of items) {
    const g = groupFor(graph.nodes.find(n => n.id === r.sourceId));
    if (!map.has(g)) map.set(g, []);
    map.get(g)!.push(r);
  }

  const groups = [...map.entries()]
    .sort((a, b) => GROUP_ORDER.indexOf(a[0]) - GROUP_ORDER.indexOf(b[0]))
    .map(([group, list]) => ({ group, items: list, summary: summaryFor(group, list) }));

  const by = (i: ConnectionIntent) => items.filter(r => r.intent === i).length;

  return {
    total: items.length,
    helpful: by("helpful") + by("educational") + by("navigational"),
    promotional: by("promotional"),
    groups,
  };
}
