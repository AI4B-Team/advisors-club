// Builder Core — page type configuration.
//
// Every page built in the product declares a page type. The builder engine is
// identical for all of them; only this config differs: available blocks come
// from the catalog filtered by page type, plus default template, chrome,
// settings panels and publish behaviour.

import { DEFAULT_CLUB_SECTIONS, DEFAULT_LANDING_SECTIONS, DEFAULT_OFFER_SECTIONS } from "./catalog/marketing-blocks";
import type { BuilderSurface, PageTypeId } from "./types";

export type PageTypeConfig = {
  id: PageTypeId;
  label: string;
  sub: string;
  surface: BuilderSurface;
  /** Block types a fresh page of this type starts with. */
  template: string[];
  /** Renders signed-in Club navigation chrome in the preview. */
  chrome: "club" | "marketing" | "none";
  /** Settings surfaced in the builder's design panel. */
  settings: {
    theme: boolean;
    whiteLabel: boolean;
    /** Title + public slug editing. */
    meta: boolean;
    /** Club navigation visibility toggles. */
    navigation: boolean;
  };
  publish: {
    label: string;
    /** Publishing makes the page reachable at a public URL. */
    isPublic: boolean;
    hint: string;
  };
};

const CLUB_SETTINGS = { theme: true, whiteLabel: true, meta: false, navigation: true };
const PUBLIC_SETTINGS = { theme: true, whiteLabel: false, meta: true, navigation: false };

export const PAGE_TYPES: Record<PageTypeId, PageTypeConfig> = {
  "club-home": {
    id: "club-home", label: "Home", sub: "The Signed-In Club Home", surface: "app",
    template: ["hero", "feed", "events", "leaderboard"], chrome: "club", settings: CLUB_SETTINGS,
    publish: { label: "Publish", isPublic: false, hint: "Members See These Changes Immediately." },
  },
  "club-community": {
    id: "club-community", label: "Community", sub: "Discussion & Spaces", surface: "app",
    template: ["spaces", "featured-posts", "feed", "members"], chrome: "club", settings: CLUB_SETTINGS,
    publish: { label: "Publish", isPublic: false, hint: "Members See These Changes Immediately." },
  },
  "club-course-home": {
    id: "club-course-home", label: "Course Home", sub: "Learning Landing Surface", surface: "app",
    template: ["hero", "courses", "progress", "resources"], chrome: "club", settings: CLUB_SETTINGS,
    publish: { label: "Publish", isPublic: false, hint: "Members See These Changes Immediately." },
  },
  "club-member-dashboard": {
    id: "club-member-dashboard", label: "Member Dashboard", sub: "Personal Progress View", surface: "app",
    template: ["progress", "upcoming-sessions", "challenges", "quick-links"], chrome: "club", settings: CLUB_SETTINGS,
    publish: { label: "Publish", isPublic: false, hint: "Members See These Changes Immediately." },
  },
  "club-public": {
    id: "club-public", label: "Public Club Page", sub: "What Visitors See", surface: "marketing",
    template: DEFAULT_CLUB_SECTIONS, chrome: "marketing", settings: PUBLIC_SETTINGS,
    publish: { label: "Publish", isPublic: true, hint: "Anyone With The Link Can See This Page." },
  },
  sales: {
    id: "sales", label: "Landing Page", sub: "Sell An Offer Or Program", surface: "marketing",
    template: DEFAULT_LANDING_SECTIONS, chrome: "marketing", settings: PUBLIC_SETTINGS,
    publish: { label: "Publish", isPublic: true, hint: "Anyone With The Link Can See This Page." },
  },
  offer: {
    id: "offer", label: "Offer Page", sub: "One Offer, One Decision", surface: "marketing",
    template: DEFAULT_OFFER_SECTIONS, chrome: "marketing", settings: PUBLIC_SETTINGS,
    publish: { label: "Publish", isPublic: true, hint: "Anyone With The Link Can See This Page." },
  },
};

export function pageTypeConfig(id: PageTypeId): PageTypeConfig {
  return PAGE_TYPES[id] ?? PAGE_TYPES["club-home"];
}

/** The signed-in Club surfaces, in the order they appear in the page picker. */
export const CLUB_PAGE_TYPES: PageTypeId[] = [
  "club-home", "club-community", "club-course-home", "club-member-dashboard", "club-public",
];
