import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Rocket, ChevronDown, Plus, Heart, MessageCircle, Bookmark, MoreHorizontal, Image as ImageIcon, Smile, Hash, Send, Paperclip, Video, Mic, BarChart3, PlusCircle, Pin } from "lucide-react";
import { useViewMode } from "@/hooks/use-view-mode";

const MAX_PINNED = 3;

export const Route = createFileRoute("/app/club/feed")({
  head: () => ({ meta: [{ title: "Feed — Real Estate Empire" }, { name: "description", content: "Live community feed for your Club members." }] }),
  component: FeedPage,
});

type Post = {
  id: string;
  author: string;
  initials: string;
  color: string;
  time: string;
  body: string;
  likes: number;
  comments: number;
  liked?: boolean;
  saved?: boolean;
  pinned?: boolean;
};

const SEED: Post[] = [
  {
    id: "1",
    author: "Michael A.",
    initials: "MA",
    color: "#4F46E5",
    time: "1 month ago",
    body: "Welcome to **Real Estate Empire** 🚀 — drop your city + niche below so we can match you with the right deal flow this week.",
    likes: 42, comments: 18,
    pinned: true,
  },
  {
    id: "2",
    author: "Sarah K.",
    initials: "SK",
    color: "#10B981",
    time: "3 days ago",
    body: "Just closed my 3rd wholesale deal using the framework from week 2 — $14k net. Happy to walk anyone through the script that worked.",
    likes: 87, comments: 24,
  },
  {
    id: "3",
    author: "Devon R.",
    initials: "DR",
    color: "#F5A623",
    time: "5 hours ago",
    body: "Question for the group: anyone using AIVA for cold caller training? Looking for prompts that simulate seller objections.",
    likes: 12, comments: 6,
  },
];

function FeedPage() {
  const { isAdmin: IS_ADMIN } = useViewMode();
  const [posts, setPosts] = useState<Post[]>(SEED);
  const [draft, setDraft] = useState("");
  const [title, setTitle] = useState("");
  const [sort, setSort] = useState<"latest"|"top">("latest");

  function publish() {
    const text = draft.trim();
    if (!text) return;
    const body = title.trim() ? `**${title.trim()}**\n\n${text}` : text;
    setPosts(p => [{
      id: crypto.randomUUID(),
      author: "Zaddy",
      initials: "Z",
      color: "#F5A623",
      time: "Just now",
      body,
      likes: 0, comments: 0,
    }, ...p]);
    setDraft("");
    setTitle("");
  }

  function toggleLike(id: string) {
    setPosts(p => p.map(po => po.id === id ? {...po, liked: !po.liked, likes: po.likes + (po.liked ? -1 : 1)} : po));
  }
  function toggleSave(id: string) {
    setPosts(p => p.map(po => po.id === id ? {...po, saved: !po.saved} : po));
  }
  function togglePin(id: string) {
    setPosts(p => {
      const target = p.find(po => po.id === id);
      if (!target) return p;
      const pinnedCount = p.filter(po => po.pinned).length;
      if (!target.pinned && pinnedCount >= MAX_PINNED) {
        alert(`You can pin up to ${MAX_PINNED} posts.`);
        return p;
      }
      return p.map(po => po.id === id ? {...po, pinned: !po.pinned} : po);
    });
  }

  const base = sort === "top" ? [...posts].sort((a,b)=>b.likes-a.likes) : posts;
  const sorted = [...base].sort((a,b)=>Number(!!b.pinned)-Number(!!a.pinned));

  return (
    <div className="cc-feed">
      <div className="cc-feed-head">
        <div className="cc-feed-title">
          <span className="cc-feed-emoji">🚀</span>
          <h1>Space</h1>
          <ChevronDown size={18}/>
        </div>

        <div className="cc-feed-actions">
          <button className="cc-feed-sort" onClick={()=>setSort(s=>s==="latest"?"top":"latest")}>
            {sort === "latest" ? "Latest" : "Top"} <ChevronDown size={14}/>
          </button>
          <div className="cc-feed-avs">
            <span className="cc-feed-av" style={{background:"#84cc16"}}>A</span>
            <span className="cc-feed-av" style={{background:"#65a30d"}}>B</span>
            <span className="cc-feed-av" style={{background:"#4d7c0f"}}>C</span>
            <span className="cc-feed-av-plus">+30</span>
          </div>
          <button className="cc-feed-new" onClick={publish}>
            <Plus size={15} strokeWidth={3}/> New Post
          </button>
        </div>
      </div>

      <div className="cc-composer">
        <div className="cc-composer-top">
          <span className="cc-post-av" style={{background:"#F5A623"}}>Z</span>
          <div className="cc-composer-body">
            <input
              className="cc-composer-title"
              value={title}
              onChange={e=>setTitle(e.target.value)}
              placeholder="Title (optional)"
            />
            <textarea
              value={draft}
              onChange={e=>setDraft(e.target.value)}
              placeholder="Write something"
              rows={3}
            />
          </div>
        </div>
        <div className="cc-composer-foot">
          <div className="cc-composer-tools">
            <button data-tip="Add"><PlusCircle size={18}/></button>
            <button data-tip="Topic"><Hash size={18}/></button>
            <button data-tip="Attach file"><Paperclip size={18}/></button>
            <button data-tip="Video"><Video size={18}/></button>
            <button data-tip="GIF"><span style={{fontSize:10,fontWeight:800,letterSpacing:.5}}>GIF</span></button>
            <button data-tip="Image"><ImageIcon size={18}/></button>
            <button data-tip="Emoji"><Smile size={18}/></button>
            <button data-tip="Poll"><BarChart3 size={18}/></button>
            <button data-tip="Voice note"><Mic size={18}/></button>
          </div>
          <div className="cc-composer-right">
            <span className="cc-composer-target">Posting in: <b>Community</b></span>
            <button className="cc-composer-send" onClick={publish} disabled={!draft.trim()}>
              <Send size={14}/> Publish
            </button>
          </div>
        </div>
      </div>


      <div className="cc-posts">
        {sorted.map(p => (
          <article key={p.id} className={`cc-post${p.pinned?" pinned":""}`}>
            {p.pinned && (
              <button
                type="button"
                className="cc-post-pinned"
                onClick={()=> IS_ADMIN && togglePin(p.id)}
                title={IS_ADMIN ? "Click to unpin" : "Pinned by admin"}
                disabled={!IS_ADMIN}
              >
                <Pin size={13}/> Pinned
              </button>
            )}
            <header className="cc-post-head">
              <span className="cc-post-av" style={{background:p.color}}>{p.initials}</span>
              <div className="cc-post-meta">
                <div className="cc-post-name">{p.author}</div>
                <div className="cc-post-time">{p.time}</div>
              </div>
              <PostHeaderActions
                isAdmin={IS_ADMIN}
                isPinned={!!p.pinned}
                onPinToFeed={() => togglePin(p.id)}
              />
            </header>
            <div className="cc-post-body">{p.body}</div>
            <footer className="cc-post-foot">
              <button className={`cc-post-act ${p.liked?"on":""}`} onClick={()=>toggleLike(p.id)}>
                <Heart size={16} fill={p.liked ? "currentColor":"none"}/> {p.likes}
              </button>
              <button className="cc-post-act">
                <MessageCircle size={16}/> {p.comments}
              </button>
              <button className={`cc-post-act ${p.saved?"on":""}`} onClick={()=>toggleSave(p.id)} style={{marginLeft:"auto"}}>
                <Bookmark size={16} fill={p.saved?"currentColor":"none"}/>
              </button>
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
}
