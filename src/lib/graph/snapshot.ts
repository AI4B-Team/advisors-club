// Compact text snapshot of the business graph for AI prompts.
// Mirrors the existing coaching snapshot pattern so AI features share a shape.

import { byType, findOpportunities } from "./query";
import type { BusinessGraph, GraphNode } from "./types";
import { ENTITY_LABEL } from "./types";

function line(n: GraphNode): string {
  const bits = [
    `- ${n.title}`,
    n.description ? `— ${n.description.slice(0, 120)}` : "",
    `[${n.status}${n.price ? `, $${n.price}` : ""}${n.access.type !== "all" ? `, ${n.access.type}` : ""}]`,
    n.tags.length ? `tags: ${n.tags.slice(0, 5).join(", ")}` : "",
  ];
  return bits.filter(Boolean).join(" ");
}

export function graphSnapshot(g: BusinessGraph, opts: { limitPerType?: number } = {}): string {
  const limit = opts.limitPerType ?? 12;
  const b = g.business;
  const sections: string[] = [
    `BUSINESS: ${b.name || "(unnamed)"}${b.niche ? ` — ${b.niche}` : ""}`,
    b.audience ? `Audience: ${b.audience}` : "",
    b.transformation ? `Transformation: ${b.transformation}` : "",
    b.topics.length ? `Topics: ${b.topics.join(", ")}` : "",
    "",
  ];

  const groups: (keyof typeof ENTITY_LABEL)[] = [
    "community", "course", "coaching", "event", "resource", "app", "offer", "persona", "page",
  ];
  for (const t of groups) {
    const items = byType(g, t);
    if (!items.length) continue;
    sections.push(`${ENTITY_LABEL[t].toUpperCase()}S:`);
    sections.push(...items.slice(0, limit).map(line), "");
  }

  const rels = g.edges.filter(e => e.type !== "contains").slice(0, 40);
  if (rels.length) {
    sections.push("RELATIONSHIPS:");
    for (const e of rels) {
      const from = g.nodes.find(n => n.id === e.from);
      const to = g.nodes.find(n => n.id === e.to);
      if (!from || !to) continue;
      sections.push(`- ${from.title} —${e.type}→ ${to.title} (${e.weight})`);
    }
    sections.push("");
  }

  const ops = findOpportunities(g);
  if (ops.length) {
    sections.push("OPPORTUNITY SIGNALS:");
    sections.push(...ops.slice(0, 8).map(o => `- [${o.kind}] ${o.title}: ${o.detail}`));
  }

  return sections.filter(s => s !== undefined).join("\n").slice(0, 12000);
}
