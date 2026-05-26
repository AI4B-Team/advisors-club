import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Plus, Heart, MessageCircle, Bookmark, MoreHorizontal, Image as ImageIcon, Smile, Hash, Send, Paperclip, Video, Mic, BarChart3, PlusCircle, Sparkles, Share2, Globe, Link2, Pin } from "lucide-react";

const MAX_PINNED = 3;
const IS_ADMIN = true;

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Home — Real Estate Empire" }, { name: "description", content: "Your Club home feed." }] }),
  component: HomePage,
});

type Post = {
  id: string;
  author: string;
  initials: string;
  color: string;
  time: string;
  title?: string;
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
    color: "#F5A623",
    time: "3d",
    title: "2026.05.21 Fail Forward",
    body: "Live replay from this week's Fail Forward session — drop your biggest takeaway below and tag a teammate who needs to hear it.",
    likes: 87, comments: 24,
    pinned: true,
  {
    id: "2",
    author: "Sarah K.",
    initials: "SK",
    color: "#10B981",
    time: "5h",
    body: "Just closed my 3rd wholesale deal using the framework from week 2 — $14k net. Happy to walk anyone through the script that worked.",
    likes: 42, comments: 12,
  },
];

const EVENTS = [
  { day: "26", mo: "MAY", title: "Hotline", time: "5:30 – 6:30 PM EDT" },
  { day: "27", mo: "MAY", title: "LIVE Q&A Calls", time: "5:30 – 6:30 PM EDT" },
  { day: "28", mo: "MAY", title: "REAL Elite Bi-weekly Call", time: "12:00 – 1:00 PM EDT" },
  { day: "28", mo: "MAY", title: "Fail Forward", time: "3:00 – 4:00 PM EDT" },
  { day: "28", mo: "MAY", title: "Hotline", time: "5:30 – 6:30 PM EDT" },
];

const TRENDING = [
  { initials: "JM", color: "#4F46E5", title: "Skip tracing playbook", who: "Judith M." },
  { initials: "GD", color: "#0EA5E9", title: "Give your first deal a chance", who: "Greg D." },
  { initials: "AL", color: "#F5A623", title: "Doubling down on door knocks", who: "Albert Lott" },
];

