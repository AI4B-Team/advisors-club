import { Bookmark, Pin, SlidersHorizontal, Check, ChevronDown, Tag } from "lucide-react";
import { useState } from "react";
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
export type FeedSort = "latest" | "likes" | "popular" | "oldest";
const SORT_OPTS: { id: FeedSort; label: string }[] = [
  { id: "latest", label: "Latest" },
  { id: "likes", label: "Likes" },
  { id: "popular", label: "Popular" },
  { id: "oldest", label: "Oldest" },
];
export function FeedTabs({
  activeTab, onChange, sort, onSortChange,
}: {
  posts: FeedPost[];
  activeTab: TabId;
  onChange: (t: TabId) => void;
  sort?: FeedSort;
  onSortChange?: (s: FeedSort) => void;
}) {
  const [sortOpen, setSortOpen] = useState(false);
  const sortLabel = SORT_OPTS.find(o => o.id === sort)?.label ?? "Latest";
  return (
    <div className="fp-tabs">
      {FEED_TABS.map(t => {
        const active = activeTab === t.id;
        return (
          <button
            key={t.id}
            type="button"
            className={`fp-tab${active ? " on" : ""}`}
            onClick={() => onChange(t.id)}
          >
            {t.label}
          </button>
        );
      })}
      {sort && onSortChange && (
        <div className="fp-sort-wrap">
          <button
            type="button"
            className={`fp-sort-btn${sortOpen ? " is-open" : ""}`}
            aria-haspopup="menu"
            aria-expanded={sortOpen}
            onClick={() => setSortOpen(o => !o)}
          >
            <span>{sortLabel}</span>
            <ChevronDown size={12}/>
          </button>
          {sortOpen && (
            <>
              <div className="fp-filter-backdrop" onClick={() => setSortOpen(false)}/>
              <div className="fp-sort-menu" role="menu">
                {SORT_OPTS.map(o => (
                  <button
                    key={o.id}
                    type="button"
                    className={`fp-filter-item${sort === o.id ? " is-active" : ""}`}
                    onClick={() => { onSortChange(o.id); setSortOpen(false); }}
                  >
                    <span>{o.label}</span>
                    {sort === o.id && <Check size={14}/>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}


/* ============ Composer category picker ============ */
export function ComposerCategoryPicker({
  value, onChange, open, setOpen,
}: { value: PostCategory; onChange: (c: PostCategory) => void; open: boolean; setOpen: (b: boolean) => void }) {
  const meta = CATEGORY_META[value];

  return (
    <div className="fp-cat-picker">
      <button
        type="button"
        className="fp-cat-btn"
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Tag size={12} aria-hidden /> {value === "general" ? "Category" : meta.label}
        <ChevronDown size={12} aria-hidden />
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
                  
                  <ItemIcon size={12} aria-hidden /> {m.label}
                  {k === value && <Check size={12} style={{marginLeft:"auto"}} aria-hidden />}
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
