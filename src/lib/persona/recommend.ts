// Contextual member recommendations for the AI Persona.
//
// Right help. Right member. Right moment.
//
// The engine reads the business graph (never individual feature stores),
// respects entitlements through the shared commerce access layer, obeys the
// creator's policy, and enforces frequency + fatigue rules so the same
// product is never pushed twice. Help always comes first: a recommendation is
// an ADDITION to an answer, never a replacement for one.

import {
  buildGraph, byId, tagSimilarity, visibleTo,
  type BusinessGraph, type EntityType, type GraphNode,
} from "@/lib/graph";
import { isPurchasable } from "@/lib/commerce/types";
import type { Viewer } from "@/lib/apps/access";
import type { PersonaSettings } from "./types";
import {
  getRecoPolicy, MODE_THRESHOLD,
  type RecoCategoryId, type RecoPolicy,
} from "./reco-policy";
import { recoMemory } from "./reco-events";
import { approvedTargetsFor } from "@/lib/relationships/consume";

export type MemberReco = {
  nodeId: string;
  title: string;
  type: EntityType;
  /** True when the member can already open it. */
  owned: boolean;
  paid: boolean;
  priceLabel?: string;
  href?: string;
  /** One honest sentence: why this, right now. */
  reason: string;
  /** Button copy — "Open X" when owned, "View X" when not. */
  cta: string;
  category: RecoCategoryId;
  score: number;
};

const PRODUCT_TYPES: EntityType[] = ["app", "resource", "course", "coaching", "event", "offer"];

const CATEGORY_OF: Record<string, RecoCategoryId> = {
  coaching: "coaching",
  event: "events",
};

function categoryFor(n: GraphNode, owned: boolean, paid: boolean): RecoCategoryId {
  if (CATEGORY_OF[n.type]) return CATEGORY_OF[n.type];
  if (owned) return "included";
  if (paid) return "paid";
  return "free-resources";
}

function words(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w.length > 3);
}

const STOP = new Set(["what", "when", "should", "would", "could", "about", "there", "their", "with", "this", "that", "have", "does", "help", "know", "make", "much", "need", "want", "into", "from", "your"]);

function relevance(n: GraphNode, terms: string[]): number {
  if (!terms.length) return 0;
  const hay = `${n.title} ${n.description} ${n.tags.join(" ")}`.toLowerCase();
  let hits = 0;
  for (const t of terms) if (hay.includes(t)) hits += hay.includes(n.title.toLowerCase()) ? 1 : 1;
  const overlap = tagSimilarity(n.tags, terms);
  return Math.min(1, hits / Math.max(3, terms.length) + overlap * 0.6);
}

export type RecoContext = {
  /** What the member just asked. */
  query: string;
  /** Optional extra context, e.g. the lesson they're on. */
  extra?: string;
  /** Member turns so far in this conversation. */
  turn: number;
  /** Recommendations already shown in this conversation. */
  shownThisConversation: { nodeId: string; paid: boolean; turn: number }[];
  /** Where the member is right now (lesson, post, app…), if known. */
  sourceId?: string;
};

export function recommendForMember(
  ctx: RecoContext,
  persona: PersonaSettings,
  viewer: Viewer,
  policy: RecoPolicy = getRecoPolicy(),
  graph: BusinessGraph = buildGraph(),
): MemberReco[] {
  if (policy.mode === "off") return [];

  const freq = policy.frequency;
  const already = ctx.shownThisConversation;
  if (already.length >= freq.maxPerConversation) return [];
  const lastTurn = already.length ? Math.max(...already.map(s => s.turn)) : -Infinity;
  if (ctx.turn - lastTurn < freq.minTurnsBetween) return [];

  const memberId = viewer.id ?? "me";
  const mem = recoMemory(memberId);
  const open = new Set(visibleTo(graph, viewer).map(n => n.id));
  const terms = [...new Set([...words(ctx.query), ...words(ctx.extra ?? "")])].filter(w => !STOP.has(w));
  const threshold = MODE_THRESHOLD[policy.mode];
  const paidShown = already.filter(s => s.paid).length;
  // Creator-approved connections beat topic matching: if the expert has already
  // said "this helps there", trust it.
  const approved = ctx.sourceId ? approvedTargetsFor(ctx.sourceId) : new Map();

  const out: MemberReco[] = [];
  for (const n of graph.nodes) {
    if (!PRODUCT_TYPES.includes(n.type)) continue;
    if (n.status === "draft" || n.status === "archived") continue;
    if (policy.blocked.includes(n.id)) continue;
    if (persona.recommendAllow.length && !persona.recommendAllow.includes(n.id)) continue;

    const owned = open.has(n.id);
    const paid = !owned && isPurchasable(n.access);
    if (!owned && !persona.recommendProducts) continue;
    if (mem.purchased.has(n.id) && !owned) continue;

    const category = categoryFor(n, owned, paid);
    if (!policy.categories[category]) continue;
    if (paid && paidShown >= freq.maxPaidPerConversation) continue;

    // Fatigue: cooldown per product, and stop entirely after repeated dismissals.
    if ((mem.dismissals[n.id] ?? 0) >= policy.dismissLimit) continue;
    const lastShown = mem.lastShown[n.id];
    if (lastShown !== undefined && lastShown < freq.cooldownDays * 86_400_000) continue;
    if (already.some(s => s.nodeId === n.id)) continue;

    const edge = approved.get(n.id);
    let score = relevance(n, terms);
    if (edge) score = Math.max(score, 0.6) + 0.25;
    if (!score) continue;
    // Learn from behaviour: acted-on products earn a little more room,
    // ignored ones lose it.
    score += Math.min(0.15, (mem.clicks[n.id] ?? 0) * 0.05);
    score -= (mem.dismissals[n.id] ?? 0) * 0.15;
    // Help the member with what they already have before selling anything.
    if (owned) score += 0.12;
    if (paid) score -= 0.05;
    if (score < threshold) continue;

    out.push({
      nodeId: n.id,
      title: n.title,
      type: n.type,
      owned,
      paid,
      priceLabel: paid && n.price ? `$${n.price}` : undefined,
      href: n.href,
      reason: edge?.memberCopy || reasonFor(n, owned, paid, persona),
      cta: owned ? `Open ${n.title}` : `View ${n.title}`,
      category,
      score,
    });
  }

  const room = Math.max(0, freq.maxPerConversation - already.length);
  return out.sort((a, b) => b.score - a.score).slice(0, Math.min(room, 2));
}

function reasonFor(n: GraphNode, owned: boolean, paid: boolean, persona: PersonaSettings): string {
  const who = persona.expertName || "your coach";
  if (owned) return `You already have access to this — it can run this for you.`;
  if (n.type === "coaching") return `${who} also runs a coaching program covering this in depth.`;
  if (n.type === "event") return `There's a live session on this you can join.`;
  if (paid) return `${who} also has this as a paid ${n.type === "app" ? "tool" : n.type} if you want the full version.`;
  return `This is free and covers exactly this.`;
}

/** Resolve a node for click-through (used by the card's button). */
export function recoHref(nodeId: string, graph: BusinessGraph = buildGraph()): string | undefined {
  return byId(graph, nodeId)?.href;
}
