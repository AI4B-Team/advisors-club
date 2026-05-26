import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Plus, Heart, MessageCircle, MoreHorizontal, Image as ImageIcon, Smile, Hash, Send, Paperclip, Video, Mic, BarChart3, PlusCircle, Sparkles, Globe, Link2 } from "lucide-react";
import { useViewMode } from "@/hooks/use-view-mode";
import { PostHeaderActions } from "@/components/post-header-actions";
import { CommenterStack } from "@/components/commenter-stack";
import { EmailBlastToggle } from "@/components/email-blast-toggle";
import { FeaturedEvent } from "@/components/featured-event";
import reCover from "@/assets/real-estate-empire-cover.jpg";

const MAX_PINNED = 3;

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
  },
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
  const { isAdmin: IS_ADMIN } = useViewMode();
  const [posts, setPosts] = useState<Post[]>(SEED);
  const [draft, setDraft] = useState("");
  const [title, setTitle] = useState("");
  const [sort, setSort] = useState<"latest"|"top">("latest");
  const [emailBlast, setEmailBlast] = useState(false);

  function publish() {
    const text = draft.trim();
    const t = title.trim();
    if (!text || !t) return;
    setPosts(p => [{
      id: crypto.randomUUID(),
      author: "Zaddy",
      initials: "Z",
      color: "#F5A623",
      time: "Just now",
      title: t,
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
                  placeholder="Title"
                />
                <textarea
                  value={draft}
                  onChange={e=>setDraft(e.target.value)}
                  placeholder="Start a post"
                  rows={2}
                />
              </div>
              
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
              <div className="hm-composer-right">
                {IS_ADMIN && <EmailBlastToggle on={emailBlast} onChange={setEmailBlast} />}
                <button className="hm-send" onClick={publish} disabled={!draft.trim() || !title.trim()}>
                  <Send size={14}/> Publish
                </button>
              </div>
            </div>
          </div>

          <div className="hm-posts">
            {sorted.map(p => (
              <article key={p.id} className={`hm-post${p.pinned?" pinned":""}`}>
                <header className="hm-post-head">
                  <span className="hm-av" style={{background:p.color}}>{p.initials}</span>
                  <div className="hm-post-meta">
                    <div className="hm-post-name">{p.author} <span className="hm-post-dot">·</span> <span className="hm-post-time">{p.time}</span></div>
                    <div className="hm-post-sub">Posted in Discussions</div>
                  </div>
                  <PostHeaderActions
                    isAdmin={IS_ADMIN}
                    isPinned={!!p.pinned}
                    onPinToFeed={() => togglePin(p.id)}
                    saved={!!p.saved}
                    onToggleSave={() => toggleSave(p.id)}
                  />
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
                  {p.comments > 0 && (
                    <CommenterStack
                      seed={p.id}
                      count={Math.min(5, p.comments)}
                      lastLabel={`New Comment ${p.time.replace(/\b\w/g, c => c.toUpperCase())}`}
                    />
                  )}
                </footer>
              </article>
            ))}
          </div>
        </section>

        <aside className="hm-side">
          <div className="hm-card hm-profile">
            <div className="hm-profile-cover">
              <img className="hm-profile-cover-img" src={reCover} alt="" loading="lazy" />
              <h2 className="hm-profile-logo">Real Estate Empire</h2>
              <span className="hm-profile-badge"><Globe size={12}/> PUBLIC</span>
            </div>
            <div className="hm-profile-body">
              <h3 className="hm-profile-name">Real Estate Empire</h3>
              <a className="hm-profile-url" href="https://advisorsclub.com/real-estate-empire" target="_blank" rel="noreferrer">advisorsclub.com/real-estate-empire</a>
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
                {[12,32,45,5,9,68,15,47].map((id,i)=>(
                  <img
                    key={i}
                    className="hm-profile-av"
                    src={`https://i.pravatar.cc/80?img=${id}`}
                    alt=""
                    loading="lazy"
                  />
                ))}
                <span className="hm-profile-av more">+</span>
              </div>
            </div>
          </div>

          <div className="hm-card">
            <h3 className="hm-card-title">Leaderboard</h3>
            {(() => {
              const all = [
                { initials: "EH", color: "#F5A623", name: "Esther H.",      points: 680 },
                { initials: "RF", color: "#7BA77B", name: "Robert Fox",     points: 530 },
                { initials: "JW", color: "#8B5A4A", name: "Jenny W.",       points: 420 },
                { initials: "DG", color: "#A85A3A", name: "Dustin Gedlich", points: 400 },
                { initials: "AM", color: "#D4A574", name: "Arielle Mason",  points: 350 },
                { initials: "JL", color: "#5BA4D4", name: "Jasper Lin",     points: 345 },
                { initials: "CO", color: "#9CA3AF", name: "Camila Ortiz",   points: 320 },
              ];
              const podium = [all[1], all[0], all[2]];
              const ranks  = [2, 1, 3];
              const rest   = all.slice(3);
              return (
                <>
                  <div className="lb-podium">
                    {podium.map((u, i) => (
                      <div key={u.name} className={`lb-pod r${ranks[i]}`}>
                        <div className="lb-pod-av-wrap">
                          <span className="lb-pod-av" style={{background:u.color}}>{u.initials}</span>
                          <span className={`lb-pod-badge r${ranks[i]}`}>{ranks[i]}</span>
                        </div>
                        <div className="lb-pod-name">{u.name}</div>
                        <div className="lb-pod-pts"><span className="lb-pts-star">✦</span>{u.points}</div>
                      </div>
                    ))}
                  </div>
                  <div className="lb-divider"/>
                  <ul className="lb-list">
                    {rest.map((u, i) => (
                      <li key={u.name} className="lb-row">
                        <span className="lb-rank">{i + 4}</span>
                        <span className="lb-av" style={{background:u.color}}>{u.initials}</span>
                        <div className="lb-name">{u.name}</div>
                        <div className="lb-pts">{u.points}</div>
                      </li>
                    ))}
                  </ul>
                </>
              );
            })()}
          </div>



          <FeaturedEvent
            title="Fail Forward — Live Workshop"
            subtitle="Bring one stuck deal. Leave with a 7-day action plan."
            whenISO="2026-05-28T15:00:00-04:00"
            whenLabel="Thu, May 28 · 3:00 PM EDT"
            host="Michael A."
          />

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
