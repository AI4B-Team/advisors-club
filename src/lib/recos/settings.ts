// Retroactive intelligence settings + "what has AIVA already looked at" memory.
//
// Two jobs:
//  1. Remember which products AIVA has already analyzed, so a genuinely NEW
//     product can announce itself ("Your Deal Analyzer Is Ready…").
//  2. Hold the auto-optimization switch. It is OFF by default and is the ONLY
//     thing that may ever let AIVA change published content without approval.

const KEY = "ac:reco-settings";
export const RECO_SETTINGS_EVENT = "ac:reco-settings";

export type RecoSettings = {
  /** When true, approved recommendations may be applied automatically. Off by default. */
  autoOptimize: boolean;
  /** Product node ids AIVA has already run a retroactive analysis for. */
  analyzed: string[];
  /** Product node ids the expert dismissed the "new product" prompt for. */
  dismissed: string[];
};

const DEFAULTS: RecoSettings = { autoOptimize: false, analyzed: [], dismissed: [] };

export function getRecoSettings(): RecoSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<RecoSettings>) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function setRecoSettings(patch: Partial<RecoSettings>): RecoSettings {
  const next = { ...getRecoSettings(), ...patch };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(RECO_SETTINGS_EVENT));
  }
  return next;
}

export function markAnalyzed(id: string): void {
  const s = getRecoSettings();
  if (!s.analyzed.includes(id)) setRecoSettings({ analyzed: [...s.analyzed, id] });
}

export function dismissNewProduct(id: string): void {
  const s = getRecoSettings();
  if (!s.dismissed.includes(id)) setRecoSettings({ dismissed: [...s.dismissed, id] });
}

export function subscribeRecoSettings(fn: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const h = () => fn();
  window.addEventListener(RECO_SETTINGS_EVENT, h);
  return () => window.removeEventListener(RECO_SETTINGS_EVENT, h);
}
