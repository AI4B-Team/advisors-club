import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Incremental rendering for long lists.
 *
 * Renders `pageSize` items and grows as the sentinel scrolls into view, so a
 * feed or ranking table with hundreds of rows doesn't mount every row (and
 * every avatar/image) on first paint. Resets whenever the source list identity
 * changes (filter, sort, search).
 */
export function usePagedList<T>(items: T[], pageSize = 20) {
  const [count, setCount] = useState(pageSize);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setCount(pageSize); }, [items, pageSize]);

  const hasMore = count < items.length;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) setCount(c => c + pageSize);
    }, { rootMargin: "400px" });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, pageSize]);

  const visible = useMemo(() => items.slice(0, count), [items, count]);

  return {
    visible,
    hasMore,
    sentinelRef,
    loadMore: () => setCount(c => c + pageSize),
    shown: visible.length,
    total: items.length,
  };
}
