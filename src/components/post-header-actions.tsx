import { useState, useRef, useEffect } from "react";
import { Bookmark, MoreVertical, Pin, Link2, FolderInput, MessageSquareOff, Flag, Trash2, UserX, Bell, BellOff } from "lucide-react";

type Props = {
  isAdmin?: boolean;
  isPinned?: boolean;
  onPinToFeed?: () => void;
  saved?: boolean;
  onToggleSave?: () => void;
};

export function PostHeaderActions({ isAdmin = false, isPinned = false, onPinToFeed, saved = false, onToggleSave }: Props) {
  const [muted, setMuted] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="post-actions" ref={ref}>
      {isPinned && (
        <button
          type="button"
          className="post-actions-pinned"
          onClick={() => isAdmin && onPinToFeed?.()}
          title={isAdmin ? "Click to unpin" : "Pinned by admin"}
          disabled={!isAdmin}
        >
          <Pin size={13}/> Pinned
        </button>
      )}
      <button
        className={`post-actions-bookmark${saved ? " on" : ""}`}
        aria-label={saved ? "Remove bookmark" : "Bookmark post"}
        title={saved ? "Bookmarked" : "Bookmark"}
        onClick={onToggleSave}
      >
        <Bookmark size={18} fill={saved ? "currentColor" : "none"}/>
      </button>
      <button
        className="post-actions-more"
        aria-label="More options"
        onClick={() => setOpen(o => !o)}
      >
        <MoreVertical size={18}/>
      </button>
      {open && (
        <div className="post-actions-menu" role="menu">
          <button
            className={`post-actions-item${muted ? " on" : ""}`}
            onClick={() => { setMuted(m => !m); setOpen(false); }}
          >
            {muted ? <BellOff size={14}/> : <Bell size={14}/>} {muted ? "Unmute notifications" : "Mute notifications"}
          </button>
          <button className="post-actions-item" onClick={() => setOpen(false)}>
            <Link2 size={14}/> Copy link
          </button>
          {isAdmin && (
            <button className="post-actions-item" onClick={() => setOpen(false)}>
              <FolderInput size={14}/> Change category
            </button>
          )}
          {isAdmin && (
            <button
              className="post-actions-item"
              onClick={() => { onPinToFeed?.(); setOpen(false); }}
            >
              <Pin size={14}/> {isPinned ? "Unpin from feed" : "Pin to feed"}
            </button>
          )}
          {isAdmin && (
            <button className="post-actions-item" onClick={() => setOpen(false)}>
              <MessageSquareOff size={14}/> Turn off comments
            </button>
          )}
          <button className="post-actions-item" onClick={() => setOpen(false)}>
            <Flag size={14}/> Report to admins
          </button>
          {isAdmin && (
            <>
              <div className="post-actions-sep" />
              <button className="post-actions-item danger" onClick={() => setOpen(false)}>
                <Trash2 size={14}/> Delete
              </button>
              <button className="post-actions-item danger" onClick={() => setOpen(false)}>
                <UserX size={14}/> Delete and ban user
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
