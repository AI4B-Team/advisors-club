// Apps — the store the UI calls. Its interface never changes.
//
// Persistence lives behind `AppsRepository`. While the apps domain is
// localStorage-backed this file behaves exactly as before; once the domain is
// flipped to Supabase (see `src/lib/data/backend.ts`), reads hydrate from the
// database and writes are mirrored through the repository. Components keep
// calling getApps() / createApp() / patchApp() / subscribeApps().

import type { App, AppAccess, AppKind, AppIconKey, AppPricing, AppSchema } from "./types";
import { findTemplate } from "./library";
import { isSupabaseBacked } from "@/lib/data/backend";
import { writeThrough } from "@/lib/data/cache";
import { activeClubId, hasRealClub } from "@/lib/clubs/context";
import { supabaseAppsRepository } from "./supabase-repository";

const KEY = "ac_apps_v1";
const EVT = "ac:apps";

type Listener = (apps: App[]) => void;
const listeners = new Set<Listener>();

function uid() { return `app_${Math.random().toString(36).slice(2, 9)}`; }
function now() { return new Date().toISOString(); }

/** True when this domain should read/write Supabase. */
function remote(): boolean {
  return isSupabaseBacked("apps") && hasRealClub();
}

/**
 * Pulls apps from Supabase into the synchronous cache. Call once per club
 * load; a no-op while the domain is localStorage-backed.
 */
export async function hydrateApps(): Promise<App[]> {
  if (!remote()) return getApps();
  try {
    const list = await supabaseAppsRepository.list(activeClubId());
    setApps(list);
    return list;
  } catch (err) {
    console.error("[apps] hydrate failed", err);
    return getApps();
  }
}


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
  status?: App["status"];
  templateId?: string;
  prompt?: string;
  contextRefs?: string[];
  /** Set when the app is installed from a marketplace listing. */
  listingId?: string;
  listingVersion?: number;
  schema?: AppSchema;
};

export function createApp(input: NewApp): App {
  const app: App = {
    id: uid(),
    name: input.name.trim() || "Untitled App",
    description: input.description?.trim() ?? "",
    kind: input.kind,
    icon: input.icon ?? "wrench",
    status: input.status ?? "draft",
    access: input.access ?? { mode: "free" },
    listed: true,
    pricing: input.pricing,

    templateId: input.templateId,
    source: input.source ?? "blank",
    prompt: input.prompt,
    contextRefs: input.contextRefs ?? [],
    listingId: input.listingId,
    listingVersion: input.listingVersion,
    schema: input.schema ?? { fields: [], outputs: [] },
    config: {},
    createdAt: now(),
    updatedAt: now(),
  };
  updateApps(list => [app, ...list]);
  if (remote()) {
    // The database assigns the canonical UUID; swap the optimistic id in.
    writeThrough(async () => {
      const saved = await supabaseAppsRepository.create(activeClubId(), input);
      updateApps(list => list.map(a => (a.id === app.id ? saved : a)));
    }, "createApp");
  }
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
  if (remote()) {
    writeThrough(() => supabaseAppsRepository.update(activeClubId(), id, patch), "patchApp");
  }
}

export function patchSchema(id: string, patch: Partial<AppSchema>): void {
  updateApps(list => list.map(a => (
    a.id === id
      ? { ...a, schema: { fields: [], outputs: [], ...(a.schema ?? {}), ...patch }, updatedAt: now() }
      : a
  )));
  if (remote()) {
    const schema = getApp(id)?.schema;
    writeThrough(() => supabaseAppsRepository.update(activeClubId(), id, { schema }), "patchSchema");
  }
}

export function removeApp(id: string): void {
  updateApps(list => list.filter(a => a.id !== id));
  if (remote()) {
    writeThrough(() => supabaseAppsRepository.remove(activeClubId(), id), "removeApp");
  }
}

