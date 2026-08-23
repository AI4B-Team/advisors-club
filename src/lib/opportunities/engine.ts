// Pattern detection over aggregate behavior.
//
// The engine clusters signals by topic, compares each cluster against what the
// business already offers (via the Business Graph), and only emits an
// opportunity when the SHAPE of the behavior says something is missing.
// It never invents numbers: every count comes straight from the signal set, and
// sample-derived opportunities are flagged `isDemo`.

import type { BusinessGraph, GraphNode } from "@/lib/graph/types";
import type { Signal, SignalKind } from "@/lib/signals/types";
import type { Opportunity, OpportunityEvidence, OpportunityKind } from "./types";

const WINDOW_DAYS = 90;

type Cluster = {
  topic: string;
  topics: string[];
  signals: Signal[];
  members: Set<string>;
  byKind: Map<SignalKind, Signal[]>;
};

function clusterByTopic(signals: Signal[]): Cluster[] {
  const map = new Map<string, Cluster>();
  for (const s of signals) {
    const key = (s.topics[0] ?? "general").toLowerCase();
    if (!map.has(key)) {
      map.set(key, { topic: key, topics: s.topics, signals: [], members: new Set(), byKind: new Map() });
    }
    const c = map.get(key)!;
    c.signals.push(s);
    c.members.add(s.memberId);
    if (!c.byKind.has(s.kind)) c.byKind.set(s.kind, []);
    c.byKind.get(s.kind)!.push(s);
    for (const t of s.topics) if (!c.topics.includes(t)) c.topics.push(t);
  }
  return [...map.values()].filter(c => c.signals.length >= 8);
}

function evidenceOf(c: Cluster): OpportunityEvidence[] {
  return [...c.byKind.entries()]
    .map(([kind, list]) => ({
      kind,
      count: list.length,
      samples: [...new Set(list.map(s => s.text).filter(Boolean) as string[])].slice(0, 2),
    }))
    .sort((a, b) => b.count - a.count);
}

function overlaps(node: GraphNode, topics: string[]): boolean {
  const hay = `${node.title} ${node.description} ${node.tags.join(" ")}`.toLowerCase();
  return topics.some(t => hay.includes(t.toLowerCase()));
}

function count(c: Cluster, ...kinds: SignalKind[]): number {
  return kinds.reduce((n, k) => n + (c.byKind.get(k)?.length ?? 0), 0);
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, m => m.toUpperCase());
}

/** Decide what KIND of thing is missing, from the shape of the behavior. */
function classify(c: Cluster, related: GraphNode[]): OpportunityKind | null {
  const hasContent = related.some(n => ["course", "lesson", "resource", "module"].includes(n.type));
  const hasApp = related.some(n => n.type === "app");
  const hasCoaching = related.some(n => n.type === "coaching");
  const hasEvent = related.some(n => n.type === "event");
  const hasResource = related.some(n => n.type === "resource");

  const questions = count(c, "community-question", "persona-chat", "course-question");
  const searches = count(c, "search");
  const completions = count(c, "course-complete");
  const abandons = count(c, "abandon");
  const appRuns = count(c, "app-run");
  const purchases = count(c, "purchase");
  const wantsHuman = /coach|one on one|1:1|review my/.test(c.topics.join(" "));

  if (abandons >= 10 && abandons >= questions) return "content";
  if (wantsHuman && questions >= 10 && !hasCoaching) return "coaching";
  if (completions >= 15 && questions >= 10) return "course";
  if (questions >= 15 && hasContent && !hasApp) return "app";
  if (appRuns >= 15 && questions >= 8 && !hasContent) return "course";
  if (searches >= 12 && !hasResource) return "resource";
  if (questions >= 12 && !hasContent) return "course";
  if (questions >= 8 && !hasEvent && hasContent) return "event";
  if (purchases >= 5 && related.every(n => !n.price) && related.length > 0) return "monetization";
  return null;
}

