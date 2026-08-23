// Which items AIVA has already looked back across, so a genuinely NEW thing
// can announce itself once — and only once.

const KEY = "ac_relationship_scans_v1";
export const SCANS_EVENT = "ac:relationship-scans";

type Scans = { scanned: string[]; dismissed: string[] };
const EMPTY: Scans = { scanned: [], dismissed: [] };

export function getScans(): Scans {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<Scans>) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

function write(next: Scans): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(SCANS_EVENT));
}

export function markScanned(id: string): void {
  const s = getScans();
  if (!s.scanned.includes(id)) write({ ...s, scanned: [...s.scanned, id] });
}

export function dismissScan(id: string): void {
  const s = getScans();
  if (!s.dismissed.includes(id)) write({ ...s, dismissed: [...s.dismissed, id] });
}

export function subscribeScans(fn: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const h = () => fn();
  window.addEventListener(SCANS_EVENT, h);
  return () => window.removeEventListener(SCANS_EVENT, h);
}
