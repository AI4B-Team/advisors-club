export type AmTabKey = "console" | "overview" | "knowledge" | "catalog" | "intelligence" | "opportunities" | "instructions" | "member-ai" | "capabilities" | "activity" | "marketing" | "workflows" | "agents" | "inbox";

/** Primary AIVA sections. Deliberately four — navigation stays simple. */
export type AmPrimaryKey = "console" | "create" | "opportunities" | "flywheel" | "activity";

export const AM_TABS: { key: AmPrimaryKey; label: string }[] = [
  { key: "console", label: "Ask AIVA" },
  { key: "create", label: "Create" },
  { key: "opportunities", label: "Opportunities" },
  { key: "flywheel", label: "Flywheel" },
  { key: "activity", label: "Activity" },
];

/** Everything the expert configures or generates lives under Create. */
export const AM_CREATE_TABS: { key: AmTabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "knowledge", label: "Knowledge" },
  { key: "instructions", label: "Instructions" },
  { key: "capabilities", label: "Capabilities" },
  { key: "member-ai", label: "Member AI" },
  { key: "catalog", label: "Catalog" },
  { key: "intelligence", label: "Intelligence" },
  { key: "marketing", label: "Marketing" },
  { key: "workflows", label: "Workflows" },
  { key: "agents", label: "Agents" },
  { key: "inbox", label: "Inbox" },
];

export const AM_CREATE_KEYS = AM_CREATE_TABS.map(t => t.key);
