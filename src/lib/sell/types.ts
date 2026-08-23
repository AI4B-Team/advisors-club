// Selling Experience — shared types.
// Level 1: a simple Public Club Page (section toggles, no builder vocabulary).
// Level 2: a block-based Landing Page / Offer builder using the same design
// system as Customize. Funnels are an optional layer on top — never required.

export type Surface = "club" | "landing";

export type FieldType = "text" | "textarea" | "number" | "select" | "toggle";

export type SellField = {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
};

export type SellBlockDef = {
  type: string;
  label: string;
  category: "content" | "proof" | "offer" | "community" | "advanced";
  desc: string;
  surfaces: Surface[];
  duplicable: boolean;
  fields: SellField[];
  defaults: Record<string, string | number | boolean>;
};

export type SellBlock = {
  id: string;
  type: string;
  hidden?: boolean;
  props: Record<string, string | number | boolean>;
};

export type SellTheme = {
  brand: string;
  logoUrl: string;
  font: "system" | "grotesk" | "serif" | "mono";
  buttonStyle: "rounded" | "pill" | "square";
  background: "light" | "soft" | "warm" | "dark";
  density: "comfortable" | "compact" | "spacious";
  radius: number;
};

export type SellPage = {
  id: string;
  surface: Surface;
  title: string;
  slug: string;
  blocks: SellBlock[];
  theme: SellTheme;
  updatedAt: number;
  publishedAt: number | null;
};

/* ---------- Funnels (architecture only — hidden until an admin opts in) ---------- */

export type FunnelStepKind =
  | "lead-magnet" | "opt-in" | "landing" | "offer"
  | "checkout" | "upsell" | "confirmation" | "thank-you" | "club";

export type FunnelStep = {
  id: string;
  kind: FunnelStepKind;
  label: string;
  /** SellPage.id when this step is a page you build here. */
  pageId: string | null;
  /** External or internal destination when the step is not a built page. */
  url: string;
};

export type Funnel = {
  id: string;
  name: string;
  steps: FunnelStep[];
  live: boolean;
  updatedAt: number;
};

export type SellDoc = {
  version: 1;
  /** Level 1 — one simple public page per Club. */
  clubPage: SellPage;
  /** Level 2 — landing pages / offers. */
  pages: SellPage[];
  funnels: Funnel[];
  /** Funnel UI stays hidden until the admin turns it on. */
  funnelsEnabled: boolean;
};

export const FUNNEL_STEP_KINDS: { kind: FunnelStepKind; label: string; hint: string }[] = [
  { kind: "lead-magnet", label: "Lead Magnet", hint: "The Free Thing You Give Away." },
  { kind: "opt-in", label: "Opt-In", hint: "Collect Name And Email." },
  { kind: "landing", label: "Landing Page", hint: "The Main Sales Page." },
  { kind: "offer", label: "Offer", hint: "The Paid Offer Presentation." },
  { kind: "checkout", label: "Checkout", hint: "Where Payment Happens." },
  { kind: "upsell", label: "Upsell", hint: "An Optional Add-On After Purchase." },
  { kind: "confirmation", label: "Confirmation", hint: "Order Confirmed." },
  { kind: "thank-you", label: "Thank You", hint: "Deliver The Lead Magnet." },
  { kind: "club", label: "Club Access", hint: "Drop Them Into The Club." },
];

export const FUNNEL_TEMPLATES: { id: string; name: string; desc: string; steps: FunnelStepKind[] }[] = [
  {
    id: "offer",
    name: "Offer Funnel",
    desc: "Landing Page → Checkout → Upsell → Confirmation → Club",
    steps: ["landing", "checkout", "upsell", "confirmation", "club"],
  },
  {
    id: "lead",
    name: "Lead Magnet Funnel",
    desc: "Lead Magnet → Opt-In → Offer → Checkout → Thank You",
    steps: ["lead-magnet", "opt-in", "offer", "checkout", "thank-you"],
  },
];
