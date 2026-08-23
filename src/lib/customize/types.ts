// Customize — shared types for the admin Club customization experience.

export type PageId = "home" | "community" | "course-home" | "member-dashboard" | "public-club";

export type BlockCategory = "content" | "community" | "learning" | "business";

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

export type BlockDef = {
  type: string;
  label: string;
  category: BlockCategory;
  desc: string;
  /** Surfaces this block may be placed on. */
  pages: PageId[];
  /** Multiple instances allowed. */
  duplicable: boolean;
  fields: BlockField[];
  defaults: Record<string, string | number | boolean>;
};

export type Block = {
  id: string;
  type: string;
  hidden?: boolean;
  props: Record<string, string | number | boolean>;
};

export type ButtonStyle = "rounded" | "pill" | "square";
export type BackgroundStyle = "light" | "soft" | "warm" | "dark";
export type FontChoice = "system" | "grotesk" | "serif" | "mono";
export type Density = "comfortable" | "compact" | "spacious";

export type Theme = {
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

export type WhiteLabel = {
  customDomain: string;
  domainVerified: boolean;
  hidePlatformBranding: boolean;
  emailFromName: string;
  supportEmail: string;
  faviconUrl: string;
};

export type CustomizeDoc = {
  pages: Record<PageId, Block[]>;
  theme: Theme;
  whiteLabel: WhiteLabel;
  updatedAt: number;
  publishedAt: number | null;
};

export const PAGES: { id: PageId; label: string; sub: string }[] = [
  { id: "home", label: "Home", sub: "The Signed-In Club Home" },
  { id: "community", label: "Community", sub: "Discussion & Spaces" },
  { id: "course-home", label: "Course Home", sub: "Learning Landing Surface" },
  { id: "member-dashboard", label: "Member Dashboard", sub: "Personal Progress View" },
  { id: "public-club", label: "Public Club Page", sub: "What Visitors See" },
];
