// Supabase implementation of the Apps repository.
//
// Row shape mirrors `public.apps`. The interactive schema, config, access
// policy and pricing stay JSONB so the existing TypeScript models are stored
// verbatim — no lossy flattening during the migration.

import { supabase } from "@/integrations/supabase/client";
import { RepositoryError } from "@/lib/data/repository";
import type { App, AppIconKey, AppKind } from "./types";
import type { AppsRepository } from "./repository";

type AppRow = {
  id: string; club_id: string; name: string; description: string; kind: string;
  icon: string; status: "draft" | "published" | "archived"; listed: boolean;
  source: string; template_id: string | null; prompt: string | null;
  listing_id: string | null; listing_version: number | null;
  context_refs: unknown; schema: unknown; config: unknown; access: unknown;
  pricing: unknown; created_at: string; updated_at: string;
};

function toApp(r: AppRow): App {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? "",
    kind: r.kind as AppKind,
    icon: r.icon as AppIconKey,
    status: r.status === "published" ? "published" : "draft",
    access: (r.access as App["access"]) ?? { mode: "free" },
    listed: r.listed,
    pricing: (r.pricing as App["pricing"]) ?? undefined,
    templateId: r.template_id ?? undefined,
    source: (r.source as App["source"]) ?? "blank",
    prompt: r.prompt ?? undefined,
    contextRefs: (r.context_refs as string[]) ?? [],
    listingId: r.listing_id ?? undefined,
    listingVersion: r.listing_version ?? undefined,
    schema: (r.schema as App["schema"]) ?? { fields: [], outputs: [] },
    config: (r.config as App["config"]) ?? {},
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function toRow(app: Partial<App>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (app.name !== undefined) row.name = app.name;
  if (app.description !== undefined) row.description = app.description;
  if (app.kind !== undefined) row.kind = app.kind;
  if (app.icon !== undefined) row.icon = app.icon;
  if (app.status !== undefined) row.status = app.status;
  if (app.listed !== undefined) row.listed = app.listed;
  if (app.source !== undefined) row.source = app.source;
  if (app.templateId !== undefined) row.template_id = app.templateId;
  if (app.prompt !== undefined) row.prompt = app.prompt;
  if (app.contextRefs !== undefined) row.context_refs = app.contextRefs;
  if (app.listingId !== undefined) row.listing_id = app.listingId;
  if (app.listingVersion !== undefined) row.listing_version = app.listingVersion;
  if (app.schema !== undefined) row.schema = app.schema;
  if (app.config !== undefined) row.config = app.config;
  if (app.access !== undefined) row.access = app.access;
  if (app.pricing !== undefined) row.pricing = app.pricing;
  return row;
}

export const supabaseAppsRepository: AppsRepository = {
  async list(clubId) {
    const { data, error } = await supabase
      .from("apps").select("*").eq("club_id", clubId).order("created_at", { ascending: false });
    if (error) throw new RepositoryError("Could not load apps", error);
    return (data as AppRow[]).map(toApp);
  },

  async get(clubId, id) {
    const { data, error } = await supabase
      .from("apps").select("*").eq("club_id", clubId).eq("id", id).maybeSingle();
    if (error) throw new RepositoryError("Could not load that app", error);
    return data ? toApp(data as AppRow) : null;
  },

  async create(clubId, input) {
    const { data, error } = await supabase.from("apps").insert({
      club_id: clubId,
      name: input.name?.trim() || "Untitled App",
      description: input.description ?? "",
      kind: input.kind,
      icon: input.icon ?? "wrench",
      status: input.status ?? "draft",
      access: (input.access ?? { mode: "free" }) as never,
      pricing: (input.pricing ?? null) as never,
      source: input.source ?? "blank",
      template_id: input.templateId ?? null,
      prompt: input.prompt ?? null,
      context_refs: (input.contextRefs ?? []) as never,
      listing_id: input.listingId ?? null,
      listing_version: input.listingVersion ?? null,
      schema: (input.schema ?? { fields: [], outputs: [] }) as never,
    } as never).select("*").single();
    if (error) throw new RepositoryError("Could not create that app", error);
    return toApp(data as AppRow);
  },

  async update(clubId, id, patch) {
    const { data, error } = await supabase.from("apps")
      .update(toRow(patch) as never)
      .eq("club_id", clubId).eq("id", id).select("*").maybeSingle();
    if (error) throw new RepositoryError("Could not save that app", error);
    return data ? toApp(data as AppRow) : null;
  },

  async remove(clubId, id) {
    const { error } = await supabase.from("apps").delete().eq("club_id", clubId).eq("id", id);
    if (error) throw new RepositoryError("Could not delete that app", error);
  },
};
