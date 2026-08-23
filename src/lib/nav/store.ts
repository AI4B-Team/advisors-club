// Persisted community navigation configuration.
//
// IMPORTANT: this store holds NAVIGATION ONLY. Removing an item here removes a
// link from the sidebar — it never deletes courses, posts, events, resources or
// any other underlying content, which continue to live in their own stores and
// remain reachable by route.
//
// Advisors Club system controls (AI, Manage) are NOT part of this config and
// cannot be edited or removed by an admin.

import { DEFAULT_MEMBER_NAV, type NavIconKey, type NavItem, type NavItemType } from "./config";

const KEY = "ac-community-nav";

export type NavConfig = { items: NavItem[] };

type Listener = (c: NavConfig) => void;
const listeners = new Set<Listener>();

function clone(items: NavItem[]): NavItem[] {
  return items.map(i => ({ ...i, subs: i.subs.map(s => ({ ...s })), menu: [...i.menu] }));
}

export function defaultNavConfig(): NavConfig {
  return { items: clone(DEFAULT_MEMBER_NAV) };
}

export function getNavConfig(): NavConfig {
  if (typeof window === "undefined") return defaultNavConfig();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultNavConfig();
    const parsed = JSON.parse(raw) as Partial<NavConfig>;
    if (!parsed || !Array.isArray(parsed.items) || parsed.items.length === 0) return defaultNavConfig();
    return { items: parsed.items as NavItem[] };
  } catch {
    return defaultNavConfig();
  }
}

export function setNavConfig(next: NavConfig): NavConfig {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("nav-config:change"));
  }
  listeners.forEach(l => l(next));
  return next;
}

export function updateNavItems(fn: (items: NavItem[]) => NavItem[]): NavConfig {
  return setNavConfig({ items: fn(getNavConfig().items) });
}

export function resetNavConfig(): NavConfig {
  return setNavConfig(defaultNavConfig());
}

export function subscribeNav(fn: Listener): () => void {
  listeners.add(fn);
  const onEvt = () => fn(getNavConfig());
  if (typeof window !== "undefined") {
    window.addEventListener("nav-config:change", onEvt);
    window.addEventListener("storage", onEvt);
  }
  return () => {
    listeners.delete(fn);
    if (typeof window !== "undefined") {
      window.removeEventListener("nav-config:change", onEvt);
      window.removeEventListener("storage", onEvt);
    }
  };
}

/* ---------- Item helpers ---------- */

/** Navigation item types an admin can add, mapped to existing Advisors Club content. */
export const ADDABLE_TYPES: {
  type: NavItemType;
  label: string;
  icon: NavIconKey;
  to: string;
  desc: string;
}[] = [
  { type: "community", label: "Community", icon: "community", to: "/app/club/feed", desc: "Feed, Announcements And Discussion." },
  { type: "courses", label: "Course", icon: "courses", to: "/app/club/courses", desc: "Lessons And Learning Paths." },
  { type: "coaching", label: "Coaching", icon: "coaching", to: "/app/club/coaching", desc: "Programs, Sessions And Clients." },
  { type: "events", label: "Events", icon: "events", to: "/app/club/events", desc: "Live Sessions And Calls." },
  { type: "resources", label: "Resources", icon: "resources", to: "/app/club/resources", desc: "Files, Links And Templates." },
  { type: "members", label: "Members", icon: "members", to: "/app/club/members", desc: "Roster And Profiles." },
  { type: "apps", label: "App", icon: "apps", to: "/app/apps", desc: "Installed Tools And Integrations." },
  { type: "page", label: "Custom Page", icon: "file", to: "/app/page", desc: "A Simple Page You Write Yourself." },
  { type: "link", label: "External Link", icon: "link", to: "https://", desc: "Point Members To Any URL." },
];

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createNavItem(type: NavItemType): NavItem {
  const preset = ADDABLE_TYPES.find(t => t.type === type)!;
  const id = uid(type);
  return {
    id,
    label: preset.label,
    to: type === "page" ? `/app/page/${id}` : preset.to,
    icon: preset.icon,
    section: "member",
    type,
    visibility: "everyone",
    subs: [],
    menu: [],
    ...(type === "page" ? { page: { body: "" } } : {}),
  };
}

export function moveItem(items: NavItem[], from: number, to: number): NavItem[] {
  if (to < 0 || to >= items.length || from === to) return items;
  const next = [...items];
  const [row] = next.splice(from, 1);
  next.splice(to, 0, row);
  return next;
}

/** Items a member actually sees, in order, with hidden entries dropped. */
export function visibleNav(items: NavItem[]): NavItem[] {
  return items.filter(i => !i.hidden);
}

/** Group items by their optional section label, preserving order. */
export function groupNav(items: NavItem[]): { group: string; items: NavItem[] }[] {
  const out: { group: string; items: NavItem[] }[] = [];
  for (const item of items) {
    const group = item.group?.trim() || "";
    const last = out[out.length - 1];
    if (last && last.group === group) last.items.push(item);
    else out.push({ group, items: [item] });
  }
  return out;
}
