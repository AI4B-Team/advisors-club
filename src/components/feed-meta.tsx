import { Bookmark, Pin } from "lucide-react";
import { CATEGORY_META, FEED_TABS, parseMarkdown, type FeedPost, type PostCategory } from "@/lib/feed-posts";

/* ============ Markdown body ============ */
export function PostBody({ text }: { text: string }) {
  return (
    <>
      {parseMarkdown(text).map((seg, i) => {
        if (seg.kind === "bold")   return <strong key={i}>{seg.value}</strong>;
        if (seg.kind === "italic") return <em key={i}>{seg.value}</em>;
        if (seg.kind === "code")   return <code key={i} className="fp-inline-code">{seg.value}</code>;
        return <span key={i}>{seg.value}</span>;
      })}
    </>
  );
}

/* ============ Category badge ============ */
export function PostBadge({ category }: { category: PostCategory }) {
  const m = CATEGORY_META[category];
  const Icon = m.icon;
  return (
    <span className="fp-badge" style={{ background: m.bg, color: m.fg }}>
      <Icon size={12} aria-hidden /> {m.label}
    </span>
  );
}

export function PinBadge() {
  return <span className="fp-badge fp-badge-pin"><Pin size={12} aria-hidden/> Pinned</span>;
}

/* ============ Tab row ============ */
export type TabId = "all" | PostCategory;
export function FeedTabs({
  posts, activeTab, onChange,
}: { posts: FeedPost[]; activeTab: TabId; onChange: (t: TabId) => void }) {
  const counts: Record<string, number> = { all: posts.length };
  for (const p of posts) counts[p.category] = (counts[p.category] ?? 0) + 1;
  return (
    <div className="fp-tabs">
      {FEED_TABS.map(t => {
        const active = activeTab === t.id;
        const n = counts[t.id] ?? 0;
        return (
          <button
            key={t.id}
            type="button"
            className={`fp-tab${active ? " on" : ""}`}
            onClick={() => onChange(t.id)}
          >
            {t.label}
            <span className="fp-tab-count">{n}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ============ Composer category picker ============ */
export function ComposerCategoryPicker({
  value, onChange, open, setOpen,
}: { value: PostCategory; onChange: (c: PostCategory) => void; open: boolean; setOpen: (b: boolean) => void }) {
  const meta = CATEGORY_META[value];
  const MetaIcon = meta.icon;
  return (
    <div className="fp-cat-picker">
      <button
        type="button"
        className="fp-cat-btn"
        style={{ background: meta.bg, color: meta.fg }}
        onClick={() => setOpen(!open)}
      >
        <MetaIcon size={12} aria-hidden /> {meta.label}
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{position:"fixed",inset:0,zIndex:40}}/>
          <div className="fp-cat-menu" role="menu">
            {(Object.keys(CATEGORY_META) as PostCategory[]).map(k => {
              const m = CATEGORY_META[k];
              const ItemIcon = m.icon;
              return (
                <button
                  key={k}
                  type="button"
                  className="fp-cat-item"
                  onClick={() => { onChange(k); setOpen(false); }}
                >
                  <span className="fp-cat-dot" style={{ background: m.fg }}/>
                  <ItemIcon size={12} aria-hidden /> {m.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ============ Footer bookmark ============ */
export function BookmarkButton({ saved, onToggle }: { saved: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className={`fp-bookmark${saved ? " on" : ""}`}
      onClick={onToggle}
      aria-label={saved ? "Remove bookmark" : "Bookmark post"}
    >
      <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
