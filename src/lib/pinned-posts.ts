// Tiny localStorage-backed store mapping a course page (lesson title, case-insensitive)
// to a list of pinned community posts.

const KEY = "ac.pinnedPosts.v1";

export type PinnedPost = {
  postId: string;
  postTitle: string;
  postAuthor: string;
  pinnedAt: number;
};

type Store = Record<string, PinnedPost[]>;

function norm(pageName: string) {
  return pageName.trim().toLowerCase();
}

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) as Store : {};
  } catch { return {}; }
}

function write(s: Store) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
    window.dispatchEvent(new Event("ac:pinned-posts-changed"));
  } catch { /* ignore */ }
}

export function getPinnedForPage(pageName: string): PinnedPost[] {
  const s = read();
  return s[norm(pageName)] ?? [];
}

export function pinPostToPage(pageName: string, post: Omit<PinnedPost, "pinnedAt">) {
  const k = norm(pageName);
  if (!k) return;
  const s = read();
  const list = s[k] ?? [];
  if (list.some(p => p.postId === post.postId)) return;
  s[k] = [...list, { ...post, pinnedAt: Date.now() }];
  write(s);
}

export function unpinPostFromPage(pageName: string, postId: string) {
  const k = norm(pageName);
  const s = read();
  const list = s[k] ?? [];
  s[k] = list.filter(p => p.postId !== postId);
  if (s[k].length === 0) delete s[k];
  write(s);
}

export function subscribePinnedPosts(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const h = () => cb();
  window.addEventListener("ac:pinned-posts-changed", h);
  window.addEventListener("storage", h);
  return () => {
    window.removeEventListener("ac:pinned-posts-changed", h);
    window.removeEventListener("storage", h);
  };
}
