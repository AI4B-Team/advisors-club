// AI-generated starting navigation.
//
// AI never gets its own navigation system: it produces a *proposal* of
// { type, label, group } rows which are materialised into the exact same
// NavItem shape the Manage → Navigation editor reads and writes. Once applied,
// the creator can rename / reorder / hide / add / remove anything as usual.

import { DEFAULT_MEMBER_NAV, type NavItem, type NavItemType } from "./config";
import { setNavConfig, type NavConfig } from "./store";

/** Content types AI is allowed to propose. Maps 1:1 to existing Advisors Club content. */
export const PROPOSABLE_TYPES: NavItemType[] = [
  "community", "courses", "coaching", "events", "resources", "apps", "members",
];

export type NavProposalItem = {
  /** Underlying Advisors Club content system. */
  type: NavItemType;
  /** Creator-facing label AI derived from the business description. */
  label: string;
  /** Optional section header ("LEARN", "CONNECT"). Empty = flat navigation. */
  group?: string;
};

export type NavProposal = {
  items: NavProposalItem[];
  rationale?: string;
};

function templateFor(type: NavItemType): NavItem | undefined {
  return DEFAULT_MEMBER_NAV.find(i => i.type === type);
}

function cleanLabel(raw: string, fallback: string): string {
  const s = (raw || "").replace(/[\r\n]+/g, " ").trim().slice(0, 28);
  if (!s) return fallback;
  // Title Case — Advisors Club global rule.
  return s
    .split(/\s+/)
    .map(w => (w.length <= 2 && w === w.toUpperCase() ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

/**
 * Normalise a raw AI response into a proposal:
 * de-duplicated, only known content types, Home always first and locked.
 */
export function normalizeProposal(raw: unknown): NavProposal {
  const rows = Array.isArray((raw as { items?: unknown[] })?.items) ? (raw as { items: unknown[] }).items : [];
  const seen = new Set<NavItemType>();
  const items: NavProposalItem[] = [];

  for (const r of rows) {
    const row = r as { type?: string; label?: string; group?: string };
    const type = String(row.type || "").toLowerCase() as NavItemType;
    if (!PROPOSABLE_TYPES.includes(type) || seen.has(type)) continue;
    const tmpl = templateFor(type);
    if (!tmpl) continue;
    seen.add(type);
    items.push({
      type,
      label: cleanLabel(String(row.label || ""), tmpl.label),
      group: row.group ? cleanLabel(String(row.group), "") : undefined,
    });
  }

  if (items.length === 0) return { items: defaultProposal().items };
  return { items, rationale: typeof (raw as { rationale?: string })?.rationale === "string" ? (raw as { rationale: string }).rationale : undefined };
}

/** The stock structure, used when AI is unavailable. */
export function defaultProposal(): NavProposal {
  return {
    items: DEFAULT_MEMBER_NAV
      .filter(i => i.type !== "home")
      .map(i => ({ type: i.type as NavItemType, label: i.label })),
  };
}

/**
 * Materialise a proposal into real nav items. Each row reuses the default
 * item for its content type, so routes, sub-links and behaviour are unchanged —
 * only the label, order and optional section change.
 */
export function proposalToNavItems(proposal: NavProposal): NavItem[] {
  const home = templateFor("home")!;
  const items: NavItem[] = [{ ...home, subs: home.subs.map(s => ({ ...s })), menu: [...home.menu] }];

  for (const row of proposal.items) {
    if (row.type === "home") continue;
    const tmpl = templateFor(row.type);
    if (!tmpl) continue;
    items.push({
      ...tmpl,
      subs: tmpl.subs.map(s => ({ ...s })),
      menu: [...tmpl.menu],
      label: row.label || tmpl.label,
      group: row.group || undefined,
    });
  }
  return items;
}

/** Write an AI proposal into the one shared navigation config. */
export function applyNavProposal(proposal: NavProposal): NavConfig {
  return setNavConfig({ items: proposalToNavItems(proposal) });
}
