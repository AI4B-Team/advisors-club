// Marketplace persistence — the store the UI calls.
//
// Mirrors the shape of `store.ts`: synchronous reads out of localStorage, an
// event so every mounted view refreshes, and a repository seam for the day the
// apps domain flips to Supabase.
//
// Two collections live here:
//   LISTINGS — what creators publish for other creators to install
//   INSTALLS — one row per install, carrying the revenue split at that moment
//
// Seeded sample supply is deliberately NOT persisted. It is merged in at read
// time, flagged `sample: true`, and excluded from anything that reads as a real
// number, so it can never be mistaken for a creator's own catalog or payout.

import { activeClub, activeClubId } from "@/lib/clubs/context";
import { getGS } from "@/lib/gs-store";
import { createApp, getApp, patchApp } from "./store";
import type { App } from "./types";
import {
  listingPrice, splitRevenue, earnings, realListingsByAuthor,
  type Install, type Listing, type ListingAuthor, type ListingStatus, type PublishInput,
} from "./marketplace";
import { SAMPLE_LISTINGS } from "./marketplace-sample";

const LISTINGS_KEY = "ac_app_listings_v1";
const INSTALLS_KEY = "ac_app_installs_v1";
const EVT = "ac:app-marketplace";

type Listener = () => void;
const listeners = new Set<Listener>();

function uid(prefix: string) { return `${prefix}_${Math.random().toString(36).slice(2, 9)}`; }
function now() { return new Date().toISOString(); }

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

/* ------------------------------------------------------------------ */
/* Listings                                                            */
/* ------------------------------------------------------------------ */

/** Listings real creators published. Never includes sample supply. */
export function publishedListings(): Listing[] {
  return read<Listing>(LISTINGS_KEY);
}

/** The full catalog a creator browses: sample supply plus real listings. */
export function getListings(): Listing[] {
  return [...publishedListings(), ...SAMPLE_LISTINGS];
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
  return updated ?? findListing(listingId)!;
}

export function setListingStatus(listingId: string, status: ListingStatus): void {
  write(LISTINGS_KEY, publishedListings().map(l => (
    l.id === listingId ? { ...l, status, updatedAt: now() } : l
  )));
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

export type InstallResult = { app: App; install: Install };

/** True when this club published the listing. You cannot install your own. */
export function isOwnListing(listing: Listing): boolean {
  return !listing.sample && listing.author.clubId === activeClubId();
}

/**
 * Installs a listing into the active club: creates the app from the listing's
 * schema and records the split. The app lands as a DRAFT — an installed tool
 * is a starting point the creator adapts, exactly like a library template, and
 * nothing reaches members until they publish it themselves.
 *
 * Refuses a listing this club published: the source app is already here, and
 * charging a creator to install their own work would move real money in a
 * circle minus the platform fee. Duplicating an app is what they want instead.
 */
export function installListing(listing: Listing): InstallResult | null {
  if (listing.status === "removed") return null;
  if (isOwnListing(listing)) return null;

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

  const split = splitRevenue(listingPrice(listing.pricing));
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

  // Sample supply keeps its illustrative counter; a real listing counts a real
  // install. Either way the number shown next to it stays labelled.
  if (!listing.sample) {
    write(LISTINGS_KEY, publishedListings().map(l => (
      l.id === listing.id ? { ...l, installs: l.installs + 1 } : l
    )));
  }

  return { app, install };
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
 * What this club has earned publishing apps. Sample listings are excluded, so
 * a creator who has published nothing sees zero rather than borrowed numbers.
 */
export function myEarnings(): ReturnType<typeof earnings> {
  const mine = new Set(myListings().map(l => l.id));
  return earnings(getInstalls().filter(i => mine.has(i.listingId)));
}
