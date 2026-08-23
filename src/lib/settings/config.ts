// Unified Settings information architecture.
//
// One control center replaces the old long Account sidebar AND the standalone
// "Manage" section. Six primary sections; everything else is grouped inside.
// Every row is either a LINK (opens an existing full-page tool) or a PANEL
// (expands an existing settings panel in place — progressive disclosure).

export type SettingsScope = "club" | "account";

export type PanelKey =
  | "clubs" | "profile" | "members" | "content"
  | "site" | "site-builder" | "theme"
  | "plans" | "paywalls" | "affiliates" | "payouts" | "analytics"
  | "payment-methods" | "payment-history" | "billing-details"
  | "notifications" | "chat" | "personal-preferences"
  | "developers" | "system";

export type SettingsRow = {
  id: string;
  label: string;
  desc: string;
  /** Opens an existing route. */
  to?: string;
  /** Expands an existing settings panel inline. */
  panel?: PanelKey;
  /** Small right-side hint, e.g. "In AI". */
  note?: string;
};

export type SettingsGroup = {
  title: string;
  scope: SettingsScope;
  rows: SettingsRow[];
};

export type SettingsSection = {
  key: string;
  label: string;
  title: string;
  desc: string;
  groups: SettingsGroup[];
};

export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    key: "workspace",
    label: "Workspace",
    title: "Workspace",
    desc: "Your Clubs, The People In Them, And How They Are Organized.",
    groups: [
      {
        title: "Your Club",
        scope: "club",
        rows: [
          { id: "clubs", label: "Clubs & Workspaces", desc: "Switch, Pin, Hide Or Reorder Your Clubs.", panel: "clubs" },
          { id: "members", label: "Members & Permissions", desc: "Roster, Roles, Invites And Access.", panel: "members" },
          { id: "roster", label: "Member Directory", desc: "Open The Full Member Management Page.", to: "/app/club/members" },
          { id: "navigation", label: "Club Navigation", desc: "Rename, Reorder And Organize Your Menu.", to: "/app/settings/navigation" },
          { id: "content", label: "Content", desc: "Courses, Posts, Events And Resources You Own.", panel: "content" },
        ],
      },
      {
        title: "Personal Account",
        scope: "account",
        rows: [
          { id: "profile", label: "Profile", desc: "Name, Avatar, Bio And Public Details.", panel: "profile" },
        ],
      },
    ],
  },
  {
    key: "brand-site",
    label: "Brand & Site",
    title: "Brand & Site",
    desc: "How Your Club Looks And What Visitors See Before They Join.",
    groups: [
      {
        title: "Your Club",
        scope: "club",
        rows: [
          { id: "appearance", label: "Appearance", desc: "Blocks, Layout And Theme Of Your Club.", to: "/app/customize" },
          { id: "theme", label: "Logo, Colors & Theme", desc: "Brand Colors, Logo And Typography.", panel: "theme" },
          { id: "domain", label: "Brand & Domain", desc: "Custom Domain And Brand Identity.", panel: "site" },
          { id: "public-page", label: "Public Club Page", desc: "What Visitors See Before Joining.", to: "/app/sell" },
          { id: "landing", label: "Landing Pages", desc: "Offer And Sales Page Builder.", to: "/app/sell" },
          { id: "site-builder", label: "Site Builder", desc: "Pages, Sections And Navigation Of Your Site.", panel: "site-builder" },
          { id: "persona", label: "AI Persona", desc: "The Member-Facing AI Trained On You.", to: "/app/settings/ai-persona" },
        ],
      },
    ],
  },
  {
    key: "growth",
    label: "Growth & Sales",
    title: "Growth & Sales",
    desc: "Monetization, Partners And The Numbers Behind Them.",
    groups: [
      {
        title: "Your Club",
        scope: "club",
        rows: [
          { id: "plans", label: "Plans", desc: "Membership Tiers And Pricing.", panel: "plans" },
          { id: "paywalls", label: "Access Rules", desc: "What Is Gated And Who Can Unlock It.", panel: "paywalls" },
          { id: "affiliates", label: "Affiliates", desc: "Partner Program And Commissions.", panel: "affiliates" },
          { id: "payouts", label: "Payouts", desc: "Where Your Earnings Are Sent.", panel: "payouts" },
          { id: "analytics", label: "Analytics", desc: "Revenue, Growth And Engagement.", panel: "analytics" },
          { id: "analytics-full", label: "Club Analytics", desc: "Open The Full Analytics Dashboard.", to: "/app/club/analytics" },
        ],
      },
      {
        title: "Handled By AI",
        scope: "club",
        rows: [
          { id: "marketing", label: "Marketing", desc: "Campaigns, Emails And Launches — Now Created With AI.", to: "/app/aiva?tab=create&sub=marketing", note: "In AI" },
          { id: "workflows", label: "Workflows & Automations", desc: "Automated Sequences Run By AI.", to: "/app/aiva?tab=create&sub=workflows", note: "In AI" },
        ],
      },
    ],
  },
  {
    key: "billing",
    label: "Billing",
    title: "Billing",
    desc: "Your Advisors Club Subscription And Payment Records.",
    groups: [
      {
        title: "Personal Account",
        scope: "account",
        rows: [
          { id: "subscription", label: "Subscription", desc: "Your Advisors Club Plan And Upgrades.", panel: "plans" },
          { id: "payment-methods", label: "Payment Methods", desc: "Cards And Billing Sources On File.", panel: "payment-methods" },
          { id: "payment-history", label: "Payment History", desc: "Invoices And Past Charges.", panel: "payment-history" },
          { id: "billing-details", label: "Billing Details", desc: "Company Name, Address And Tax Information.", panel: "billing-details" },
        ],
      },
    ],
  },
  {
    key: "preferences",
    label: "Preferences",
    title: "Preferences",
    desc: "Personal Settings That Follow You Across Every Club.",
    groups: [
      {
        title: "Personal Account",
        scope: "account",
        rows: [
          { id: "notifications", label: "Notifications", desc: "Email, Push And Digest Preferences.", panel: "notifications" },
          { id: "chat", label: "Chat & Messaging", desc: "Who Can Message You And How.", panel: "chat" },
          { id: "personal", label: "Language, Theme & Shortcuts", desc: "Interface Language, Light Or Dark Mode, Keyboard Shortcuts.", panel: "personal-preferences" },
        ],
      },
    ],
  },
  {
    key: "advanced",
    label: "Advanced",
    title: "Advanced",
    desc: "Developer Tools And System-Level Configuration.",
    groups: [
      {
        title: "Your Club",
        scope: "club",
        rows: [
          { id: "club-settings", label: "Club Configuration", desc: "Slug, Stripe Connect, Team Roles And Danger Zone.", to: "/app/settings" },
          { id: "system", label: "Advanced System Settings", desc: "Data, Privacy And Account-Level Controls.", panel: "system" },
        ],
      },
      {
        title: "Personal Account",
        scope: "account",
        rows: [
          { id: "developers", label: "Developers", desc: "API Keys, Webhooks And Integrations.", panel: "developers" },
        ],
      },
    ],
  },
];

export function findSection(key: string): SettingsSection | undefined {
  return SETTINGS_SECTIONS.find(s => s.key === key);
}
