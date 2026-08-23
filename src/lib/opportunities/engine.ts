// Pattern detection over the creator's real ecosystem.
//
// The engine reads behavioral signals (community conversations, member
// questions, search, course consumption and completion, coaching, events,
// resource and app usage, purchases) and compares them against what the
// business already offers via the Business Graph. It only emits an opportunity
// when the SHAPE of the behavior says something is missing, unconnected, or
// unmonetized. It never invents numbers: every count comes straight from the
// signal set, and sample-derived opportunities are flagged `isDemo`.

import type { BusinessGraph, GraphNode } from "@/lib/graph/types";
import { SIGNAL_LABEL, type Signal, type SignalKind } from "@/lib/signals/types";
import type {
  ConnectionTarget, MonetizationOption, Opportunity, OpportunityCapability,
  OpportunityEvidence, OpportunityKind,
} from "./types";

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
  const hasPaid = related.some(n => !!n.price);

  const questions = count(c, "community-question", "persona-chat", "course-question");
  const searches = count(c, "search");
  const completions = count(c, "course-complete");
  const abandons = count(c, "abandon");
  const appRuns = count(c, "app-run");
  const purchases = count(c, "purchase");
  const wantsHuman = /coach|one on one|1:1|review my/.test(c.topics.join(" "));

  if (abandons >= 14) return "retention";
  if (abandons >= 10 && abandons >= questions) return "engagement";
  if (wantsHuman && questions >= 10 && !hasCoaching) return "coaching";
  if (completions >= 15 && purchases >= 3 && hasPaid) return "upsell";
  if (completions >= 15 && questions >= 10) return "course";
  if (questions >= 15 && hasContent && !hasApp) return "app";
  if (appRuns >= 15 && questions >= 8 && !hasContent) return "course";
  if (appRuns >= 12 && hasPaid && related.some(n => n.type === "app" && !n.price)) return "upsell";
  if (searches >= 12 && !hasResource) return "resource";
  if (questions >= 12 && !hasContent) return "course";
  if (questions >= 10 && hasContent && hasPaid) return "cross-sell";
  if (questions >= 8 && !hasEvent && hasContent) return "event";
  if (questions >= 10 && !wantsHuman && hasContent) return "automation";
  if (purchases >= 5 && related.every(n => !n.price) && related.length > 0) return "product";
  return null;
}

