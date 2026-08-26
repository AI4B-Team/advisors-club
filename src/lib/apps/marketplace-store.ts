// Marketplace persistence — the store the UI calls.
//
// Mirrors the shape of `store.ts`: synchronous reads out of a localStorage
// cache, an event so every mounted view refreshes, and a repository behind it.
//
// Two collections live here:
//   LISTINGS — what creators publish for other creators to install
//   INSTALLS — one row per install, carrying the revenue split at that moment
//
// The important asymmetry: LISTINGS are written from here (publishing is a
// creator's own action on their own row), INSTALLS are not. Inside a real club
// an install is created by fulfilment once payment clears, and this module
// only reads it back. The browser never writes a row that represents money.
//
// Seeded sample supply is never persisted and never shown inside a real club.
// It exists so the marketplace is legible before there is any supply, and it
// is excluded from anything that reads as a real number.

import { activeClub, activeClubId, hasRealClub } from "@/lib/clubs/context";
import { writeThrough } from "@/lib/data/cache";
import { getGS } from "@/lib/gs-store";
import { purchaseProduct, type CommerceViewer } from "@/lib/commerce";
import type { MarketplaceEarnings } from "@/lib/commerce/wire";
import { createApp, getApp, getApps, hydrateApps, patchApp } from "./store";
import type { App } from "./types";
import {
  listingPrice, splitRevenue, earnings, realListingsByAuthor,
  type Install, type Listing, type ListingAuthor, type ListingStatus, type PublishInput,
} from "./marketplace";
import { SAMPLE_LISTINGS } from "./marketplace-sample";
import { supabaseMarketplaceRepository } from "./marketplace-repository";
import { installFreeListingFn, marketplaceEarningsFn } from "./marketplace.functions";

const LISTINGS_KEY = "ac_app_listings_v1";
const INSTALLS_KEY = "ac_app_installs_v1";
const EVT = "ac:app-marketplace";

type Listener = () => void;
const listeners = new Set<Listener>();

function uid(prefix: string) { return `${prefix}_${Math.random().toString(36).slice(2, 9)}`; }
function now() { return new Date().toISOString(); }

/**
 * Inside a real club the marketplace is real: the catalog is the database and
 * installs cost money. The local path only runs in the prototype sandbox.
 */
function remote(): boolean {
  return hasRealClub();
}

/** True when installs cost real money and the catalog is the database. */
export function marketplaceIsServerBacked(): boolean {
  return remote();
}

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, next: T[]): T[] {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, JSON.stringify(next));
    window.dispatchEvent(new Event(EVT));
  }
  listeners.forEach(l => l());
  return next;
}

export function subscribeMarketplace(fn: Listener): () => void {
  listeners.add(fn);
  if (typeof window !== "undefined") window.addEventListener(EVT, fn);
  return () => {
    listeners.delete(fn);
    if (typeof window !== "undefined") window.removeEventListener(EVT, fn);
  };
}

/**
 * Pulls the catalog and this club's installs into the synchronous cache.
 * A no-op in the sandbox, where the cache already is the source of truth.
 */
export async function hydrateMarketplace(): Promise<void> {
  if (!remote()) return;
  try {
    const [listings, installs] = await Promise.all([
      supabaseMarketplaceRepository.list(),
      supabaseMarketplaceRepository.installs(),
    ]);
    write(LISTINGS_KEY, listings);
    write(INSTALLS_KEY, installs);
  } catch (err) {
    console.error("[marketplace] hydrate failed", err);
  }
}

/* ------------------------------------------------------------------ */
/* Listings                                                            */
/* ------------------------------------------------------------------ */

/** Listings real creators published. Never includes sample supply. */
export function publishedListings(): Listing[] {
  return read<Listing>(LISTINGS_KEY);
}

/**
 * The catalog a creator browses. A real club sees only real supply — showing
 * invented creators next to genuine ones would be the "fake-real" this
 * codebase forbids — so the samples are for the sandbox only.
 */
export function getListings(): Listing[] {
  const real = publishedListings();
  return remote() ? real : [...real, ...SAMPLE_LISTINGS];
}

export function findListing(id: string | undefined): Listing | undefined {
  if (!id) return undefined;
  return getListings().find(l => l.id === id);
}

/** Who this club publishes as. */
export function currentAuthor(): ListingAuthor {
  const club = activeClub();
  if (club) return { clubId: club.id, name: club.name, niche: club.category ?? undefined };
  const gs = getGS();
  return { clubId: activeClubId(), name: gs.clubName?.trim() || "Your Club", niche: gs.niche || undefined };
}

