import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Plus, Heart, MessageCircle, MoreHorizontal, Send, Video, Sparkles, Link2, TrendingUp, Users, Clock, MessageSquare, Flame, ArrowRight, PenLine, Wand2, Film } from "lucide-react";
import { ComposerTools } from "@/components/composer-tools";
import { useViewMode } from "@/hooks/use-view-mode";
import { PostHeaderActions } from "@/components/post-header-actions";
import { CommenterStack } from "@/components/commenter-stack";
import { EmailBlastToggle } from "@/components/email-blast-toggle";
import { FeaturedEvent } from "@/components/featured-event";
import { FeedTabs, PostBody, PostBadge, PinBadge, ComposerCategoryPicker, BookmarkButton, type TabId, type FeedSort } from "@/components/feed-meta";
import reCover from "@/assets/real-estate-empire-cover.jpg";

const MAX_PINNED = 3;

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Home — Real Estate Empire" }, { name: "description", content: "Your Club home feed." }] }),
  component: HomePage,
});

import { SEED_POSTS, CATEGORY_META, type FeedPost as Post, type PostCategory } from "@/lib/feed-posts";

const SEED: Post[] = SEED_POSTS;


const EVENTS = [
  { day: "26", mo: "MAY", title: "Hotline", time: "5:30 – 6:30 PM EDT" },
  { day: "27", mo: "MAY", title: "LIVE Q&A Calls", time: "5:30 – 6:30 PM EDT" },
  { day: "28", mo: "MAY", title: "REAL Elite Bi-weekly Call", time: "12:00 – 1:00 PM EDT" },
  { day: "28", mo: "MAY", title: "Fail Forward", time: "3:00 – 4:00 PM EDT" },
  { day: "28", mo: "MAY", title: "Hotline", time: "5:30 – 6:30 PM EDT" },
];

const TRENDING = [
  { photo: "https://i.pravatar.cc/80?img=48", title: "Skip tracing playbook", who: "Judith M." },
  { photo: "https://i.pravatar.cc/80?img=13", title: "Give your first deal a chance", who: "Greg D." },
  { photo: "https://i.pravatar.cc/80?img=68", title: "Doubling down on door knocks", who: "Albert Lott" },
];

