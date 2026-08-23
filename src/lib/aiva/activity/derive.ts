// Projection layer: turns work the existing intelligence systems already did
// into AivaActivityRecord rows. Nothing here owns data — it reads the flywheel
// log, recommendation store, opportunity engine and legacy AIVA log and speaks
// about them in one consistent voice.

import type { FlywheelEvent } from "@/lib/flywheel/types";
import type { ContentRecommendation } from "@/lib/recos/types";
import type { Opportunity } from "@/lib/opportunities/types";
import type { ActivityEntry } from "@/lib/aiva-admin";
import { WORKSPACE_ID } from "./store";
import type { ActivityArea, AivaActivityRecord } from "./types";

function base(
  id: string,
  createdAt: string,
  fields: Omit<AivaActivityRecord, "id" | "workspaceId" | "createdAt">,
): AivaActivityRecord {
  return { id, workspaceId: WORKSPACE_ID, createdAt, ...fields };
}

/* ---------------------------------------------------------------- flywheel */

export function fromFlywheel(events: FlywheelEvent[]): AivaActivityRecord[] {
  return events.map(e => {
    const isAi = e.actor === "ai";
    switch (e.kind) {
      case "learned":
        return base(`fw:${e.id}`, e.at, {
          activityType: "analyzed", title: e.title, description: e.detail ?? "AIVA Learned From Recent Member Behavior.",
          area: "community", status: "informational", requiresApproval: false, autonomy: "automatic",
          ctaLabel: "View Insights", ctaDestination: "/app/aiva?view=opportunities",
        });
      case "recommended":
        return base(`fw:${e.id}`, e.at, {
          activityType: "recommendation", title: e.title,
          description: e.detail ?? "AIVA Prepared A Recommendation. Nothing Has Been Changed Yet.",
          area: "courses", status: "needs-approval", requiresApproval: true, autonomy: "requires-approval",
          ...(e.recoId ? { relatedEntityType: "recommendation", relatedEntityId: e.recoId } : {}),
          ctaLabel: "Review Recommendation", ctaDestination: "/app/aiva?view=create&sub=intelligence",
        });
      case "approved":
        return base(`fw:${e.id}`, e.at, {
          activityType: "completed", title: e.title, description: e.detail ?? "Approved Work Was Applied.",
          area: "courses", status: "completed", requiresApproval: false,
          autonomy: isAi ? "automatic" : "observed", completedAt: e.at,
          ctaLabel: "View Changes", ctaDestination: "/app/aiva?view=create&sub=intelligence",
        });
      case "connected":
        return base(`fw:${e.id}`, e.at, {
          activityType: "connected", title: e.title,
          description: e.detail ?? "AIVA Connected Two Parts Of Your Business.",
          area: "business", status: "completed", requiresApproval: false, autonomy: "automatic", completedAt: e.at,
          ctaLabel: "View Changes", ctaDestination: "/app/aiva?view=flywheel",
        });
      case "built":
        return base(`fw:${e.id}`, e.at, {
          activityType: "created", title: e.title, description: e.detail ?? "A New Product Was Built From An Opportunity.",
          area: "apps", status: "completed", requiresApproval: false, autonomy: isAi ? "automatic" : "observed", completedAt: e.at,
          ctaLabel: "Open It", ctaDestination: "/app/apps",
        });
      case "monetized":
        return base(`fw:${e.id}`, e.at, {
          activityType: "completed", title: e.title, description: e.detail ?? "Value Turned Into Revenue.",
          area: "offers", status: "completed", requiresApproval: false, autonomy: "observed", completedAt: e.at,
          ctaLabel: "View Offers", ctaDestination: "/app/manage/sell",
        });
      case "observed":
        return base(`fw:${e.id}`, e.at, {
          activityType: "monitoring", title: e.title, description: e.detail ?? "AIVA Is Watching This Signal.",
          area: "community", status: "informational", requiresApproval: false, autonomy: "automatic",
        });
      case "rejected":
        return base(`fw:${e.id}`, e.at, {
          activityType: "recommendation", title: e.title, description: e.detail ?? "You Dismissed This Recommendation.",
          area: "business", status: "dismissed", requiresApproval: false, autonomy: "observed",
        });
      default:
        return base(`fw:${e.id}`, e.at, {
          activityType: e.kind === "published" ? "updated" : "created",
          title: e.title, description: e.detail ?? "",
          area: "business", status: "completed", requiresApproval: false,
          autonomy: isAi ? "automatic" : "observed", completedAt: e.at,
        });
    }
  });
}

/* ----------------------------------------------------------- recommendations */

