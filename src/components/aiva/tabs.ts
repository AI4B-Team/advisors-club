export type AmTabKey = "console" | "overview" | "knowledge" | "instructions" | "capabilities" | "activity";

export const AM_TABS: { key: AmTabKey; label: string }[] = [
  { key: "console", label: "Console" },
  { key: "overview", label: "Overview" },
  { key: "knowledge", label: "Knowledge" },
  { key: "instructions", label: "Instructions" },
  { key: "capabilities", label: "Capabilities" },
  { key: "activity", label: "Activity" },
];