function suggest(kind: OpportunityKind, c: Cluster, related: GraphNode[]): { title: string; summary: string } {
  const topic = titleCase(c.topic);
  switch (kind) {
    case "app":
      return {
        title: `${topic} Calculator`,
        summary: `An Interactive Tool That Lets Members Compare ${topic} Options And See Their Own Numbers Instead Of Reading About Them.`,
      };
    case "course": {
      const source = related.find(n => n.type === "course");
      return {
        title: `Scaling With ${topic}`.replace("Scaling With", source ? "Going Further With" : "Mastering"),
        summary: source
          ? `A Follow-On Course For Members Who Finished “${source.title}” And Are Now Asking About ${topic}.`
          : `A Focused Course On ${topic} — Currently Unanswered By Your Catalog.`,
      };
    }
    case "resource":
      return {
        title: `${topic} Templates & Checklist`,
        summary: `A Downloadable Pack Members Are Already Searching For By Name.`,
      };
    case "coaching":
      return {
        title: `${topic} Review Sessions`,
        summary: `A Structured Program For Members Asking For Direct, Personal Review.`,
      };
    case "event":
      return {
        title: `Live ${topic} Workshop`,
        summary: `A Live Session To Answer The Same ${topic} Questions Once, In Front Of Everyone.`,
      };
    case "content":
      return {
        title: `Rework The ${topic} Path`,
        summary: `Members Are Dropping Off Here — Shorter Steps And A Clear First Win Would Recover Them.`,
      };
    case "monetization":
      return {
        title: `${topic} Offer`,
        summary: `Demand Exists Around ${topic} But Nothing In This Area Is Currently Sold.`,
      };
  }
}

function noticedText(kind: OpportunityKind, c: Cluster, members: number, related: GraphNode[]): string {
  const topic = titleCase(c.topic);
  const questions = count(c, "community-question", "persona-chat", "course-question");
  switch (kind) {
    case "app":
      return `${members} Members Asked About ${topic} During The Last ${WINDOW_DAYS} Days. Existing Content Answers Parts Of These Questions, But Members Have No Interactive Tool For Working Through ${topic} Themselves.`;
    case "course": {
      const src = related.find(n => n.type === "course");
      return src
        ? `Members Who Complete “${src.title}” Frequently Ask About ${topic}.`
        : `${members} Members Raised ${topic} ${questions} Times, And Nothing In Your Catalog Covers It.`;
    }
    case "resource":
      return `${topic} Is Being Searched For Repeatedly, Suggesting Members Expect A Template Or Checklist That Doesn't Exist Yet.`;
    case "coaching":
      return `${members} Members Asked For Direct, Personal Help With ${topic}.`;
    case "event":
      return `The Same ${topic} Questions Keep Recurring Across ${members} Members — A Recurring Pattern, Not One-Off Confusion.`;
    case "content":
      return `${members} Members Started ${topic} Content And Stopped Before Finishing.`;
    case "monetization":
      return `Strong ${topic} Demand Is Landing On Content That Isn't Attached To Any Offer.`;
  }
}

function whyText(kind: OpportunityKind): string {
  switch (kind) {
    case "app": return "Interactive Tools Convert Passive Readers Into Members Who Take Action — And They're The Easiest Thing To Recommend Inside Existing Lessons.";
    case "course": return "This Is Demand From Members Who Already Trust You And Have Finished Something — The Highest-Intent Audience You Have.";
    case "resource": return "Repeated Search With No Result Is A Silent Support Cost And An Easy Win.";
    case "coaching": return "Requests For Personal Review Are Direct Buying Signals For Higher-Ticket Offers.";
    case "event": return "Answering Once, Live, Beats Answering The Same Question Dozens Of Times.";
    case "content": return "Drop-Off Here Compounds — Members Who Stall Early Rarely Return On Their Own.";
    case "monetization": return "Attention Already Exists Here; Only The Offer Is Missing.";
  }
}

export function detectOpportunities(
  graph: BusinessGraph,
  signals: Signal[],
  isDemo: boolean,
): Opportunity[] {
  const cutoff = Date.now() - WINDOW_DAYS * 86_400_000;
  const recent = signals.filter(s => new Date(s.at).getTime() >= cutoff);
  const out: Opportunity[] = [];

  for (const c of clusterByTopic(recent)) {
    const related = graph.nodes.filter(n => overlaps(n, c.topics)).slice(0, 6);
    const kind = classify(c, related);
    if (!kind) continue;
    const s = suggest(kind, c, related);
    const members = c.members.size;
    out.push({
      id: `opp_${kind}_${c.topic.replace(/\W+/g, "-")}`,
      kind,
      topic: titleCase(c.topic),
      noticed: noticedText(kind, c, members, related),
      why: whyText(kind),
      suggestedTitle: s.title,
      suggestedSummary: s.summary,
      buildFrom: related
        .filter(n => ["course", "lesson", "resource", "app", "event"].includes(n.type))
        .slice(0, 4)
        .map(n => ({ id: n.id, title: n.title })),
      evidence: evidenceOf(c),
      audience: members,
      windowDays: WINDOW_DAYS,
      confidence: Math.min(1, 0.35 + c.signals.length / 80),
      isDemo,
      status: "open",
    });
  }

  return out.sort((a, b) => b.audience - a.audience);
}