/** One row per source group, so the feed never lists 40 near-identical items. */
export function fromRecos(recos: ContentRecommendation[]): AivaActivityRecord[] {
  const out: AivaActivityRecord[] = [];
  const buckets: Record<string, ContentRecommendation[]> = {};
  for (const r of recos) (buckets[`${r.status}:${r.targetId}`] ??= []).push(r);

  for (const [key, rows] of Object.entries(buckets)) {
    const [status] = key.split(":");
    const first = rows.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];
    if (!first) continue;
    const at = first.createdAt;
    const target = first.targetTitle;
    const places = rows.map(r => ({ label: r.sourceTitle, value: r.reason }));

    if (status === "suggested") {
      out.push(base(`reco:s:${first.targetId}`, at, {
        activityType: "needs-approval",
        title: "Content Connections Found",
        description: `AIVA Found ${rows.length} Place${rows.length === 1 ? "" : "s"} Where Your ${target} Could Naturally Help Members Inside Existing Content. Nothing Has Been Applied.`,
        area: "courses", status: "needs-approval", requiresApproval: true, autonomy: "requires-approval",
        relatedEntityType: "product", relatedEntityId: first.targetId,
        ctaLabel: "Review Recommendations", ctaDestination: "/app/aiva?view=create&sub=intelligence",
        details: [{ label: "Suggested Placements", items: places }],
      }));
    } else if (status === "applied") {
      out.push(base(`reco:a:${first.targetId}`, first.updatedAt || at, {
        activityType: "updated",
        title: "Approved Updates Applied",
        description: `AIVA Applied ${rows.length} Approved Placement${rows.length === 1 ? "" : "s"} For Your ${target}.`,
        area: "courses", status: "completed", requiresApproval: false, autonomy: "requires-approval",
        completedAt: first.updatedAt || at,
        relatedEntityType: "product", relatedEntityId: first.targetId,
        ctaLabel: "View Changes", ctaDestination: "/app/aiva?view=create&sub=intelligence",
        details: [{ label: "Applied In", items: places }],
      }));
    }
  }
  return out;
}

/* ------------------------------------------------------------ opportunities */

export function fromOpportunities(opps: Opportunity[]): AivaActivityRecord[] {
  const AREA: Record<string, ActivityArea> = {
    app: "apps", course: "courses", resource: "resources", coaching: "coaching",
    event: "events", content: "courses", monetization: "offers", engagement: "community",
  };
  return opps
    .filter(o => o.status !== "dismissed")
    .map(o =>
      base(`opp:${o.id}`, new Date(Date.now() - 1000 * 60 * 60 * (2 + (o.topic.length % 20))).toISOString(), {
        activityType: "opportunity",
        title: "Opportunity Discovered",
        description: `${o.insight} AIVA Recommends ${o.suggestedTitle}.`,
        area: AREA[o.kind] ?? "business",
        status: o.status === "built" ? "completed" : "informational",
        requiresApproval: false,
        autonomy: "automatic",
        relatedEntityType: "opportunity", relatedEntityId: o.id,
        ctaLabel: "View Opportunity", ctaDestination: "/app/aiva?view=opportunities",
        details: [
          {
            label: "What AIVA Noticed",
            items: o.evidence.map(e => ({ label: e.kind.replace(/-/g, " "), value: `${e.count}` })),
          },
        ],
        metadata: { audience: o.audience, confidence: o.confidence },
        isDemo: o.isDemo,
      }),
    );
}

/* -------------------------------------------------------------- legacy log */

export function fromLegacy(entries: ActivityEntry[]): AivaActivityRecord[] {
  return entries
    .filter(e => !e.undone)
    .map(e =>
      base(`legacy:${e.id}`, e.at, {
        activityType: e.kind === "suggestion" ? "recommendation" : e.kind === "flag" ? "monitoring" : "automated",
        title: e.title,
        description: e.detail,
        area: "business",
        status: e.kind === "suggestion" ? "needs-approval" : "completed",
        requiresApproval: e.kind === "suggestion",
        autonomy: e.kind === "suggestion" ? "requires-approval" : "automatic",
        ...(e.kind === "action" ? { completedAt: e.at } : {}),
        ctaLabel: e.kind === "suggestion" ? "Review Suggestion" : e.kind === "flag" ? "Review Flag" : "View Details",
        ctaDestination: "/app/aiva?view=create&sub=capabilities",
      }),
    );
}

/* ------------------------------------------------------------- composition */

export function mergeActivities(...groups: AivaActivityRecord[][]): AivaActivityRecord[] {
  const seen = new Set<string>();
  const all: AivaActivityRecord[] = [];
  for (const g of groups) {
    for (const a of g) {
      if (seen.has(a.id)) continue;
      seen.add(a.id);
      all.push(a);
    }
  }
  return all.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export type ActivitySummary = {
  analyzed: number;
  opportunities: number;
  recommendations: number;
  completed: number;
  needsApproval: number;
  total: number;
};

export function summarize(rows: AivaActivityRecord[]): ActivitySummary {
  return {
    analyzed: rows.filter(r => r.activityType === "analyzed" || r.activityType === "monitoring").length,
    opportunities: rows.filter(r => r.activityType === "opportunity" || r.activityType === "discovered").length,
    recommendations: rows.filter(r => r.activityType === "recommendation" || r.activityType === "needs-approval").length,
    completed: rows.filter(r => r.status === "completed").length,
    needsApproval: rows.filter(r => r.requiresApproval && r.status === "needs-approval").length,
    total: rows.length,
  };
}

export type ActivityGroup = { label: string; rows: AivaActivityRecord[] };

function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c.getTime();
}

export function groupByDay(rows: AivaActivityRecord[]): ActivityGroup[] {
  const today = startOfDay(new Date());
  const day = 86_400_000;
  const groups: ActivityGroup[] = [];
  const push = (label: string, r: AivaActivityRecord) => {
    const g = groups.find(x => x.label === label);
    if (g) g.rows.push(r);
    else groups.push({ label, rows: [r] });
  };
  for (const r of rows) {
    const d = startOfDay(new Date(r.createdAt));
    if (d >= today) push("Today", r);
    else if (d >= today - day) push("Yesterday", r);
    else if (d >= today - day * 7) push("Earlier This Week", r);
    else push("Earlier", r);
  }
  return groups;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
