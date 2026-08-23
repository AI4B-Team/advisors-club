/**
 * AIVA information architecture.
 *
 * Primary navigation is deliberately four concepts — Chat, Activity,
 * Opportunities, Settings. Everything the creator used to configure through
 * top-level tabs (Overview/Knowledge/Instructions/Member AI/Capabilities and
 * the Create sub-areas) still exists; it moved under Settings.
 */

export type AmPrimaryKey = "chat" | "activity" | "opportunities" | "settings";

export const AM_TABS: { key: AmPrimaryKey; label: string }[] = [
  { key: "chat", label: "Chat" },
  { key: "activity", label: "Activity" },
  { key: "opportunities", label: "Opportunities" },
  { key: "settings", label: "Settings" },
];

export type AmSettingsKey =
  | "business-knowledge" | "knowledge-sources" | "instructions" | "voice"
  | "member-ai" | "capabilities" | "autonomy"
  | "catalog" | "intelligence" | "flywheel"
  | "marketing" | "workflows" | "agents" | "inbox";

export const AM_SETTINGS: {
  key: AmSettingsKey; label: string; desc: string; group: "AIVA" | "Behavior" | "Advanced";
}[] = [
  { key: "business-knowledge", label: "Business Knowledge", desc: "What AIVA knows about you, your business, audience, and offers.", group: "AIVA" },
  { key: "knowledge-sources", label: "Knowledge Sources", desc: "Add, inspect, approve, or remove the sources AIVA can use.", group: "AIVA" },
  { key: "instructions", label: "Instructions", desc: "Permanent rules, terminology, and things AIVA should never do.", group: "AIVA" },
  { key: "voice", label: "Voice & Personality", desc: "How your AI communicates with members.", group: "AIVA" },
  { key: "member-ai", label: "Member AI", desc: "How AIVA interacts with members day to day.", group: "Behavior" },
  { key: "capabilities", label: "Capabilities", desc: "What AIVA is allowed to do inside your Club.", group: "Behavior" },
  { key: "autonomy", label: "Autonomy", desc: "Suggest, approve, or autopilot — per capability.", group: "Behavior" },
  { key: "catalog", label: "Product Catalog", desc: "Everything AIVA can reference and recommend.", group: "Advanced" },
  { key: "intelligence", label: "Content Intelligence", desc: "Retroactive connections for anything new you publish.", group: "Advanced" },
  { key: "flywheel", label: "Flywheel", desc: "How content, products, and members compound.", group: "Advanced" },
  { key: "marketing", label: "Marketing", desc: "Campaigns AIVA can draft and run.", group: "Advanced" },
  { key: "workflows", label: "Workflows", desc: "Automations AIVA maintains for you.", group: "Advanced" },
  { key: "agents", label: "Agents", desc: "Specialized assistants working under AIVA.", group: "Advanced" },
  { key: "inbox", label: "AI Inbox", desc: "Conversations AIVA is handling on your behalf.", group: "Advanced" },
];

export const AM_SETTINGS_KEYS = AM_SETTINGS.map(s => s.key);

/** Old URLs and saved links keep working. */
export const AM_LEGACY_TAB: Record<string, { tab: AmPrimaryKey; sub?: AmSettingsKey }> = {
  console: { tab: "chat" },
  chat: { tab: "chat" },
  create: { tab: "settings" },
  activity: { tab: "activity" },
  opportunities: { tab: "opportunities" },
  flywheel: { tab: "settings", sub: "flywheel" },
  settings: { tab: "settings" },
};

export const AM_LEGACY_SUB: Record<string, AmSettingsKey> = {
  overview: "business-knowledge",
  knowledge: "knowledge-sources",
  instructions: "instructions",
  "member-ai": "member-ai",
  capabilities: "capabilities",
  catalog: "catalog",
  intelligence: "intelligence",
  marketing: "marketing",
  workflows: "workflows",
  agents: "agents",
  inbox: "inbox",
};

/** Legacy alias kept so older imports keep type-checking. */
export type AmTabKey = AmPrimaryKey | AmSettingsKey | "overview" | "knowledge";
