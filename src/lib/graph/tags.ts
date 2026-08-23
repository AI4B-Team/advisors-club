// Lightweight topic extraction + similarity.
// Deliberately simple and dependency-free: it exists so the graph has a
// consistent notion of "topic" today, and can be swapped for embeddings later
// without touching callers.

const STOP = new Set([
  "the","a","an","and","or","for","with","your","you","how","to","of","in","on","at","is","are",
  "this","that","it","be","by","from","as","we","our","get","use","using","into","out","up","new",
  "make","made","more","less","best","guide","intro","introduction","part","lesson","module","course",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .filter(w => w.length > 2 && !STOP.has(w));
}

/** Derive topic tags from any title/description pair. */
export function deriveTags(...parts: (string | undefined)[]): string[] {
  const counts = new Map<string, number>();
  for (const p of parts) {
    if (!p) continue;
    for (const w of tokenize(p)) counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([w]) => w);
}

/** Jaccard overlap, 0-1. */
export function tagSimilarity(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  let inter = 0;
  setA.forEach(t => { if (setB.has(t)) inter += 1; });
  const union = new Set([...a, ...b]).size;
  return union ? inter / union : 0;
}
