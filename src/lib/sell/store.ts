import { DEFAULT_CLUB_SECTIONS, DEFAULT_LANDING_SECTIONS, sellDefForType } from "./blocks";
import type { Funnel, FunnelStepKind, SellBlock, SellDoc, SellPage, SellTheme, Surface } from "./types";
import { FUNNEL_STEP_KINDS } from "./types";

const KEY = "ac-sell-v1";

export const DEFAULT_SELL_THEME: SellTheme = {
  brand: "#F5A623",
  logoUrl: "",
  font: "system",
  buttonStyle: "rounded",
  background: "light",
  density: "comfortable",
  radius: 14,
};

export function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function makeSellBlock(type: string, props: Record<string, string | number | boolean> = {}): SellBlock {
  const def = sellDefForType(type);
  return { id: uid(type), type, props: { ...(def?.defaults ?? {}), ...props } };
}

export function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "page";
}

export function makePage(surface: Surface, title: string, types?: string[]): SellPage {
  const list = types ?? (surface === "club" ? DEFAULT_CLUB_SECTIONS : DEFAULT_LANDING_SECTIONS);
  return {
    id: uid(surface),
    surface,
    title,
    slug: slugify(title),
    blocks: list.map(t => makeSellBlock(t)),
    theme: { ...DEFAULT_SELL_THEME },
    updatedAt: Date.now(),
    publishedAt: null,
  };
}

export function makeFunnel(name: string, steps: FunnelStepKind[]): Funnel {
  return {
    id: uid("funnel"),
    name,
    steps: steps.map(kind => ({
      id: uid("step"),
      kind,
      label: FUNNEL_STEP_KINDS.find(k => k.kind === kind)?.label ?? kind,
      pageId: null,
      url: "",
    })),
    live: false,
    updatedAt: Date.now(),
  };
}

export function defaultSellDoc(): SellDoc {
  return {
    version: 1,
    clubPage: { ...makePage("club", "Public Club Page"), slug: "club" },
    pages: [],
    funnels: [],
    funnelsEnabled: false,
  };
}

type Listener = (d: SellDoc) => void;
const listeners = new Set<Listener>();

export function getSellDoc(): SellDoc {
  if (typeof window === "undefined") return defaultSellDoc();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultSellDoc();
    const parsed = JSON.parse(raw) as Partial<SellDoc>;
    const base = defaultSellDoc();
    return {
      ...base,
      ...parsed,
      clubPage: { ...base.clubPage, ...(parsed.clubPage ?? {}), theme: { ...DEFAULT_SELL_THEME, ...(parsed.clubPage?.theme ?? {}) } },
      pages: Array.isArray(parsed.pages) ? parsed.pages : [],
      funnels: Array.isArray(parsed.funnels) ? parsed.funnels : [],
    };
  } catch {
    return defaultSellDoc();
  }
}

export function saveSellDoc(doc: SellDoc): SellDoc {
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(doc));
  listeners.forEach(l => l(doc));
  return doc;
}

export function subscribeSell(fn: Listener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export function findPage(doc: SellDoc, id: string): SellPage | null {
  if (id === doc.clubPage.id || id === "club") return doc.clubPage;
  return doc.pages.find(p => p.id === id) ?? null;
}

export function upsertPage(doc: SellDoc, page: SellPage): SellDoc {
  const next: SellPage = { ...page, updatedAt: Date.now() };
  if (page.id === doc.clubPage.id) return { ...doc, clubPage: next };
  const i = doc.pages.findIndex(p => p.id === page.id);
  const pages = doc.pages.slice();
  if (i < 0) pages.push(next); else pages[i] = next;
  return { ...doc, pages };
}

export function move<T>(arr: T[], from: number, to: number): T[] {
  const next = arr.slice();
  if (from < 0 || from >= next.length || to < 0 || to >= next.length) return next;
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
