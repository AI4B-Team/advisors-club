// AIVA App Launch Kit.
//
// When an app exists, AIVA can do everything around it that a creator would
// otherwise have to think through: describe it, onboard members, answer the
// obvious questions, suggest whether it should be free or paid, work out who
// it's for, find where it belongs inside existing content, and propose an
// upsell path. Every piece is a *suggestion* — nothing is applied until the
// creator approves it.

import type { App, AppPricing } from "./types";
import { APP_KIND_LABEL, toAccessPolicy } from "./types";
import type { AccessPolicy } from "@/lib/commerce/types";
import type { BusinessGraph } from "@/lib/graph/types";
import { nodeId } from "@/lib/graph/types";
import { discoverForTarget } from "@/lib/relationships/discover";
import type { RelationshipDraft } from "@/lib/relationships/types";
import { getSignals, withinDays } from "@/lib/signals/store";

export type PricingSuggestion = {
  /** What AIVA would charge, if anything. */
  pricing: AppPricing;
  access: AccessPolicy;
  headline: string;
  rationale: string;
  /** The other sensible ways to offer it. */
  alternatives: { label: string; pricing: AppPricing; access: AccessPolicy }[];
};

export type AudienceRead = {
  count: number;
  label: string;
  reason: string;
  /** Verbatim member language that shows the need. */
  quotes: string[];
};

export type LaunchKit = {
  /** A member-facing description AIVA would use if the creator has none. */
  description: string;
  /** Short "how to use this" steps shown the first time a member opens it. */
  onboarding: string[];
  /** The questions members will ask, answered. */
  help: { q: string; a: string }[];
  pricing: PricingSuggestion;
  audience: AudienceRead;
  /** Existing content where this app would help — real relationship drafts. */
  placements: RelationshipDraft[];
  /** How the creator could grow revenue around the app. */
  upsell: string[];
};

/* ------------------------------------------------------------------ */

const VERB: Record<string, string> = {
  calculator: "Run The Numbers On",
  assessment: "Score Where They Stand On",
  quiz: "Test What They Know About",
  planner: "Build A Plan For",
  tracker: "Track Progress On",
  generator: "Generate",
  intake: "Capture What You Need For",
  checklist: "Work Through",
  "ai-tool": "Get AI Help With",
  embed: "Use",
};

function topicOf(app: App): string {
  const raw = app.name.replace(/\b(calculator|analyzer|planner|tracker|assessment|quiz|generator|builder|tool|app)\b/gi, "").trim();
  return raw || app.name;
}

function describe(app: App): string {
  if (app.description?.trim()) return app.description.trim();
  const verb = VERB[app.kind] ?? "Use";
  return `${verb} ${topicOf(app)} In Under A Minute — Using Your Own Method, Not A Generic Formula.`;
}

function onboardingFor(app: App): string[] {
  const schema = app.schema ?? { fields: [], outputs: [] };
  const first = schema.fields[0]?.label;
  const out = schema.outputs.find(o => o.primary) ?? schema.outputs[0];
  const steps: string[] = [];
  steps.push(first ? `Enter Your ${first} — Everything Else Builds From There.` : `Answer The Questions In Order.`);
  if (schema.fields.length > 2) steps.push(`Fill In The Remaining ${schema.fields.length - 1} Fields. Estimates Are Fine To Start.`);
  if (out) steps.push(`Read Your ${out.label} — That's The Number To Act On.`);
  steps.push("Save Or Share Your Result, Then Bring Questions To The Community.");
  return steps;
}

function helpFor(app: App): { q: string; a: string }[] {
  const schema = app.schema ?? { fields: [], outputs: [] };
  const out = schema.outputs.find(o => o.primary) ?? schema.outputs[0];
  const help: { q: string; a: string }[] = [
    {
      q: `What Is This ${APP_KIND_LABEL[app.kind]} For?`,
      a: describe(app),
    },
    {
      q: "What If I Don't Know One Of The Numbers?",
      a: "Use Your Best Estimate. The Tool Is Built To Show You Direction First And Precision Second — You Can Refine It Later.",
    },
  ];
  if (out) {
    help.push({
      q: `How Should I Read My ${out.label}?`,
      a: out.help?.trim() || `Treat ${out.label} As The Decision Point. If It Doesn't Clear Your Own Threshold, Change One Input At A Time And Watch What Moves.`,
    });
  }
  help.push({
    q: "Is My Data Saved?",
    a: "Your Entries Stay In Your Session Unless You Choose To Save The Result To Your Club Profile.",
  });
  return help;
}

