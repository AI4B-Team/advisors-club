// Shared catalog of the things an access policy can point at: membership
// plans, courses and coaching programs. Read-only projections of the existing
// feature stores, so no page has to know where these live.

import { getGS } from "@/lib/gs-store";
import { loadAdmin } from "@/lib/courses/storage";

export type CatalogItem = { id: string; label: string };

export function planOptions(): CatalogItem[] {
  const m = getGS().membership;
  const out: CatalogItem[] = [];
  if (m?.freeLabel) out.push({ id: m.freeLabel, label: m.freeLabel });
  if (m?.hasPaid && m.paidLabel) out.push({ id: m.paidLabel, label: m.paidLabel });
  if (!out.length) return [{ id: "Free", label: "Free" }, { id: "Pro", label: "Pro" }, { id: "Founding", label: "Founding" }];
  return out;
}

export function courseOptions(): CatalogItem[] {
  try {
    return loadAdmin().map(c => ({ id: c.id, label: c.title }));
  } catch {
    return [];
  }
}

export function programOptions(): CatalogItem[] {
  const list = getGS().coaching ?? [];
  return list.map(p => ({ id: p.id, label: p.name }));
}