/** Everything this club has listed, newest first. */
export function myListings(): Listing[] {
  return realListingsByAuthor(getListings(), activeClubId());
}

/** The live listing this app was published as, if any. */
export function listingForApp(appId: string): Listing | undefined {
  return publishedListings().find(l => l.sourceAppId === appId && l.status !== "removed");
}

/**
 * Lists an app in the marketplace. Republishing an app that is already listed
 * bumps the version instead of creating a second listing, so installs of the
 * old version see an update rather than a duplicate.
 */
export function publishApp(app: App, input: PublishInput): Listing {
  const existing = listingForApp(app.id);
  if (existing) return republishListing(existing.id, app, input);

  const listing: Listing = {
    id: uid("lst"),
    sourceAppId: app.id,
    author: currentAuthor(),
    name: input.name?.trim() || app.name,
    description: input.description?.trim() || app.description,
    details: input.details?.trim() || undefined,
    kind: app.kind,
    icon: app.icon,
    category: input.category,
    pricing: input.pricing,
    status: "live",
    version: 1,
    changelog: input.changelog?.trim() || undefined,
    schema: app.schema ?? { fields: [], outputs: [] },
    config: app.config,
    installs: 0,
    publishedAt: now(),
    updatedAt: now(),
  };
  write(LISTINGS_KEY, [listing, ...publishedListings()]);
  if (remote()) {
    // The database assigns the canonical UUID — and that id is what checkout
    // prices against, so swap the optimistic one out as soon as it lands.
    writeThrough(async () => {
      const saved = await supabaseMarketplaceRepository.create(activeClubId(), listing);
      write(LISTINGS_KEY, publishedListings().map(l => (l.id === listing.id ? saved : l)));
    }, "publishApp");
  }
  return listing;
}

/** Pushes the app's current build out as a new version of an existing listing. */
export function republishListing(listingId: string, app: App, input: PublishInput): Listing {
  let updated: Listing | undefined;
  write(LISTINGS_KEY, publishedListings().map(l => {
    if (l.id !== listingId) return l;
    updated = {
      ...l,
      name: input.name?.trim() || l.name,
      description: input.description?.trim() || l.description,
      details: input.details?.trim() || l.details,
      category: input.category,
      pricing: input.pricing,
      kind: app.kind,
      icon: app.icon,
      schema: app.schema ?? l.schema,
      config: app.config,
      version: l.version + 1,
      changelog: input.changelog?.trim() || undefined,
      status: l.status === "removed" ? "live" : l.status,
      updatedAt: now(),
    };
    return updated;
  }));
  const next = updated ?? findListing(listingId)!;
  if (remote()) {
    writeThrough(() => supabaseMarketplaceRepository.update(listingId, next), "republishListing");
  }
  return next;
}

export function setListingStatus(listingId: string, status: ListingStatus): void {
  write(LISTINGS_KEY, publishedListings().map(l => (
    l.id === listingId ? { ...l, status, updatedAt: now() } : l
  )));
  if (remote()) {
    writeThrough(() => supabaseMarketplaceRepository.update(listingId, { status }), "setListingStatus");
  }
}

/* ------------------------------------------------------------------ */
/* Installs                                                            */
/* ------------------------------------------------------------------ */

export function getInstalls(): Install[] {
  return read<Install>(INSTALLS_KEY);
}

export function installsForListing(listingId: string): Install[] {
  return getInstalls().filter(i => i.listingId === listingId);
}

/** Listing ids this club has already installed. */
export function installedListingIds(): string[] {
  const clubId = activeClubId();
  return getInstalls().filter(i => i.clubId === clubId).map(i => i.listingId);
}

/** True when this club already installed the listing. */
export function isInstalled(listingId: string): boolean {
  return installedListingIds().includes(listingId);
}

/** True when this club published the listing. You cannot install your own. */
export function isOwnListing(listing: Listing): boolean {
  return !listing.sample && listing.author.clubId === activeClubId();
}

export type InstallOutcome =
  /** Installed. The app is in this club, as a draft. */
  | { ok: true; appId: string }
  /** Payment happens at the provider; the webhook finishes the install. */
  | { ok: true; redirectUrl: string }
  | { ok: false; error: string };

