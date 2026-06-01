import { useState, useRef, useEffect } from "react";
import {
  Bookmark,
  MoreVertical,
  Pin,
  Pencil,
  Copy,
  Flag,
  Trash2,
  Share2,
  Rss,
  Heart,
  MessageSquare,
  MessageSquareOff,
  Star,
} from "lucide-react";

type Props = {
  isAdmin?: boolean;
  isPinned?: boolean;
  onPinToFeed?: () => void;
  saved?: boolean;
  onToggleSave?: () => void;
};

type Toggles = {
  follow: boolean;
  pin: boolean;
  hideLikes: boolean;
  hideComments: boolean;
  closeComments: boolean;
  hideFeatured: boolean;
};

export function PostHeaderActions({ isAdmin = false, isPinned = false, onPinToFeed, saved = false, onToggleSave }: Props) {
  const [open, setOpen] = useState(false);
  const [toggles, setToggles] = useState<Toggles>({
    follow: false,
    pin: isPinned,
    hideLikes: false,
    hideComments: false,
    closeComments: false,
    hideFeatured: false,
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const setT = (k: keyof Toggles) => setToggles(t => ({ ...t, [k]: !t[k] }));

  const Toggle = ({ on }: { on: boolean }) => (
    <span className={`pa-toggle${on ? " on" : ""}`} aria-hidden>
      <span className="pa-toggle-knob" />
    </span>
  );

  return (
    <div className="post-actions" ref={ref}>
      {isPinned && (
        <button
          type="button"
          className="post-actions-pinned"
          onClick={() => isAdmin && onPinToFeed?.()}
          title={isAdmin ? "Click To Unpin" : "Pinned By Admin"}
          disabled={!isAdmin}
        >
          <Pin size={13}/> Pinned
        </button>
      )}
      <button
        className={`post-actions-bookmark${saved ? " on" : ""}`}
        aria-label={saved ? "Remove Bookmark" : "Bookmark Post"}
        title={saved ? "Bookmarked" : "Bookmark"}
        onClick={onToggleSave}
      >
        <Bookmark size={18} fill={saved ? "currentColor" : "none"}/>
      </button>
      <button
        className="post-actions-more"
        aria-label="More Options"
        onClick={() => setOpen(o => !o)}
      >
        <MoreVertical size={18}/>
      </button>
      {open && (
        <div className="post-actions-menu" role="menu">
          <button className="post-actions-item" onClick={() => { onToggleSave?.(); setOpen(false); }}>
            <Bookmark size={15}/> {saved ? "Remove Bookmark" : "Bookmark Post"}
          </button>
          <button className="post-actions-item" onClick={() => setOpen(false)}>
            <Pencil size={15}/> Edit Post
          </button>
          <button className="post-actions-item" onClick={() => setOpen(false)}>
            <Copy size={15}/> Duplicate Post
          </button>
          <button className="post-actions-item" onClick={() => setOpen(false)}>
            <Flag size={15}/> Report Post
          </button>
          <button className="post-actions-item danger" onClick={() => setOpen(false)}>
            <Trash2 size={15}/> Delete Post
          </button>

          <div className="post-actions-sep" />

          <button className="post-actions-item" onClick={() => setOpen(false)}>
            <Share2 size={15}/>
            <span>Share Via Broadcast</span>
            <span className="pa-badge-new">New</span>
          </button>

          <div className="post-actions-sep" />

          <button className="post-actions-item pa-row" onClick={() => setT("follow")}>
            <Rss size={15}/> <span>Follow Post</span> <Toggle on={toggles.follow}/>
          </button>
          {isAdmin && (
            <button
              className="post-actions-item pa-row"
              onClick={() => { setT("pin"); onPinToFeed?.(); }}
            >
              <Pin size={15}/> <span>Pin To Top</span> <Toggle on={toggles.pin}/>
            </button>
          )}
          <button className="post-actions-item pa-row" onClick={() => setT("hideLikes")}>
            <Heart size={15}/> <span>Hide Likes</span> <Toggle on={toggles.hideLikes}/>
          </button>
          <button className="post-actions-item pa-row" onClick={() => setT("hideComments")}>
            <MessageSquare size={15}/> <span>Hide Comments</span> <Toggle on={toggles.hideComments}/>
          </button>
          <button className="post-actions-item pa-row" onClick={() => setT("closeComments")}>
            <MessageSquareOff size={15}/> <span>Close Comments</span> <Toggle on={toggles.closeComments}/>
          </button>
          <button className="post-actions-item pa-row" onClick={() => setT("hideFeatured")}>
            <Star size={15}/> <span>Hide From Featured Areas</span> <Toggle on={toggles.hideFeatured}/>
          </button>
        </div>
      )}
    </div>
  );
}
