// Access-aware knowledge for the AI Persona.
//
// The Persona reads the business graph, not individual feature stores, and it
// only ever receives the CONTENT of nodes the viewer is allowed to open.
// Gated nodes are included as titles only, explicitly marked locked, so the
// Persona can say "that's inside X" without leaking what's inside X.

import { buildGraph, visibleTo, type EntityType, type GraphNode } from "@/lib/graph";
import type { Viewer } from "@/lib/apps/access";
import { getAivaAdmin } from "@/lib/aiva-admin";
import { getAivaContext } from "@/lib/aiva-context";
import type { PersonaSettings, PersonaSourceId } from "./types";
import { getVoiceProfile } from "./voice";
import { buildVoiceInstructions, type VoiceContext } from "./voice-prompt";

const SOURCE_TYPES: Record<PersonaSourceId, EntityType[]> = {
  methodology: [],
  courses: ["course"],
  lessons: ["module", "lesson"],
  resources: ["resource"],
  posts: ["post"],
  faqs: [],
  uploads: [],
  apps: ["app"],
  coaching: ["coaching", "session"],
  events: ["event"],
};

function allowedTypes(s: PersonaSettings): Set<EntityType> {
  const set = new Set<EntityType>();
  (Object.keys(SOURCE_TYPES) as PersonaSourceId[]).forEach(id => {
    if (s.sources[id]) SOURCE_TYPES[id].forEach(t => set.add(t));
  });
  return set;
}

function line(n: GraphNode): string {
  const bits = [n.title];
  if (n.description) bits.push(n.description.slice(0, 220));
  if (n.tags.length) bits.push(`tags: ${n.tags.slice(0, 6).join(", ")}`);
  return `- [${n.type}] ${bits.join(" — ")}`;
}

export type PersonaKnowledge = {
  text: string;
  /** Nodes the viewer may be pointed to and recommended. */
  openIds: string[];
  lockedIds: string[];
};

export function personaKnowledge(s: PersonaSettings, viewer: Viewer): PersonaKnowledge {
  const graph = buildGraph();
  const types = allowedTypes(s);
  const open = new Set(visibleTo(graph, viewer).map(n => n.id));

  const relevant = graph.nodes.filter(n => types.has(n.type));
  const unlocked = relevant.filter(n => open.has(n.id));
  const locked = relevant.filter(n => !open.has(n.id) && n.status !== "draft");

  const out: string[] = [];
  const ctx = getAivaContext();
  const admin = getAivaAdmin();

  if (s.sources.methodology) {
    const method = admin.facts["your-methodology"] || ctx.profile.transformation;
    if (method) out.push(`METHODOLOGY:\n${method}`);
  }
  if (ctx.profile.business || ctx.profile.expertise) {
    out.push(`ABOUT THE BUSINESS:\n${[ctx.profile.business, ctx.profile.expertise, ctx.profile.audience].filter(Boolean).join(" | ")}`);
  }
  if (s.sources.faqs && admin.facts["your-offers"]) out.push(`OFFERS:\n${admin.facts["your-offers"]}`);
  // Admin-added sources are only visible to the Persona when the expert marked
  // them member-facing. "aiva" sources are the admin operator's alone.
  const personaSources = admin.knowledge.filter(
    k => (k.audience ?? "both") !== "aiva" && k.status === "ready",
  );
  if (personaSources.length) {
    out.push(`ADDITIONAL SOURCES YOU ARE TRAINED ON:\n${personaSources.map(k => `- ${k.label}${k.detail ? ` — ${k.detail}` : ""}`).join("\n")}`);
  }
  if (s.sources.uploads && s.uploads.length) {
    out.push(`UPLOADED KNOWLEDGE:\n${s.uploads.map(u => `## ${u.title}\n${u.body.slice(0, 1200)}`).join("\n\n")}`);
  }
  if (unlocked.length) {
    out.push(`CONTENT THIS MEMBER CAN OPEN (safe to explain in full):\n${unlocked.slice(0, 80).map(line).join("\n")}`);
  }
  if (locked.length) {
    out.push(
      "LOCKED CONTENT — TITLES ONLY. The member does NOT have access. You may mention that it exists and how to get it, but never explain, summarize, quote or reveal what is inside:\n" +
      locked.slice(0, 40).map(n => `- [${n.type}] ${n.title}`).join("\n"),
    );
  }
  if (!s.recommendProducts) {
    out.push("RECOMMENDATIONS: Do not suggest products the member does not already own.");
  } else if (s.recommendAllow.length) {
    const names = graph.nodes.filter(n => s.recommendAllow.includes(n.id)).map(n => n.title);
    if (names.length) out.push(`YOU MAY RECOMMEND ONLY: ${names.join(", ")}`);
  }

  return {
    text: out.join("\n\n").slice(0, 9000),
    openIds: [...open],
    lockedIds: locked.map(n => n.id),
  };
}

/** Persona rules folded into the assistant's instruction block. */
export function personaInstructions(
  s: PersonaSettings,
  context: VoiceContext = "casual",
  personaId = "primary",
): string {
  const parts = [s.instructions, s.personality && `Personality: ${s.personality}.`];
  if (s.expertise.length) parts.push(`Areas of expertise: ${s.expertise.join(", ")}.`);
  if (s.shouldAnswer.length) parts.push(`Always help with: ${s.shouldAnswer.join("; ")}.`);
  if (s.shouldNotAnswer.length) parts.push(`Never answer: ${s.shouldNotAnswer.join("; ")} — hand those to the human expert.`);
  parts.push(buildVoiceInstructions(getVoiceProfile(personaId), context));
  parts.push("Never reveal, summarize or quote content marked LOCKED. Point to how to unlock it instead.");
  return parts.filter(Boolean).join(" ");
}
