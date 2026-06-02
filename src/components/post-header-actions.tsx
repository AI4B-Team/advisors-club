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
  GraduationCap,
  X,
} from "lucide-react";
import { pinPostToPage } from "@/lib/pinned-posts";
import { toast } from "sonner";

type Props = {
  isAdmin?: boolean;
  isPinned?: boolean;
  onPinToFeed?: () => void;
  saved?: boolean;
  onToggleSave?: () => void;
  postId?: string;
  postTitle?: string;
  postAuthor?: string;
};

type Toggles = {
  follow: boolean;
  pin: boolean;
  hideLikes: boolean;
  hideComments: boolean;
  closeComments: boolean;
  hideFeatured: boolean;
};

export function PostHeaderActions({ isAdmin = false, isPinned = false, onPinToFeed, saved = false, onToggleSave, postId, postTitle, postAuthor }: Props) {
  const [open, setOpen] = useState(false);
  const [pinDialog, setPinDialog] = useState(false);
  const [pinPageName, setPinPageName] = useState("");
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
          {isAdmin && (
            <button
              className="post-actions-item"
              onClick={() => { setOpen(false); setPinPageName(""); setPinDialog(true); }}
            >
              <GraduationCap size={15}/> <span>Pin To Course Page</span>
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
      {pinDialog && (
        <div
          onClick={() => setPinDialog(false)}
          style={{position:"fixed",inset:0,background:"rgba(17,24,39,.5)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{background:"#fff",borderRadius:14,width:"100%",maxWidth:440,boxShadow:"0 25px 60px -15px rgba(0,0,0,.35)",overflow:"hidden"}}
          >
            <div style={{padding:"18px 22px 4px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
              <h3 style={{margin:0,fontSize:18,fontWeight:800,color:"#111827"}}>Pin To Course Page</h3>
              <button onClick={() => setPinDialog(false)} aria-label="Close" style={{background:"transparent",border:0,color:"#9CA3AF",cursor:"pointer"}}><X size={18}/></button>
            </div>
            <div style={{padding:"10px 22px 4px"}}>
              <p style={{margin:"0 0 12px",fontSize:13,color:"#6B7280",lineHeight:1.5}}>
                Type the name of the course lesson page to pin this post to. Members will see it in the lesson's pinned posts section.
              </p>
              <div style={{border:"1px solid #D1D5DB",borderRadius:8,padding:"10px 12px 8px"}}>
                <div style={{fontSize:11,color:"#6B7280",fontWeight:600,marginBottom:2}}>Lesson Page Name</div>
                <input
                  autoFocus
                  value={pinPageName}
                  onChange={e => setPinPageName(e.target.value)}
                  placeholder="e.g. Welcome & Mindset"
                  style={{width:"100%",border:0,outline:"none",fontSize:14,color:"#111827",background:"transparent"}}
                />
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"flex-end",alignItems:"center",gap:8,padding:"14px 18px 18px"}}>
              <button
                type="button"
                onClick={() => setPinDialog(false)}
                style={{background:"transparent",border:0,color:"#6B7280",fontWeight:700,fontSize:12,textTransform:"uppercase",letterSpacing:.5,cursor:"pointer",padding:"8px 14px"}}
              >Cancel</button>
              <button
                type="button"
                disabled={!pinPageName.trim()}
                onClick={() => {
                  const name = pinPageName.trim();
                  if (!name) return;
                  pinPostToPage(name, {
                    postId: postId ?? `post-${Date.now()}`,
                    postTitle: postTitle ?? "Untitled Post",
                    postAuthor: postAuthor ?? "Member",
                  });
                  toast.success(`Pinned To "${name}"`);
                  setPinDialog(false);
                }}
                style={{background:pinPageName.trim()?"#111827":"#E5E7EB",color:pinPageName.trim()?"#fff":"#9CA3AF",border:0,borderRadius:8,padding:"10px 20px",fontWeight:700,fontSize:12,textTransform:"uppercase",letterSpacing:.5,cursor:pinPageName.trim()?"pointer":"not-allowed"}}
              >Pin Post</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
