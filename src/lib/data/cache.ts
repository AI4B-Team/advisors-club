// Bridges async repositories to the synchronous store interfaces the UI
// already uses.
//
// Pattern:
//   const cache = createCollectionCache<App>({ key: "ac_apps_v1", event: "ac:apps" });
//   cache.read()                     // sync — what the UI calls today
//   cache.write(next)                // sync — persists locally + notifies
//   cache.hydrate(() => repo.list()) // async — pulls from Supabase into cache
//
// This keeps localStorage as an offline/first-paint cache while Supabase
// becomes the source of truth, without turning every component async.

export type CacheOptions = {
  /** localStorage key already used by the domain — never change it. */
  key: string;
  /** window event already dispatched by the domain store. */
  event: string;
};

export type Cache<T> = {
  read(fallback: T): T;
  write(next: T): T;
  subscribe(fn: (value: T) => void): () => void;
  /** Pulls remote state into the cache. Silently no-ops on failure. */
  hydrate(load: () => Promise<T | null>): Promise<T | null>;
};

export function createCache<T>({ key, event }: CacheOptions): Cache<T> {
  const listeners = new Set<(value: T) => void>();

  function read(fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  function write(next: T): T {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* quota — the repository remains the source of truth */
      }
      window.dispatchEvent(new Event(event));
    }
    listeners.forEach(l => l(next));
    return next;
  }

  function subscribe(fn: (value: T) => void): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  async function hydrate(load: () => Promise<T | null>): Promise<T | null> {
    try {
      const remote = await load();
      if (remote == null) return null;
      write(remote);
      return remote;
    } catch {
      return null;
    }
  }

  return { read, write, subscribe, hydrate };
}

/**
 * Fire-and-forget write-through. Mutations stay optimistic in the cache; the
 * repository call happens in the background and failures are reported, never
 * thrown into a click handler.
 */
export function writeThrough(op: () => Promise<unknown>, label: string): void {
  void op().catch(err => {
    console.error(`[data] ${label} failed to persist`, err);
  });
}
