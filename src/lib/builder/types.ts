// Builder Core — one canonical page/block model shared by every page builder
// in the product (Club Customize, Public Club Page, Sales Pages, Offer Pages).

/** Rendering surface. Signed-in Club chrome vs. public marketing chrome. */
export type BuilderSurface = "app" | "marketing";

/** The purpose of a page. Drives blocks, templates, settings and publishing. */
export type PageTypeId =
  | "club-home"
  | "club-community"
  | "club-course-home"
  | "club-member-dashboard"
  | "club-public"
  | "sales"
  | "offer";

export type BlockCategory =
  | "content"
  | "community"
  | "learning"
  | "business"
  | "proof"
  | "offer"
  | "advanced";

export type FieldType = "text" | "textarea" | "number" | "select" | "toggle";

export type BlockField = {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
};

export type BlockProps = Record<string, string | number | boolean>;

/** The canonical block definition. */
export type BlockDef = {
  type: string;
  label: string;
  category: BlockCategory;
  desc: string;
  /** Page types this block may be placed on. */
  pages: PageTypeId[];
  duplicable: boolean;
  fields: BlockField[];
  defaults: BlockProps;
};

/** The canonical block instance — identical shape on every page type. */
export type BuilderBlock = {
  id: string;
  type: string;
  hidden?: boolean;
  props: BlockProps;
};

export type ButtonStyle = "rounded" | "pill" | "square";
export type BackgroundStyle = "light" | "soft" | "warm" | "dark";
export type FontChoice = "system" | "grotesk" | "serif" | "mono";
export type Density = "comfortable" | "compact" | "spacious";

/** The canonical theme. Page types may only use part of it. */
export type BuilderTheme = {
  brand: string;
  logoUrl: string;
  coverUrl: string;
  font: FontChoice;
  buttonStyle: ButtonStyle;
  background: BackgroundStyle;
  density: Density;
  radius: number;
  showNav: boolean;
  showRail: boolean;
};

export const DEFAULT_BUILDER_THEME: BuilderTheme = {
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

export const CATEGORY_META: Record<BlockCategory, { label: string; tint: string; ink: string }> = {
  content:   { label: "Content",              tint: "#FEF6E7", ink: "#B45309" },
  community: { label: "Community",            tint: "#EEF4FF", ink: "#2563EB" },
  learning:  { label: "Learning",             tint: "#ECFDF5", ink: "#047857" },
  business:  { label: "Business",             tint: "#F6F4FE", ink: "#6D28D9" },
  proof:     { label: "Proof",                tint: "#FFF1F2", ink: "#BE123C" },
  offer:     { label: "Offer & Conversion",   tint: "#F0FDFA", ink: "#0F766E" },
  advanced:  { label: "Advanced",             tint: "#F3F4F6", ink: "#374151" },
};

export const CATEGORY_ORDER: BlockCategory[] = [
  "content", "community", "learning", "proof", "offer", "business", "advanced",
];

/** The canonical page model every builder edits and every renderer draws. */
export type BuilderPage = {
  id: string;
  pageType: PageTypeId;
  title: string;
  /** Public URL slug — only meaningful for public page types. */
  slug: string;
  blocks: BuilderBlock[];
  theme: BuilderTheme;
  updatedAt: number;
  publishedAt: number | null;
};
