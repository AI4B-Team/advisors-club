// The App Marketplace — the second layer on top of the App Library.
//
// The App Library ships starting points WE wrote. The Marketplace is supply
// creators publish themselves: a creator takes an app they already run in
// their club, lists it, and another creator installs it into theirs. Installs
// can be free or paid, and Advisors Club keeps a percentage of every paid
// install.
//
// This module is the model and the economics only. Persistence lives in
// `marketplace-store.ts`; nothing here touches storage or the network so the
// take rate and the version rules stay testable on their own.

import type { App, AppConfig, AppIconKey, AppKind, AppPricing, AppSchema } from "./types";
import { isRunnable } from "./runtime";

/* ------------------------------------------------------------------ */
/* Economics                                                           */
/* ------------------------------------------------------------------ */

/**
 * What Advisors Club keeps on a paid install. Stored on every install record
 * at the moment of purchase, so changing this rate never rewrites history.
 */
export const PLATFORM_TAKE_RATE = 0.2;

export type RevenueSplit = {
  /** What the installing creator pays, in dollars. */
  gross: number;
  /** What Advisors Club keeps. */
  platformFee: number;
  /** What the publishing creator receives. */
  authorNet: number;
  /** The rate applied, kept so historical splits stay explainable. */
  rate: number;
};

export function splitRevenue(price: number, rate: number = PLATFORM_TAKE_RATE): RevenueSplit {
  const gross = Math.max(0, Math.round(price * 100) / 100);
  const platformFee = Math.round(gross * rate * 100) / 100;
  return { gross, platformFee, authorNet: Math.round((gross - platformFee) * 100) / 100, rate };
}

/** The price a listing charges another creator, as a number of dollars. */
export function listingPrice(pricing: AppPricing | undefined): number {
  if (!pricing || pricing.model === "free") return 0;
  return pricing.price;
}

export function isPaidListing(listing: Pick<Listing, "pricing">): boolean {
  return listingPrice(listing.pricing) > 0;
}

/** "$49 One-Time · You Keep $39.20" — what an author sees before publishing. */
export function authorEarningsLabel(pricing: AppPricing | undefined): string {
  const price = listingPrice(pricing);
  if (price <= 0) return "Free — No Revenue Share Applies";
  const split = splitRevenue(price);
  const per = pricing?.model === "subscription" ? "Per Payment" : "Per Install";
  return `You Keep $${split.authorNet.toLocaleString()} ${per} · Advisors Club Keeps $${split.platformFee.toLocaleString()}`;
}

/* ------------------------------------------------------------------ */
/* Model                                                               */
/* ------------------------------------------------------------------ */

/**
 * `live` is the only status other creators can see. `unlisted` keeps existing
 * installs working while hiding the listing from the catalog, and `removed`
 * is a tombstone — installs keep running, nobody new can install.
 */
export type ListingStatus = "live" | "unlisted" | "removed";

export type ListingAuthor = {
  /** The publishing club. Also the tenant the payout belongs to. */
  clubId: string;
  name: string;
  /** Their niche, shown under the author name on a card. */
  niche?: string;
  /** Set once Advisors Club has reviewed the publisher. */
  verified?: boolean;
};

export type Listing = {
  id: string;
  /** The app in the author's own club this was published from. */
  sourceAppId?: string;
  author: ListingAuthor;
  name: string;
  description: string;
  /** The longer pitch, shown on the listing itself. */
  details?: string;
  kind: AppKind;
  icon: AppIconKey;
  category: string;
  /** What another CREATOR pays to install it — not what their members pay. */
  pricing: AppPricing;
  status: ListingStatus;
  /**
   * Bumped every time the author republishes. Installs record the version
   * they took, which is how "Update Available" is decided.
   */
  version: number;
  /** What changed in the current version. */
  changelog?: string;
  schema: AppSchema;
  config?: AppConfig;
  installs: number;
  rating?: number;
  ratingCount?: number;
  /**
   * Illustrative supply we seeded, not a real creator's listing. Every surface
   * that renders one MUST label it (`<DataBadge kind="sample" />`), and its
   * install counts never reach a real payout figure.
   */
  sample?: true;
  publishedAt: string;
  updatedAt: string;
};

