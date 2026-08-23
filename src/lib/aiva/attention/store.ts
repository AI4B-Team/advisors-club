// Which globally-surfaced AIVA discoveries the expert has already been shown.

const ACK_KEY = "ac:aiva-attention-ack";
const VISIT_KEY = "ac:aiva-attention-visit";
export const ATTENTION_EVENT = "ac:aiva-attention";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function getAcknowledged(): string[] {
  const rows = read<string[]>(ACK_KEY, []);
  return Array.isArray(rows) ? rows : [];
}

export function acknowledge(ids: string[]): void {
  if (typeof window === "undefined" || ids.length === 0) return;
  const next = Array.from(new Set([...getAcknowledged(), ...ids])).slice(-500);
  window.localStorage.setItem(ACK_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(ATTENTION_EVENT));
}

/** Last time the admin was actively in the app — powers "while you were away". */
export function getLastVisit(): string | null {
  return read<string | null>(VISIT_KEY, null);
}

export function markVisit(at = new Date().toISOString()): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(VISIT_KEY, JSON.stringify(at));
}

export function subscribeAttention(fn: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const h = () => fn();
  window.addEventListener(ATTENTION_EVENT, h);
  return () => window.removeEventListener(ATTENTION_EVENT, h);
}