function HomePage() {
  const [posts, setPosts] = useState<Post[]>(SEED);
  const [draft, setDraft] = useState("");
  const [title, setTitle] = useState("");
  const [sort, setSort] = useState<"latest"|"top">("latest");

  function publish() {
    const text = draft.trim();
    if (!text) return;
    setPosts(p => [{
      id: crypto.randomUUID(),
      author: "Zaddy",
      initials: "Z",
      color: "#F5A623",
      time: "Just now",
      title: title.trim() || undefined,
      body: text,
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

  const sorted = sort === "top" ? [...posts].sort((a,b)=>b.likes-a.likes) : posts;

  return (
    <div className="hm">
      <div className="hm-grid">
        <section className="hm-feed">
          <div className="hm-head">
            <h1>Feed</h1>
            <div className="hm-head-actions">
              <button className="hm-iconbtn" aria-label="AI"><Sparkles size={16}/></button>
              <button className="hm-sort" onClick={()=>setSort(s=>s==="latest"?"top":"latest")}>
                {sort === "latest" ? "Latest" : "Top"} <ChevronDown size={14}/>
              </button>
              <button className="hm-new" onClick={publish}>
                <Plus size={15} strokeWidth={3}/> New Post
              </button>
              <button className="hm-iconbtn" aria-label="More"><MoreHorizontal size={16}/></button>
            </div>
          </div>

          <div className="hm-composer">
            <div className="hm-composer-top">
              <span className="hm-av" style={{background:"#F5A623"}}>Z</span>
              <div className="hm-composer-body">
                <input
                  className="hm-composer-title"
                  value={title}
                  onChange={e=>setTitle(e.target.value)}
                  placeholder="Title (optional)"
                />
                <textarea
                  value={draft}
                  onChange={e=>setDraft(e.target.value)}
                  placeholder="Start a post"
                  rows={2}
                />
              </div>
              <button className="hm-composer-plus" onClick={publish} aria-label="Add"><Plus size={18}/></button>
            </div>
            <div className="hm-composer-foot">
              <div className="hm-composer-tools">
                <button data-tip="Add"><PlusCircle size={18}/></button>
                <button data-tip="Topic"><Hash size={18}/></button>
                <button data-tip="Attach"><Paperclip size={18}/></button>
                <button data-tip="Video"><Video size={18}/></button>
                <button data-tip="Image"><ImageIcon size={18}/></button>
                <button data-tip="Emoji"><Smile size={18}/></button>
                <button data-tip="Poll"><BarChart3 size={18}/></button>
                <button data-tip="Voice"><Mic size={18}/></button>
              </div>
              <button className="hm-send" onClick={publish} disabled={!draft.trim()}>
                <Send size={14}/> Publish
              </button>
            </div>
          </div>

          <div className="hm-posts">
            {sorted.map(p => (
              <article key={p.id} className="hm-post">
                <header className="hm-post-head">
                  <span className="hm-av" style={{background:p.color}}>{p.initials}</span>
                  <div className="hm-post-meta">
                    <div className="hm-post-name">{p.author} <span className="hm-post-dot">·</span> <span className="hm-post-time">{p.time}</span></div>
                    <div className="hm-post-sub">Posted in Discussions</div>
                  </div>
                  <button className="hm-post-share"><Share2 size={14}/> Share</button>
                  <button className="hm-post-more" aria-label="More"><MoreHorizontal size={18}/></button>
                </header>
                {p.title && <h2 className="hm-post-title">{p.title}</h2>}
                <div className="hm-post-body">{p.body}</div>
                <footer className="hm-post-foot">
                  <button className={`hm-post-act ${p.liked?"on":""}`} onClick={()=>toggleLike(p.id)}>
                    <Heart size={16} fill={p.liked ? "currentColor":"none"}/> {p.likes}
                  </button>
                  <button className="hm-post-act">
                    <MessageCircle size={16}/> {p.comments}
                  </button>
                  <button className={`hm-post-act ${p.saved?"on":""}`} onClick={()=>toggleSave(p.id)} style={{marginLeft:"auto"}}>
                    <Bookmark size={16} fill={p.saved?"currentColor":"none"}/>
                  </button>
                </footer>
              </article>
            ))}
          </div>
        </section>

        <aside className="hm-side">
          <div className="hm-card hm-profile">
            <div className="hm-profile-cover">
              <h2 className="hm-profile-logo">Real Estate Empire</h2>
              <span className="hm-profile-badge"><Globe size={12}/> PUBLIC</span>
            </div>
            <div className="hm-profile-body">
              <h3 className="hm-profile-name">Real Estate Empire</h3>
              <p className="hm-profile-desc">Build wealth with rentals, flips & syndications — a hands-on community for serious operators.</p>
              <ul className="hm-profile-links">
                <li><Link2 size={14}/> <a href="#">Join My Newsletter</a></li>
                <li><Link2 size={14}/> <a href="#">My Top Online Resources</a></li>
                <li><Link2 size={14}/> <a href="#">Schedule Your Call</a></li>
              </ul>
              <div className="hm-profile-stats">
                <div><strong>3.5k</strong><span>Members</span></div>
                <div><strong>221<i/></strong><span>Online</span></div>
                <div><strong>3</strong><span>Admins</span></div>
              </div>
              <div className="hm-profile-avs">
                {["#F5A623","#10B981","#4F46E5","#E11D48","#0EA5E9","#8B5CF6","#F97316","#14B8A6"].map((c,i)=>(
                  <span key={i} className="hm-profile-av" style={{background:c}}/>
                ))}
                <span className="hm-profile-av more">+</span>
              </div>
            </div>
          </div>


          <div className="hm-card">
            <h3 className="hm-card-title">Upcoming events</h3>
            <ul className="hm-events">
              {EVENTS.map((e,i)=>(
                <li key={i} className="hm-event">
                  <div className="hm-event-date">
                    <span className="hm-event-day">{e.day}</span>
                    <span className="hm-event-mo">{e.mo}</span>
                  </div>
                  <div className="hm-event-meta">
                    <div className="hm-event-title">{e.title}</div>
                    <div className="hm-event-time">{e.time}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="hm-card">
            <h3 className="hm-card-title">Trending posts</h3>
            <ul className="hm-trending">
              {TRENDING.map((t,i)=>(
                <li key={i} className="hm-trend">
                  <span className="hm-av sm" style={{background:t.color}}>{t.initials}</span>
                  <div>
                    <div className="hm-trend-title">{t.title}</div>
                    <div className="hm-trend-who">{t.who}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