/** How substantial the tool is — drives the free vs paid recommendation. */
function depthOf(app: App): number {
  const s = app.schema ?? { fields: [], outputs: [] };
  return s.fields.length + s.outputs.length * 2 + (s.interpretations?.length ?? 0);
}

function suggestPricing(app: App, graph: BusinessGraph, audience: number): PricingSuggestion {
  const depth = depthOf(app);
  const paidNeighbours = graph.nodes.filter(n => (n.access.mode === "paid" || n.access.mode === "plan") && n.type !== "app").length;
  const freeOpt = { label: "Free For Every Member", pricing: { model: "free" } as AppPricing, access: { mode: "free" } as AccessPolicy };
  const memberOpt = { label: "Included With Membership", pricing: { model: "free" } as AppPricing, access: { mode: "membership" } as AccessPolicy };
  const price = depth >= 16 ? 49 : depth >= 10 ? 29 : 19;
  const paidOpt = { label: `Paid Upgrade — $${price} One-Time`, pricing: { model: "one-time", price } as AppPricing, access: { mode: "paid", price } as AccessPolicy };

  if (depth >= 12 && audience >= 8) {
    return {
      ...paidOpt,
      headline: `Sell It — $${price} One-Time`,
      rationale: `This Is A Substantial Tool (${depth} Moving Parts) And ${audience} Members Have Already Shown They Need It. A One-Time Upgrade Prices It Like Software, Not Like A Download.`,
      alternatives: [memberOpt, freeOpt],
    };
  }
  if (paidNeighbours > 0 && depth >= 6) {
    return {
      ...memberOpt,
      headline: "Include It With Membership",
      rationale: "You Already Sell Paid Access Elsewhere. Bundling This Tool Makes The Membership Harder To Cancel And Costs You Nothing To Deliver.",
      alternatives: [paidOpt, freeOpt],
    };
  }
  return {
    ...freeOpt,
    headline: "Give It Away",
    rationale: "It's Light Enough To Be A Great First Experience. Free Tools Are The Cheapest Way To Show Members How You Think — Charge For The Deeper One Later.",
    alternatives: [memberOpt, paidOpt],
  };
}

function audienceFor(app: App): AudienceRead {
  const { signals, isDemo } = getSignals();
  const terms = [...topicOf(app).toLowerCase().split(/\s+/), app.kind].filter(t => t.length > 3);
  const recent = withinDays(signals, 60);
  const hits = recent.filter(s =>
    s.topics.some(t => terms.some(term => t.includes(term) || term.includes(t))));
  const members = new Set(hits.map(h => h.memberId));
  const quotes = hits.map(h => h.text).filter((x): x is string => Boolean(x)).slice(0, 2);

  if (members.size === 0) {
    return {
      count: 0,
      label: "Everyone, To Start",
      reason: "No One Has Asked For This Yet — Launch It To The Whole Club And I'll Watch Who Actually Uses It.",
      quotes: [],
    };
  }
  return {
    count: members.size,
    label: `${members.size} Members`,
    reason: `${members.size} Members Have Raised This Topic In The Last 60 Days${isDemo ? " (Sample Data)" : ""}. They're The People To Tell First.`,
    quotes,
  };
}

function upsellFor(app: App, pricing: PricingSuggestion, graph: BusinessGraph): string[] {
  const paid = graph.nodes.filter(n => n.type === "course" || n.type === "coaching")
    .filter(n => n.access.mode !== "free").slice(0, 2);
  const out: string[] = [];
  if (pricing.access.mode === "free") {
    out.push("Use The Result Screen As The Handoff — When A Member Gets Their Number, Offer The Content That Explains What To Do With It.");
  } else {
    out.push("Offer It Free For Seven Days, Then Ask For The Upgrade Once They've Seen Their First Real Result.");
  }
  if (paid.length) out.push(`Bundle It With ${paid.map(p => p.title).join(" And ")} So The Tool Sells The Program, Not The Other Way Around.`);
  out.push("Send Members Who Complete It Twice A Note From Your AI Persona Offering The Next Step.");
  return out;
}

/** Everything AIVA can do around a newly built app. */
export function buildLaunchKit(app: App, graph: BusinessGraph): LaunchKit {
  const audience = audienceFor(app);
  const pricing = suggestPricing(app, graph, audience.count);
  const placements = discoverForTarget(graph, nodeId("app", app.id), { limit: 6 });
  return {
    description: describe(app),
    onboarding: onboardingFor(app),
    help: helpFor(app),
    pricing,
    audience,
    placements,
    upsell: upsellFor(app, pricing, graph),
  };
}

/** Current policy, so the kit can show what's already set. */
export function currentAccess(app: App): AccessPolicy {
  return toAccessPolicy(app.access);
}