function suggest(kind: OpportunityKind, c: Cluster, related: GraphNode[]): { title: string; summary: string } {
  const topic = titleCase(c.topic);
  const source = related.find(n => n.type === "course");
  switch (kind) {
    case "app":
      return {
        title: `${topic} Estimator`,
        summary: `An Interactive Tool Members Can Run Themselves Instead Of Asking The Same ${topic} Question Again.`,
      };
    case "course":
      return {
        title: source ? `Going Further With ${topic}` : `Mastering ${topic}`,
        summary: source
          ? `A Follow-On Course For Members Who Finished “${source.title}” And Are Now Asking About ${topic}.`
          : `A Focused Course On ${topic} — Currently Unanswered By Your Catalog.`,
      };
    case "resource":
      return {
        title: `${topic} Templates & Checklist`,
        summary: "A Downloadable Pack Members Are Already Searching For By Name.",
      };
    case "coaching":
      return {
        title: `${topic} Review Sessions`,
        summary: "A Structured Program For Members Asking For Direct, Personal Review.",
      };
    case "event":
      return {
        title: `Live ${topic} Workshop`,
        summary: `A Live Session To Answer The Same ${topic} Questions Once, In Front Of Everyone.`,
      };
    case "content":
      return {
        title: `Connect ${topic} Across Your Content`,
        summary: "Add Natural, Approved Mentions Everywhere Members Already Meet This Topic.",
      };
    case "engagement":
      return {
        title: `Rework The ${topic} Path`,
        summary: "Members Stall Here — Shorter Steps And A Clear First Win Would Recover Them.",
      };
    case "retention":
      return {
        title: `${topic} Re-Engagement Sequence`,
        summary: "Reach Members At The Exact Point They Go Quiet, Before They Leave For Good.",
      };
    case "automation":
      return {
        title: `Handle ${topic} Questions Automatically`,
        summary: "Let Your AI Answer This Recurring Question From Your Own Material, And Escalate Anything Unusual.",
      };
    case "upsell":
      return {
        title: `${topic} Advanced Tier`,
        summary: "A Paid Step Up For Members Who Already Finished And Kept Going.",
      };
    case "cross-sell":
      return {
        title: `Pair ${topic} With What You Already Sell`,
        summary: "Point Members At The Product That Answers The Question They Just Asked.",
      };
    case "product":
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
  const src = related.find(n => n.type === "course");
  switch (kind) {
    case "app":
      return `${questions} Questions About ${topic} From ${members} Members During The Last ${WINDOW_DAYS} Days. Your Content Answers Parts Of It, But Members Have No Tool To Work Through ${topic} Themselves.`;
    case "course":
      return src
        ? `Members Who Complete “${src.title}” Frequently Ask About ${topic}.`
        : `${members} Members Raised ${topic} ${questions} Times, And Nothing In Your Catalog Covers It.`;
    case "resource":
      return `${topic} Is Searched For Repeatedly, Suggesting Members Expect A Template Or Checklist That Doesn't Exist Yet.`;
    case "coaching":
      return `${members} Members Asked For Direct, Personal Help With ${topic}.`;
    case "event":
      return `The Same ${topic} Questions Keep Recurring Across ${members} Members — A Pattern, Not One-Off Confusion.`;
    case "content":
      return `${topic} Comes Up Across Content That Never Points Members Anywhere Next.`;
    case "engagement":
      return `${members} Members Reached ${topic} And Stopped Progressing.`;
    case "retention":
      return `${members} Members Went Quiet Shortly After ${topic} — The Same Exit Point, Over And Over.`;
    case "automation":
      return `${questions} ${topic} Questions Arrived, And Nearly All Of Them Have The Same Answer Already Sitting In Your Material.`;
    case "upsell":
      return `Members Who Finished ${topic} Content Keep Going And Then Run Out Of Things To Buy From You.`;
    case "cross-sell":
      return `${members} Members Asked About ${topic} While Something You Already Sell Answers It Directly.`;
    case "product":
    case "monetization":
      return `Strong ${topic} Demand Is Landing On Content That Isn't Attached To Any Offer.`;
  }
}

function whyText(kind: OpportunityKind): string {
  switch (kind) {
    case "app": return "Interactive Apps Turn Passive Readers Into Members Who Take Action — And They're The Easiest Thing To Recommend Inside Existing Lessons.";
    case "course": return "This Is Demand From Members Who Already Trust You And Have Finished Something — The Highest-Intent Audience You Have.";
    case "resource": return "Repeated Search With No Result Is A Silent Support Cost And An Easy Win.";
    case "coaching": return "Requests For Personal Review Are Direct Buying Signals For Higher-Ticket Offers.";
    case "event": return "Answering Once, Live, Beats Answering The Same Question Dozens Of Times.";
    case "content": return "Placement Beats Promotion — Members Adopt Things That Appear Exactly Where The Question Comes Up.";
    case "engagement": return "A Single Stall Point Quietly Caps Completion — And Completion Drives Renewals.";
    case "retention": return "Members Rarely Announce That They're Leaving. This Is The Window Where A Small Nudge Still Works.";
    case "automation": return "Every Repeat Answer You Give Personally Is Time You Can't Spend Building Something New.";
    case "upsell": return "The Cheapest Revenue You Have Comes From Members Who Already Finished Something And Want More.";
    case "cross-sell": return "You Don't Need A New Product Here — Only The Right Introduction At The Right Moment.";
    case "product":
    case "monetization": return "Attention Already Exists Here; Only The Offer Is Missing.";
  }
}

/** The one-line headline shown on the row. */
function insightText(kind: OpportunityKind, c: Cluster, members: number, related: GraphNode[]): string {
  const topic = titleCase(c.topic);
  const src = related.find(n => n.type === "course");
  const questions = count(c, "community-question", "persona-chat", "course-question");
  switch (kind) {
    case "app": return `${questions} Questions About ${topic} And No Tool To Answer Them.`;
    case "course": return src
      ? `Members Who Finish “${src.title}” Keep Asking About ${topic}.`
      : `${members} Members Asked About ${topic} And Nothing Covers It.`;
    case "resource": return `${topic} Is Searched For Repeatedly With No Matching Resource.`;
    case "coaching": return `${members} Members Have Asked For Personal ${topic} Feedback.`;
    case "event": return `Questions About ${topic} Have Spiked.`;
    case "content": return `${topic} Appears Across Your Content With Nothing Connected To It.`;
    case "engagement": return `Members Reaching ${topic} Are Much Less Likely To Continue.`;
    case "retention": return `${members} Members Go Quiet Right After ${topic}.`;
    case "automation": return `You're Answering The Same ${topic} Question ${questions} Times.`;
    case "upsell": return `${topic} Graduates Have Nothing Left To Buy.`;
    case "cross-sell": return `${members} Members Asked For Something You Already Sell.`;
    case "product":
    case "monetization": return `${topic} Demand Is Landing On Content That Isn't Sold.`;
  }
}

function actionText(kind: OpportunityKind, s: { title: string }): string {
  switch (kind) {
    case "app": return `Build ${s.title}.`;
    case "course": return `Create The Course “${s.title}”.`;
    case "resource": return `Publish ${s.title}.`;
    case "coaching": return `Create ${s.title}.`;
    case "event": return `Host ${s.title}.`;
    case "content": return `${s.title}.`;
    case "engagement": return "Review And Shorten This Section.";
    case "retention": return `Run ${s.title}.`;
    case "automation": return `${s.title}.`;
    case "upsell": return `Package ${s.title}.`;
    case "cross-sell": return `${s.title}.`;
    case "product":
    case "monetization": return `Package ${s.title}.`;
  }
}

/** Exactly what AIVA is offering to do — never vague, never automatic. */
function capabilitiesFor(kind: OpportunityKind, s: { title: string }): OpportunityCapability[] {
  switch (kind) {
    case "app": return [
      { label: `Build ${s.title}` },
      { label: "Add It To Your Apps Library" },
      { label: "Connect It To Relevant Course Lessons", needsApproval: true },
      { label: "Recommend It When Members Ask Related Questions", needsApproval: true },
    ];
    case "course": return [
      { label: "Draft The Outline From Your Existing Material" },
      { label: "Write Lesson Drafts For Your Review", needsApproval: true },
      { label: "Suggest Where To Link It From Existing Courses", needsApproval: true },
    ];
    case "resource": return [
      { label: "Create The Resource From Your Own Content" },
      { label: "Add It To Your Resources Library" },
      { label: "Attach It To The Lessons Members Search From", needsApproval: true },
    ];
    case "coaching": return [
      { label: "Design The Program Structure And Cadence" },
      { label: "Draft The Offer And Booking Page", needsApproval: true },
      { label: "Invite The Members Who Asked For It", needsApproval: true },
    ];
    case "event": return [
      { label: "Plan The Session And Agenda From Real Questions" },
      { label: "Draft The Invite And Reminder Sequence", needsApproval: true },
      { label: "Turn The Replay Into A Lesson Afterwards", needsApproval: true },
    ];
    case "content": return [
      { label: "Review Every Suggested Connection" },
      { label: "Add Natural Mentions Where You Approve Them", needsApproval: true },
      { label: "Skip Anywhere It Would Feel Like A Promotion" },
    ];
    case "engagement": return [
      { label: "Show Exactly Where Members Stop" },
      { label: "Propose A Shorter Path With A Clear First Win" },
      { label: "Re-Order Or Split The Section", needsApproval: true },
    ];
    case "retention": return [
      { label: "Detect The Quiet Moment For Each Member" },
      { label: "Send A Personal Nudge Pointing At Their Next Step", needsApproval: true },
      { label: "Flag Anyone Still Quiet After Two Weeks" },
    ];
    case "automation": return [
      { label: "Answer This Question From Your Approved Knowledge Only" },
      { label: "Escalate Anything Unusual To You" },
      { label: "Log Every Answer In Activity" },
    ];
    case "upsell": return [
      { label: "Draft The Advanced Tier And Its Positioning" },
      { label: "Identify The Members Who Qualify" },
      { label: "Recommend It Only At Genuine Completion Moments", needsApproval: true },
    ];
    case "cross-sell": return [
      { label: "Match The Question To The Product That Answers It" },
      { label: "Recommend It Only After Giving Real Help First" },
      { label: "Never Recommend Something A Member Already Owns" },
    ];
    case "product":
    case "monetization": return [
      { label: "Draft The Offer, Pricing, And Sales Copy" },
      { label: "Assemble It From Content You Already Own" },
      { label: "Connect It To The Content Driving Demand", needsApproval: true },
    ];
  }
}

const SELLABLE: OpportunityKind[] = ["app", "course", "resource", "coaching", "event", "product", "upsell", "monetization"];

function monetizationFor(kind: OpportunityKind): MonetizationOption[] | undefined {
  if (!SELLABLE.includes(kind)) return undefined;
  if (kind === "upsell" || kind === "product" || kind === "monetization") return ["paid", "included"];
  return ["free", "included", "paid"];
}

const BUILD_HREF: Record<OpportunityKind, string> = {
  app: "/app/apps",
  course: "/app/club/courses",
  resource: "/app/club/resources",
  coaching: "/app/club/coaching",
  event: "/app/calendar",
  content: "/app/aiva",
  product: "/app/sell",
  upsell: "/app/sell",
  "cross-sell": "/app/sell",
  monetization: "/app/sell",
  automation: "/app/aiva",
  engagement: "/app/club/courses",
  retention: "/app/club/members",
};

function signalLine(evidence: OpportunityEvidence[]): string {
  return evidence
    .slice(0, 3)
    .map(e => `${e.count} ${SIGNAL_LABEL[e.kind]}`)
    .join(" · ");
}

/** Rough business impact, used only to decide emphasis in the feed. */
function impactOf(kind: OpportunityKind, members: number, confidence: number): number {
  const weight: Record<OpportunityKind, number> = {
    upsell: 1, product: 1, monetization: 0.95, retention: 0.95, app: 0.9, course: 0.85,
    "cross-sell": 0.8, coaching: 0.8, automation: 0.75, engagement: 0.7, event: 0.6, resource: 0.55,
    content: 0.5,
  };
  const reach = Math.min(1, members / 40);
  return Math.min(1, weight[kind] * (0.45 + 0.35 * reach + 0.2 * confidence));
}

const GROUP_LABEL: Record<string, string> = {
  lesson: "Course Lessons", module: "Course Modules", course: "Courses",
  resource: "Resources", post: "Community Posts", community: "Community Spaces",
  coaching: "Coaching Programs", session: "Coaching Sessions", event: "Events",
  page: "Onboarding Sequences", persona: "AI Persona Answers", offer: "Offers",
};

function groupConnections(nodes: GraphNode[]): ConnectionTarget[] {
  const map = new Map<string, number>();
  for (const n of nodes) {
    const label = GROUP_LABEL[n.type] ?? "Other Content";
    map.set(label, (map.get(label) ?? 0) + 1);
  }
  return [...map.entries()].map(([group, c]) => ({ group, count: c })).sort((a, b) => b.count - a.count);
}

/**
 * Graph-derived opportunities: patterns that live in the catalog itself rather
 * than in a topic cluster — heavy usage on a free asset (upsell), and brand new
 * things nothing points at yet (content connection).
 */
function catalogOpportunities(graph: BusinessGraph, recent: Signal[], isDemo: boolean): Opportunity[] {
  const out: Opportunity[] = [];
  const hosts = graph.nodes.filter(n =>
    ["lesson", "module", "course", "resource", "post", "community", "page", "persona"].includes(n.type),
  );

  for (const node of graph.nodes.filter(n => n.type === "app" || n.type === "resource")) {
    const runs = recent.filter(s => s.kind === "app-run" && (s.nodeId === node.id || overlaps(node, s.topics)));
    const members = new Set(runs.map(s => s.memberId)).size;

    // UPSELL — habitual usage of something currently free.
    if (node.type === "app" && members >= 20 && !node.price) {
      const s = { title: `${node.title} Pro`, summary: "A Paid Tier With Saved Scenarios, Exports, And Advanced Inputs For Your Heaviest Users." };
      out.push({
        id: `opp_upsell_${node.id}`,
        kind: "upsell",
        topic: node.title,
        insight: `${members} Members Use ${node.title} Every Month — For Free.`,
        signal: `${runs.length} App Sessions · Included Free Today`,
        action: `Create A Paid Tier Of ${node.title}.`,
        noticed: `${node.title} Is One Of Your Most-Used Assets, And Every Session Is Currently Free.`,
        why: whyText("upsell"),
        suggestedTitle: s.title,
        suggestedSummary: s.summary,
        buildFrom: [{ id: node.id, title: node.title }],
        canDo: capabilitiesFor("upsell", s),
        monetization: monetizationFor("upsell"),
        evidence: [{ kind: "app-run", count: runs.length, samples: [] }],
        audience: members,
        windowDays: WINDOW_DAYS,
        confidence: 0.8,
        impact: impactOf("upsell", members, 0.8),
        isDemo,
        status: "new",
        buildHref: "/app/sell",
      });
    }

    // CONTENT CONNECTION — something real that nothing points at yet.
    const referenced = new Set(
      graph.edges.filter(e => e.to === node.id || e.from === node.id).flatMap(e => [e.from, e.to]),
    );
    const relevant = hosts.filter(l => overlaps(l, node.tags.length ? node.tags : [node.title]) && !referenced.has(l.id));
    if (relevant.length >= 3) {
      const connections = groupConnections(relevant);
      const s = {
        title: `Connect ${node.title} Across Existing Content`,
        summary: "Add A Short, Natural Mention Wherever Members Already Meet This Topic — Only Where You Approve It.",
      };
      out.push({
        id: `opp_content_${node.id}`,
        kind: "content",
        topic: node.title,
        insight: `Your ${node.title} Matches ${relevant.length} Pieces Of Existing Content.`,
        signal: connections.map(c => `${c.count} ${c.group}`).join(" · "),
        action: "Review The Connections AIVA Found.",
        noticed: `${node.title} Exists, But The Content Members Read On The Same Topic Never Mentions It.`,
        why: whyText("content"),
        suggestedTitle: s.title,
        suggestedSummary: s.summary,
        buildFrom: relevant.slice(0, 5).map(l => ({ id: l.id, title: l.title })),
        canDo: capabilitiesFor("content", s),
        connections,
        evidence: [],
        audience: 0,
        windowDays: WINDOW_DAYS,
        confidence: 0.7,
        impact: impactOf("content", 0, 0.7),
        isDemo,
        status: "new",
        buildHref: "/app/aiva",
      });
    }
  }

  return out;
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
    const evidence = evidenceOf(c);
    const confidence = Math.min(1, 0.35 + c.signals.length / 80);
    out.push({
      id: `opp_${kind}_${c.topic.replace(/\W+/g, "-")}`,
      kind,
      topic: titleCase(c.topic),
      insight: insightText(kind, c, members, related),
      signal: signalLine(evidence),
      action: actionText(kind, s),
      noticed: noticedText(kind, c, members, related),
      why: whyText(kind),
      suggestedTitle: s.title,
      suggestedSummary: s.summary,
      buildFrom: related
        .filter(n => ["course", "lesson", "resource", "app", "event"].includes(n.type))
        .slice(0, 4)
        .map(n => ({ id: n.id, title: n.title })),
      canDo: capabilitiesFor(kind, s),
      monetization: monetizationFor(kind),
      evidence,
      audience: members,
      windowDays: WINDOW_DAYS,
      confidence,
      impact: impactOf(kind, members, confidence),
      isDemo,
      status: "new",
      buildHref: BUILD_HREF[kind],
    });
  }

  out.push(...catalogOpportunities(graph, recent, isDemo));

  return out.sort((a, b) => b.impact - a.impact || b.audience - a.audience);
}