/**
 * Installs a listing into the active club.
 *
 * Free listings still go through the server so the install is recorded once,
 * in one place. Paid listings go through the SHARED checkout with an
 * `app-listing` ref — there is exactly one code path in the product that moves
 * money, and this is not a second one. Nothing here decides the price: the
 * server re-reads it from the seller's row.
 *
 * The app lands as a DRAFT either way. An installed tool is a starting point
 * the creator adapts, exactly like a library template.
 */
export async function installListing(listing: Listing, viewer: CommerceViewer): Promise<InstallOutcome> {
  if (listing.status === "removed") return { ok: false, error: "That App Is No Longer Available." };
  if (isOwnListing(listing)) return { ok: false, error: "You Published This App. It Is Already In Your Club." };
  if (isInstalled(listing.id)) return { ok: false, error: "You Have Already Installed This App." };

  const price = listingPrice(listing.pricing);

  if (remote()) {
    try {
      if (price <= 0) {
        const res = await installFreeListingFn({ data: { clubId: activeClubId(), listingId: listing.id } });
        await Promise.all([hydrateApps(), hydrateMarketplace()]);
        return res.appId
          ? { ok: true, appId: res.appId }
          : { ok: false, error: "The App Could Not Be Installed." };
      }

      const result = await purchaseProduct(
        { kind: "app-listing", id: listing.id },
        {
          price,
          ...(listing.pricing.model === "subscription" ? { interval: listing.pricing.interval } : {}),
        },
        viewer,
        { label: listing.name },
      );
      if (!result.ok) return { ok: false, error: result.error };
      if ("redirectUrl" in result) return { ok: true, redirectUrl: result.redirectUrl };

      await Promise.all([hydrateApps(), hydrateMarketplace()]);
      const installed = getApps().find(a => a.listingId === listing.id);
      return installed
        ? { ok: true, appId: installed.id }
        : { ok: false, error: "Payment Went Through. The App Will Appear Here In A Moment." };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "The App Could Not Be Installed." };
    }
  }

  // ---- Sandbox: no club, no money, the same shape of record ---------------
  const app = createApp({
    name: listing.name,
    description: listing.description,
    kind: listing.kind,
    icon: listing.icon,
    schema: listing.schema,
    source: "marketplace",
    listingId: listing.id,
    listingVersion: listing.version,
    status: "draft",
  });

  const split = splitRevenue(price);
  const install: Install = {
    id: uid("ins"),
    listingId: listing.id,
    appId: app.id,
    clubId: activeClubId(),
    version: listing.version,
    gross: split.gross,
    platformFee: split.platformFee,
    authorNet: split.authorNet,
    installedAt: now(),
  };
  write(INSTALLS_KEY, [install, ...getInstalls()]);

  // Sample supply keeps its illustrative counter untouched; a real listing
  // counts a real install.
  if (!listing.sample) {
    write(LISTINGS_KEY, publishedListings().map(l => (
      l.id === listing.id ? { ...l, installs: l.installs + 1 } : l
    )));
  }

  return { ok: true, appId: app.id };
}

/**
 * Takes the listing's current version into an already-installed app. The
 * creator's own name, description and access settings survive — only the tool
 * itself is replaced, and only when they ask for it.
 */
export function updateInstalledApp(appId: string): App | null {
  const app = getApp(appId);
  if (!app?.listingId) return null;
  const listing = findListing(app.listingId);
  if (!listing || listing.status === "removed") return null;

  patchApp(appId, { schema: listing.schema, listingVersion: listing.version });
  return getApp(appId) ?? null;
}

/* ------------------------------------------------------------------ */
/* Payouts                                                             */
/* ------------------------------------------------------------------ */

/**
 * What this club has earned publishing apps, from the local ledger. Sample
 * listings are excluded, so a creator who has published nothing sees zero
 * rather than borrowed numbers.
 *
 * Inside a real club this is a placeholder until `fetchMarketplaceEarnings`
 * answers: money is counted from paid orders on the server, never from
 * anything the browser holds.
 */
export function myEarnings(): ReturnType<typeof earnings> {
  const mine = new Set(myListings().map(l => l.id));
  return earnings(getInstalls().filter(i => mine.has(i.listingId)));
}

/** Server-side payout totals. Null in the sandbox, where no money moved. */
export async function fetchMarketplaceEarnings(): Promise<MarketplaceEarnings | null> {
  if (!remote()) return null;
  try {
    return await marketplaceEarningsFn({ data: { clubId: activeClubId() } });
  } catch {
    return null;
  }
}