function HomePage() {
  const { isAdmin: IS_ADMIN } = useViewMode();
  const [posts, setPosts] = useState<Post[]>(SEED);
  const [draft, setDraft] = useState("");
  const [title, setTitle] = useState("");
  const [sort, setSort] = useState<FeedSort>("latest");
  
  const [emailBlast, setEmailBlast] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [composerCat, setComposerCat] = useState<PostCategory>("general");
  const [catOpen, setCatOpen] = useState(false);

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
      photo: "https://i.pravatar.cc/120?img=11",
      level: 1,
      category: composerCat,
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

  const filtered = activeTab === "all" ? posts : posts.filter(p => p.category === activeTab);
  const base = (sort === "likes" || sort === "popular") ? [...filtered].sort((a,b)=>b.likes-a.likes)
    : sort === "oldest" ? [...filtered].reverse()
    : filtered;
  const sorted = [...base].sort((a,b)=>Number(!!b.pinned)-Number(!!a.pinned));

  return (
    <div className="hm">
      <div className="hm-grid">
        <section className="hm-feed">
          <div className="hm-head">
            <h1>Feed</h1>
            <div className="hm-head-actions">
              <button className="hm-iconbtn" aria-label="AI"><Sparkles size={16}/></button>
              <button className="hm-golive" type="button">
                <span className="hm-golive-dot"/>
                <Video size={14}/> Go Live
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
              <ComposerTools draft={draft} setDraft={setDraft} className="hm-composer-tools"/>

              <div className="hm-composer-right">
                <AivaComposerMenu
                  onWrite={()=>setDraft(d => d + (d ? "\n\n" : "") + "Draft started with AIVA — refine the angle, add a hook, and end with a question.")}
                  onPrompt={()=>{ setTitle(t => t || "Discussion: What's your biggest unlock this week?"); setDraft(d => d + (d ? "\n\n" : "") + "Share one thing you learned, one thing you shipped, and one thing you're stuck on. Tag a member who could help."); }}
                  onReplay={()=>{ setTitle(t => t || "Live Replay Recap — Key Takeaways"); setDraft(d => d + (d ? "\n\n" : "") + "Top moments from yesterday's live:\n• Insight 1\n• Insight 2\n• Action step\n\nFull replay inside."); }}
                />
                <ComposerCategoryPicker value={composerCat} onChange={setComposerCat} open={catOpen} setOpen={setCatOpen}/>
                {IS_ADMIN && <EmailBlastToggle on={emailBlast} onChange={setEmailBlast} />}
                <button className="hm-send" onClick={publish} disabled={!draft.trim() || !title.trim()}>
                  <Send size={14}/> Publish
                </button>
              </div>
            </div>
          </div>

          <FeedTabs posts={posts} activeTab={activeTab} onChange={setActiveTab} sort={sort} onSortChange={setSort}/>

          <div className="hm-posts">
            {sorted.length === 0 && (
              <div className="fp-empty">
                No {CATEGORY_META[activeTab as PostCategory]?.label.toLowerCase() ?? ""}s yet.
                <button type="button" className="fp-empty-link" onClick={()=>setActiveTab("all")}>View all</button>
              </div>
            )}
            {sorted.map(p => (
              <article key={p.id} className={`hm-post${p.pinned?" pinned":""}`}>
                <header className="hm-post-head">
                  <span className="post-av-wrap">
                    <img className="post-av-img" src={p.photo} alt={p.author} loading="lazy"/>
                    <span className="post-av-level">{p.level}</span>
                  </span>
                  <div className="hm-post-meta">
                    <div className="hm-post-name">{p.author}</div>
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
                <div className="hm-post-body"><PostBody text={p.body}/></div>
                <footer className="hm-post-foot">
                  <button className={`hm-post-act ${p.liked?"on":""}`} onClick={()=>toggleLike(p.id)}>
                    <Heart size={16} fill={p.liked ? "currentColor":"none"}/> {p.likes}
                  </button>
                  <button className="hm-post-act" onClick={()=>setPosts(ps=>ps.map(po=>po.id===p.id?{...po,comments:po.comments+1}:po))}>
                    <MessageCircle size={16}/> {p.comments}
                  </button>
                  {p.comments > 0 && (
                    <CommenterStack
                      seed={p.id}
                      count={Math.min(5, p.comments)}
                      lastLabel={`New Comment ${p.time.replace(/\b\w/g, c => c.toUpperCase())}`}
                    />
                  )}
                  <div className="hm-post-foot-meta">
                    <PostBadge category={p.category}/>
                    <span className="hm-post-time">{p.time}</span>
                  </div>
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

          <AivaInsightsCard />



          <div className="hm-card">
            <h3 className="hm-card-title">Leaderboard</h3>
            {(() => {
              const all = [
                { initials: "EH", color: "#F5A623", name: "Esther H.",      points: 680, photo: "https://i.pravatar.cc/120?img=47" },
                { initials: "RF", color: "#7BA77B", name: "Robert Fox",     points: 530, photo: "https://i.pravatar.cc/120?img=12" },
                { initials: "JW", color: "#8B5A4A", name: "Jenny W.",       points: 420, photo: "https://i.pravatar.cc/120?img=45" },
                { initials: "DG", color: "#A85A3A", name: "Dustin Gedlich", points: 400, photo: "https://i.pravatar.cc/80?img=33"  },
                { initials: "AM", color: "#D4A574", name: "Arielle Mason",  points: 350, photo: "https://i.pravatar.cc/80?img=49"  },
                { initials: "JL", color: "#5BA4D4", name: "Jasper Lin",     points: 345, photo: "https://i.pravatar.cc/80?img=15"  },
                { initials: "CO", color: "#9CA3AF", name: "Camila Ortiz",   points: 320, photo: "https://i.pravatar.cc/80?img=44"  },
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
                          <img className="lb-pod-av" src={u.photo} alt={u.name} loading="lazy"/>
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
                        <img className="lb-av" src={u.photo} alt={u.name} loading="lazy"/>
                        <div className="lb-name">{u.name}</div>
                        <div className="lb-pts">{u.points}</div>
                      </li>
                    ))}
                  </ul>
                  <a className="lb-see-all" href="#">See Full Leaderboard <span aria-hidden>→</span></a>
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
            <h3 className="hm-card-title">Upcoming Events</h3>
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
            <h3 className="hm-card-title">Trending Posts</h3>
            <ul className="hm-trending">
              {TRENDING.map((t,i)=>(
                <li key={i} className="hm-trend">
                  <img className="hm-av sm" src={t.photo} alt={t.who} loading="lazy" style={{objectFit:"cover"}}/>
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

/* ============ AIVA INSIGHTS ============ */
const AIVA_INSIGHTS = [
  { icon: <Users size={14}/>, text: "12 members likely to disengage", tone: "warn" as const, cta: "Review" },
  { icon: <Clock size={14}/>, text: "Best posting time: 3PM EST", tone: "info" as const, cta: "Schedule" },
  { icon: <TrendingUp size={14}/>, text: "Challenge engagement up 18%", tone: "good" as const, cta: "View" },
  { icon: <MessageSquare size={14}/>, text: "3 unanswered questions need attention", tone: "warn" as const, cta: "Answer" },
  { icon: <Flame size={14}/>, text: "Top topic: seller financing", tone: "info" as const, cta: "Explore" },
];

function AivaInsightsCard() {
  return (
    <div className="hm-card aiva-ins">
      <div className="aiva-ins-head">
        <span className="aiva-ins-badge"><Sparkles size={13}/></span>
        <div className="aiva-ins-titles">
          <h3 className="aiva-ins-title">AIVA Insights</h3>
          <span className="aiva-ins-sub">LIVE Community Intelligence</span>
        </div>
        <span className="aiva-ins-pulse" aria-hidden/>
      </div>
      <ul className="aiva-ins-list">
        {AIVA_INSIGHTS.map((i, idx) => (
          <li key={idx} className={`aiva-ins-item tone-${i.tone}`}>
            <span className="aiva-ins-i">{i.icon}</span>
            <span className="aiva-ins-t">{i.text}</span>
            <button className="aiva-ins-cta">{i.cta} <ArrowRight size={11}/></button>
          </li>
        ))}
      </ul>
      <a className="aiva-ins-all" href="#">Ask AIVA anything <ArrowRight size={12}/></a>
    </div>
  );
}

/* ============ AIVA COMPOSER MENU ============ */
function AivaComposerMenu({ onWrite, onPrompt, onReplay }: { onWrite: () => void; onPrompt: () => void; onReplay: () => void }) {
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
    <div className="aiva-comp" ref={ref}>
      <button type="button" className="aiva-comp-btn" onClick={()=>setOpen(o=>!o)} aria-label="Write with AIVA">
        <Sparkles size={13}/> <span>AIVA</span>
      </button>
      {open && (
        <div className="aiva-comp-menu" role="menu">
          <button type="button" className="aiva-comp-item" onClick={()=>{onWrite();setOpen(false);}}>
            <PenLine size={14}/> <span>Write with AIVA</span>
          </button>
          <button type="button" className="aiva-comp-item" onClick={()=>{onPrompt();setOpen(false);}}>
            <Wand2 size={14}/> <span>Generate discussion prompt</span>
          </button>
          <button type="button" className="aiva-comp-item" onClick={()=>{onReplay();setOpen(false);}}>
            <Film size={14}/> <span>Turn live replay into post</span>
          </button>
        </div>
      )}
    </div>
  );
}
