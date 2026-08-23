export type AmTabKey = "console" | "overview" | "knowledge" | "catalog" | "intelligence" | "instructions" | "member-ai" | "capabilities" | "activity";

export const AM_TABS: { key: AmTabKey; label: string }[] = [
  { key: "console", label: "Console" },
  { key: "overview", label: "Overview" },
  { key: "knowledge", label: "Knowledge" },
  { key: "catalog", label: "Catalog" },
  { key: "intelligence", label: "Intelligence" },
  { key: "instructions", label: "Instructions" },
  { key: "member-ai", label: "Member AI" },
  { key: "capabilities", label: "Capabilities" },
  { key: "activity", label: "Activity" },
];
