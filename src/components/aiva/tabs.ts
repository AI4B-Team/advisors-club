export type AmTabKey = "console" | "overview" | "knowledge" | "catalog" | "intelligence" | "opportunities" | "instructions" | "member-ai" | "capabilities" | "activity";

/** Primary AIVA sections. Deliberately four — navigation stays simple. */
export type AmPrimaryKey = "console" | "create" | "opportunities" | "activity";

export const AM_TABS: { key: AmPrimaryKey; label: string }[] = [
  { key: "console", label: "Ask AIVA" },
  { key: "create", label: "Create" },
  { key: "opportunities", label: "Opportunities" },
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
];

export const AM_CREATE_KEYS = AM_CREATE_TABS.map(t => t.key);
