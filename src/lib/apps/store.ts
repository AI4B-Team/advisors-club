// Apps — local persistence. Mirrors the pattern used by the nav and coaching
// stores: a single JSON document in localStorage plus a change event.

import type { App, AppAccess, AppKind, AppIconKey, AppPricing, AppSchema } from "./types";
import { findTemplate } from "./library";

const KEY = "ac_apps_v1";
const EVT = "ac:apps";

type Listener = (apps: App[]) => void;
const listeners = new Set<Listener>();

function uid() { return `app_${Math.random().toString(36).slice(2, 9)}`; }
function now() { return new Date().toISOString(); }

/** New clubs start with no apps — apps are always an explicit creator choice. */
export function getApps(): App[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as App[]) : [];
  } catch {
    return [];
  }
}

export function getApp(id: string): App | undefined {
  return getApps().find(a => a.id === id);
}

export function setApps(next: App[]): App[] {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVT));
  }
  listeners.forEach(l => l(next));
  return next;
}

export function updateApps(fn: (apps: App[]) => App[]): App[] {
  return setApps(fn(getApps()));
}

export function subscribeApps(fn: Listener): () => void {
  listeners.add(fn);
  const onEvt = () => fn(getApps());
  if (typeof window !== "undefined") window.addEventListener(EVT, onEvt);
  return () => {
    listeners.delete(fn);
    if (typeof window !== "undefined") window.removeEventListener(EVT, onEvt);
  };
}

export type NewApp = {
  name: string;
  description?: string;
  kind: AppKind;
  icon?: AppIconKey;
  access?: AppAccess;
  pricing?: AppPricing;
  source?: App["source"];
  templateId?: string;
  prompt?: string;
  contextRefs?: string[];
  schema?: AppSchema;
};

export function createApp(input: NewApp): App {
  const app: App = {
    id: uid(),
    name: input.name.trim() || "Untitled App",
    description: input.description?.trim() ?? "",
    kind: input.kind,
    icon: input.icon ?? "wrench",
    status: "draft",
    access: input.access ?? { mode: "free" },
    listed: true,
    
    templateId: input.templateId,
    source: input.source ?? "blank",
    prompt: input.prompt,
    contextRefs: input.contextRefs ?? [],
    schema: input.schema ?? { fields: [], outputs: [] },
    config: {},
    createdAt: now(),
    updatedAt: now(),
  };
  updateApps(list => [app, ...list]);
  return app;
}

export function addFromTemplate(templateId: string, access?: AppAccess): App | null {
  const t = findTemplate(templateId);
  if (!t) return null;
  return createApp({
    name: t.name,
    description: t.description,
    kind: t.kind,
    icon: t.icon,
    access,
    source: "library",
    templateId: t.id,
    schema: t.schema,
  });
}

export function duplicateApp(id: string): App | null {
  const src = getApp(id);
  if (!src) return null;
  const copy: App = {
    ...src,
    id: uid(),
    name: `${src.name} (Copy)`,
    status: "draft",
    createdAt: now(),
    updatedAt: now(),
  };
  updateApps(list => [copy, ...list]);
  return copy;
}

export function patchApp(id: string, patch: Partial<App>): void {
  updateApps(list => list.map(a => (a.id === id ? { ...a, ...patch, updatedAt: now() } : a)));
}

export function patchSchema(id: string, patch: Partial<AppSchema>): void {
  updateApps(list => list.map(a => (
    a.id === id
      ? { ...a, schema: { fields: [], outputs: [], ...(a.schema ?? {}), ...patch }, updatedAt: now() }
      : a
  )));
}

export function removeApp(id: string): void {
  updateApps(list => list.filter(a => a.id !== id));
}
