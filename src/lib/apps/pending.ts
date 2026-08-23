// A one-shot handoff so AIVA can send a creator straight into the AI app
// builder with the brief already written — e.g. from an Opportunity's
// "Build It" button.

const KEY = "ac_app_build_brief";

export function setPendingAppBrief(brief: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, brief);
}

/** Reads and clears the pending brief. */
export function takePendingAppBrief(): string | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(KEY);
  if (v) window.localStorage.removeItem(KEY);
  return v;
}
