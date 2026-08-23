// This person's own recent searches. Real data or nothing — we never seed the
// list with invented queries.

const KEY = "ac_recent_searches_v1";
const MAX = 6;

export function readRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string").slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export function pushRecentSearch(term: string): string[] {
  const t = term.trim();
  if (!t) return readRecentSearches();
  const next = [t, ...readRecentSearches().filter(x => x.toLowerCase() !== t.toLowerCase())].slice(0, MAX);
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage disabled */ }
  return next;
}
