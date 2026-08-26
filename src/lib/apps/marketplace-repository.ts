// Supabase implementation of the marketplace catalog.
//
// Row shape mirrors `public.app_listings`. Unlike every other repository in
// the codebase this one is NOT club-scoped on read: a creator browsing the
// marketplace is looking at other clubs' listings, and RLS ("live, or mine")
// decides what comes back rather than a `club_id` filter here.
//
// Installs are never written from the browser. They are created by fulfilment
// once payment clears, so this module only reads them.

import { supabase } from "@/integrations/supabase/client";
import { RepositoryError } from "@/lib/data/repository";
import type { AppIconKey, AppKind, AppPricing, AppSchema } from "./types";
import type { Install, Listing, ListingStatus } from "./marketplace";

type ListingRow = {
  id: string; author_club_id: string; source_app_id: string | null;
  name: string; description: string; details: string | null;
  kind: string; icon: string; category: string;
  pricing: unknown; status: string; version: number; changelog: string | null;
  schema: unknown; config: unknown; installs: number;
  rating: number | null; rating_count: number | null;
  published_at: string; updated_at: string;
  /** Joined club name, so a card can say who published it. */
  clubs?: { name: string; category: string | null } | null;
};

type InstallRow = {
  id: string; listing_id: string; club_id: string; app_id: string | null;
  version: number; gross_cents: number; platform_fee_cents: number;
  author_net_cents: number; installed_at: string; revoked_at: string | null;
};

function toListing(r: ListingRow): Listing {
  return {
    id: r.id,
    sourceAppId: r.source_app_id ?? undefined,
    author: {
      clubId: r.author_club_id,
      name: r.clubs?.name ?? "A Creator",
      niche: r.clubs?.category ?? undefined,
    },
    name: r.name,
    description: r.description ?? "",
    details: r.details ?? undefined,
    kind: r.kind as AppKind,
    icon: r.icon as AppIconKey,
    category: r.category,
    pricing: (r.pricing as AppPricing) ?? { model: "free" },
    status: r.status as ListingStatus,
    version: r.version ?? 1,
    changelog: r.changelog ?? undefined,
    schema: (r.schema as AppSchema) ?? { fields: [], outputs: [] },
    config: (r.config as Listing["config"]) ?? {},
    installs: r.installs ?? 0,
    rating: r.rating ?? undefined,
    ratingCount: r.rating_count ?? undefined,
    publishedAt: r.published_at,
    updatedAt: r.updated_at,
  };
}

function toInstall(r: InstallRow): Install {
  return {
    id: r.id,
    listingId: r.listing_id,
    appId: r.app_id ?? "",
    clubId: r.club_id,
    version: r.version ?? 1,
    gross: (r.gross_cents ?? 0) / 100,
    platformFee: (r.platform_fee_cents ?? 0) / 100,
    authorNet: (r.author_net_cents ?? 0) / 100,
    installedAt: r.installed_at,
  };
}

const SELECT = "*, clubs:author_club_id(name, category)";

export const supabaseMarketplaceRepository = {
  /** The catalog. RLS returns live listings plus the caller's own. */
  async list(): Promise<Listing[]> {
    const { data, error } = await supabase
      .from("app_listings").select(SELECT).order("installs", { ascending: false });
    if (error) throw new RepositoryError("Could not load the marketplace", error);
    return (data as unknown as ListingRow[]).map(toListing);
  },

  async get(id: string): Promise<Listing | null> {
    const { data, error } = await supabase
      .from("app_listings").select(SELECT).eq("id", id).maybeSingle();
    if (error) throw new RepositoryError("Could not load that listing", error);
    return data ? toListing(data as unknown as ListingRow) : null;
  },

  async create(clubId: string, listing: Listing): Promise<Listing> {
    const { data, error } = await supabase.from("app_listings").insert({
      author_club_id: clubId,
      source_app_id: listing.sourceAppId ?? null,
      name: listing.name,
      description: listing.description,
      details: listing.details ?? null,
      kind: listing.kind,
      icon: listing.icon,
      category: listing.category,
      pricing: listing.pricing as never,
      status: listing.status,
      version: listing.version,
      changelog: listing.changelog ?? null,
      schema: listing.schema as never,
      config: (listing.config ?? {}) as never,
    } as never).select(SELECT).single();
    if (error) throw new RepositoryError("Could not publish that app", error);
    return toListing(data as unknown as ListingRow);
  },

  async update(id: string, patch: Partial<Listing>): Promise<Listing | null> {
    const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (patch.name !== undefined) row.name = patch.name;
    if (patch.description !== undefined) row.description = patch.description;
    if (patch.details !== undefined) row.details = patch.details ?? null;
    if (patch.category !== undefined) row.category = patch.category;
    if (patch.pricing !== undefined) row.pricing = patch.pricing;
    if (patch.status !== undefined) row.status = patch.status;
    if (patch.version !== undefined) row.version = patch.version;
    if (patch.changelog !== undefined) row.changelog = patch.changelog ?? null;
    if (patch.kind !== undefined) row.kind = patch.kind;
    if (patch.icon !== undefined) row.icon = patch.icon;
    if (patch.schema !== undefined) row.schema = patch.schema;
    if (patch.config !== undefined) row.config = patch.config;

    const { data, error } = await supabase
      .from("app_listings").update(row as never).eq("id", id).select(SELECT).maybeSingle();
    if (error) throw new RepositoryError("Could not update that listing", error);
    return data ? toListing(data as unknown as ListingRow) : null;
  },

  /** Installs visible to the caller: their club's, and their listings'. */
  async installs(): Promise<Install[]> {
    const { data, error } = await supabase
      .from("app_installs").select("*").is("revoked_at", null);
    if (error) throw new RepositoryError("Could not load installs", error);
    return (data as unknown as InstallRow[]).map(toInstall);
  },
};