/** One creator installing one listing. The unit the take rate applies to. */
export type Install = {
  id: string;
  listingId: string;
  /** The app created in the installing club. */
  appId: string;
  /** The installing club. */
  clubId: string;
  /** The listing version taken. */
  version: number;
  gross: number;
  platformFee: number;
  authorNet: number;
  installedAt: string;
};

/** What the publish form collects. Everything else is derived from the app. */
export type PublishInput = {
  name?: string;
  description?: string;
  details?: string;
  category: string;
  pricing: AppPricing;
  changelog?: string;
};

/* ------------------------------------------------------------------ */
/* Rules                                                               */
/* ------------------------------------------------------------------ */

/**
 * Why this app cannot be published, or null when it can. An empty tool would
 * install as an empty tool, so the catalog refuses it up front.
 */
export function publishBlocker(app: App): string | null {
  if (!app.name.trim()) return "Give The App A Name First.";
  if (!app.schema || !isRunnable(app.schema)) {
    return "This App Has No Fields Yet. Build It Out Before You List It.";
  }
  if (app.schema.embedUrl) {
    return "Embedded Tools Point At Your Own Account And Can't Be Installed By Another Creator.";
  }
  return null;
}

export function canPublish(app: App): boolean {
  return publishBlocker(app) === null;
}

/** Listings other creators are allowed to see. */
export function catalogListings(listings: Listing[]): Listing[] {
  return listings.filter(l => l.status === "live");
}

export function categoriesOf(listings: Listing[]): string[] {
  return Array.from(new Set(listings.map(l => l.category))).sort();
}

export type CatalogFilter = {
  query?: string;
  category?: string;
  kind?: AppKind;
  freeOnly?: boolean;
};

export function filterListings(listings: Listing[], filter: CatalogFilter): Listing[] {
  const q = filter.query?.trim().toLowerCase();
  return listings.filter(l => {
    if (filter.category && l.category !== filter.category) return false;
    if (filter.kind && l.kind !== filter.kind) return false;
    if (filter.freeOnly && isPaidListing(l)) return false;
    if (!q) return true;
    return `${l.name} ${l.description} ${l.details ?? ""} ${l.author.name} ${l.category}`.toLowerCase().includes(q);
  });
}

export type CatalogSort = "popular" | "newest" | "price";

export function sortListings(listings: Listing[], sort: CatalogSort): Listing[] {
  const out = [...listings];
  switch (sort) {
    case "newest": return out.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    case "price": return out.sort((a, b) => listingPrice(a.pricing) - listingPrice(b.pricing));
    default: return out.sort((a, b) => b.installs - a.installs || (b.rating ?? 0) - (a.rating ?? 0));
  }
}

/**
 * True when the author has published a newer version than this club installed.
 * Updates are never applied automatically — an installed app is the creator's
 * to edit, and overwriting their edits without asking would be theft of work.
 */
export function updateAvailable(app: App, listing: Listing | undefined): boolean {
  if (!listing || listing.status === "removed") return false;
  if (app.source !== "marketplace" || !app.listingId) return false;
  return listing.version > (app.listingVersion ?? 0);
}

/** Listings a club published, newest first. */
export function listingsByAuthor(listings: Listing[], clubId: string): Listing[] {
  return listings
    .filter(l => l.author.clubId === clubId && l.status !== "removed")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/** Listings this club actually published — sample supply is never theirs. */
export function realListingsByAuthor(listings: Listing[], clubId: string): Listing[] {
  return listingsByAuthor(listings, clubId).filter(l => !l.sample);
}

/** Gross, fee and net across a set of installs — the author's payout view. */
export function earnings(installs: Install[]): RevenueSplit & { count: number } {
  const gross = installs.reduce((s, i) => s + i.gross, 0);
  const platformFee = installs.reduce((s, i) => s + i.platformFee, 0);
  const authorNet = installs.reduce((s, i) => s + i.authorNet, 0);
  return {
    count: installs.length,
    gross: Math.round(gross * 100) / 100,
    platformFee: Math.round(platformFee * 100) / 100,
    authorNet: Math.round(authorNet * 100) / 100,
    rate: PLATFORM_TAKE_RATE,
  };
}
