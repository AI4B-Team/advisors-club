import { useState, useRef, useEffect } from "react";
import { Bell, BellOff, MoreHorizontal, Link2, FolderInput, Pin, MessageSquareOff, Flag, Trash2, UserX } from "lucide-react";

type Props = {
  isAdmin?: boolean;
  isPinned?: boolean;
  onPinToFeed?: () => void;
};

export function PostHeaderActions({ isAdmin = false, isPinned = false, onPinToFeed }: Props) {
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
      <button
        className={`post-actions-bell${muted ? " on" : ""}`}
        aria-label={muted ? "Unmute post" : "Mute post notifications"}
        title={muted ? "Notifications muted" : "Notifications on"}
        onClick={() => setMuted(m => !m)}
      >
        {muted ? <BellOff size={16}/> : <Bell size={16}/>}
      </button>
      <button
        className="post-actions-more"
        aria-label="More options"
        onClick={() => setOpen(o => !o)}
      >
        <MoreHorizontal size={18}/>
      </button>
      {open && (
        <div className="post-actions-menu" role="menu">
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
