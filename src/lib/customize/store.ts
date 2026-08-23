import type { Block, CustomizeDoc, PageId, Theme, WhiteLabel } from "./types";
import { defForType } from "./blocks";

const KEY = "ac-customize-v1";

export const DEFAULT_THEME: Theme = {
  brand: "#F5A623",
  logoUrl: "",
  coverUrl: "",
  font: "system",
  buttonStyle: "rounded",
  background: "light",
  density: "comfortable",
  radius: 14,
  showNav: true,
  showRail: true,
};

export const DEFAULT_WHITE_LABEL: WhiteLabel = {
  customDomain: "",
  domainVerified: false,
  hidePlatformBranding: false,
  emailFromName: "",
  supportEmail: "",
  faviconUrl: "",
};

export function makeBlock(type: string, props: Record<string, string | number | boolean> = {}): Block {
  const def = defForType(type);
  return {
    id: `${type}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    props: { ...(def?.defaults ?? {}), ...props },
  };
}

function seed(types: string[]): Block[] {
  return types.map(t => makeBlock(t));
}

export function defaultDoc(): CustomizeDoc {
  return {
    pages: {
      home: seed(["hero", "feed", "events", "leaderboard"]),
      community: seed(["spaces", "featured-posts", "feed", "members"]),
      "course-home": seed(["hero", "courses", "progress", "resources"]),
      "member-dashboard": seed(["progress", "upcoming-sessions", "challenges", "quick-links"]),
      "public-club": seed(["hero", "offer", "testimonials", "pricing"]),
    },
    theme: { ...DEFAULT_THEME },
    whiteLabel: { ...DEFAULT_WHITE_LABEL },
    updatedAt: Date.now(),
    publishedAt: null,
  };
}

type Listener = (d: CustomizeDoc) => void;
const listeners = new Set<Listener>();

export function getDoc(): CustomizeDoc {
  if (typeof window === "undefined") return defaultDoc();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultDoc();
    const parsed = JSON.parse(raw) as Partial<CustomizeDoc>;
    const base = defaultDoc();
    return {
      ...base,
      ...parsed,
      pages: { ...base.pages, ...(parsed.pages ?? {}) } as Record<PageId, Block[]>,
      theme: { ...base.theme, ...(parsed.theme ?? {}) },
      whiteLabel: { ...base.whiteLabel, ...(parsed.whiteLabel ?? {}) },
    };
  } catch {
    return defaultDoc();
  }
}

export function saveDoc(doc: CustomizeDoc): CustomizeDoc {
  const next = { ...doc, updatedAt: Date.now() };
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach(l => l(next));
  return next;
}

export function subscribeDoc(fn: Listener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export function resetDoc(): CustomizeDoc {
  return saveDoc(defaultDoc());
}

/* ---------- pure page operations ---------- */

export function move<T>(arr: T[], from: number, to: number): T[] {
  const next = arr.slice();
  if (from < 0 || from >= next.length || to < 0 || to >= next.length) return next;
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
