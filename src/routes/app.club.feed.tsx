import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Plus, Heart, MessageCircle, MoreHorizontal, Send, Video, Sparkles } from "lucide-react";
import { ComposerTools } from "@/components/composer-tools";
import { useViewMode } from "@/hooks/use-view-mode";
import { PostHeaderActions } from "@/components/post-header-actions";
import { CommenterStack } from "@/components/commenter-stack";
import { EmailBlastToggle } from "@/components/email-blast-toggle";
import { PostComments } from "@/components/post-comments";
import { SEED_POSTS, CATEGORY_META, type FeedPost as Post, type PostCategory } from "@/lib/feed-posts";
import { FeedTabs, PostBody, PostBadge, PinBadge, ComposerCategoryPicker, BookmarkButton, type TabId } from "@/components/feed-meta";

const MAX_PINNED = 3;

export const Route = createFileRoute("/app/club/feed")({
  head: () => ({ meta: [{ title: "Feed — Real Estate Empire" }, { name: "description", content: "Live community feed for your Club members." }] }),
  component: FeedPage,
});

const SEED: Post[] = SEED_POSTS;

function FeedPage() {
  const { isAdmin: IS_ADMIN } = useViewMode();
  const [posts, setPosts] = useState<Post[]>(SEED);
  const [draft, setDraft] = useState("");
  const [title, setTitle] = useState("");
  const [sort, setSort] = useState<"latest"|"top"|"unread">("latest");
  const [sortOpen, setSortOpen] = useState(false);
  const SORT_LABEL = { latest: "Latest", top: "Top", unread: "Unread" } as const;
  const [emailBlast, setEmailBlast] = useState(false);
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [composerCat, setComposerCat] = useState<PostCategory>("discussion");
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
  const base = sort === "top" ? [...filtered].sort((a,b)=>b.likes-a.likes) : filtered;
  const sorted = [...base].sort((a,b)=>Number(!!b.pinned)-Number(!!a.pinned));

  return (
    <div className="cc-feed">
      <div className="hm-head">
        <h1>
          <span className="cc-feed-emoji" style={{marginRight:8}}>🚀</span>
          Community
          <ChevronDown size={18} style={{marginLeft:6,verticalAlign:"-3px"}}/>
        </h1>
        <div className="hm-head-actions">
          <button className="hm-iconbtn" aria-label="AI"><Sparkles size={16}/></button>
          <div style={{position:"relative"}}>
            <button className="hm-sort" onClick={()=>setSortOpen(o=>!o)}>
              {SORT_LABEL[sort]} <ChevronDown size={14}/>
            </button>
            {sortOpen && (
              <>
                <div onClick={()=>setSortOpen(false)} style={{position:"fixed",inset:0,zIndex:40}}/>
                <div style={{position:"absolute",top:"calc(100% + 6px)",right:0,minWidth:140,background:"#fff",border:"1px solid #E5E7EB",borderRadius:10,boxShadow:"0 10px 24px -8px rgba(0,0,0,.15)",padding:6,zIndex:50}}>
                  {(["latest","top","unread"] as const).map(opt => (
                    <button key={opt} onClick={()=>{setSort(opt);setSortOpen(false);}} style={{display:"block",width:"100%",textAlign:"left",padding:"8px 10px",borderRadius:6,border:0,background:sort===opt?"#FEF3C7":"transparent",fontSize:13,fontWeight:600,color:"#111827",cursor:"pointer"}}>
                      {SORT_LABEL[opt]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
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

      <div className="cc-composer">
        <div className="cc-composer-top">
          <span className="cc-post-av" style={{background:"#F5A623"}}>Z</span>
          <div className="cc-composer-body">
            <input
              className="cc-composer-title"
              value={title}
              onChange={e=>setTitle(e.target.value)}
              placeholder="Title"
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
          <ComposerTools draft={draft} setDraft={setDraft} className="cc-composer-tools"/>

          <div className="cc-composer-right">
            <ComposerCategoryPicker value={composerCat} onChange={setComposerCat} open={catOpen} setOpen={setCatOpen}/>
            {IS_ADMIN && <EmailBlastToggle on={emailBlast} onChange={setEmailBlast} />}
            <button className="cc-composer-send" onClick={publish} disabled={!draft.trim() || !title.trim()}>
              <Send size={14}/> Publish
            </button>
          </div>
        </div>
      </div>

      <FeedTabs posts={posts} activeTab={activeTab} onChange={setActiveTab}/>

      <div className="cc-posts">
        {sorted.length === 0 && (
          <div className="fp-empty">
            No {CATEGORY_META[activeTab as PostCategory]?.label.toLowerCase() ?? ""}s yet.
            <button type="button" className="fp-empty-link" onClick={()=>setActiveTab("all")}>View all</button>
          </div>
        )}
        {sorted.map(p => (
          <article key={p.id} className={`cc-post${p.pinned?" pinned":""}`}>
            <header className="cc-post-head">
              <span className="post-av-wrap">
                <img className="post-av-img" src={p.photo} alt={p.author} loading="lazy"/>
                <span className="post-av-level">{p.level}</span>
              </span>
              <div className="cc-post-meta">
                <div className="cc-post-name">{p.author}</div>
                <div className="cc-post-time" style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                  <span>{p.time}</span>
                  {p.pinned && <PinBadge/>}
                  <PostBadge category={p.category}/>
                </div>
              </div>
              <PostHeaderActions
                isAdmin={IS_ADMIN}
                isPinned={!!p.pinned}
                onPinToFeed={() => togglePin(p.id)}
                saved={!!p.saved}
                onToggleSave={() => toggleSave(p.id)}
              />
            </header>
            {p.title && <h2 className="cc-post-title">{p.title}</h2>}
            <div className="cc-post-body"><PostBody text={p.body}/></div>
            <footer className="cc-post-foot">
              <button className={`cc-post-act ${p.liked?"on":""}`} onClick={()=>toggleLike(p.id)}>
                <Heart size={16} fill={p.liked ? "currentColor":"none"}/> {p.likes}
              </button>
              <button className={`cc-post-act ${openComments[p.id] ? "on" : ""}`} onClick={() => setOpenComments(o => ({ ...o, [p.id]: !o[p.id] }))}>
                <MessageCircle size={16}/> {p.comments}
              </button>
              <BookmarkButton saved={!!p.saved} onToggle={()=>toggleSave(p.id)}/>
              {p.comments > 0 && (
                <CommenterStack
                  seed={p.id}
                  count={Math.min(5, p.comments)}
                  lastLabel={`New Comment ${p.time.replace(/\b\w/g, c => c.toUpperCase())}`}
                />
              )}
            </footer>
            {openComments[p.id] && <PostComments postId={p.id} />}
          </article>
        ))}
      </div>
    </div>
  );
}

