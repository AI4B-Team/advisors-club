import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Plus, Heart, MessageCircle, MoreHorizontal, Send, Video, Sparkles } from "lucide-react";
import { ComposerTools } from "@/components/composer-tools";
import { useViewMode } from "@/hooks/use-view-mode";
import { PostHeaderActions } from "@/components/post-header-actions";
import { CommenterStack } from "@/components/commenter-stack";
import { EmailBlastToggle } from "@/components/email-blast-toggle";
import { SEED_POSTS, type FeedPost as Post } from "@/lib/feed-posts";

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
  const [sort, setSort] = useState<"latest"|"top">("latest");
  const [emailBlast, setEmailBlast] = useState(false);

  function publish() {
    const text = draft.trim();
    const t = title.trim();
    if (!text || !t) return;
    const body = `**${t}**\n\n${text}`;
    setPosts(p => [{
      id: crypto.randomUUID(),
      author: "Zaddy",
      initials: "Z",
      color: "#F5A623",
      time: "Just now",
      body,
      likes: 0, comments: 0,
      photo: "https://i.pravatar.cc/120?img=11",
      level: 1,
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
      <div className="hm-head">
        <h1>
          <span className="cc-feed-emoji" style={{marginRight:8}}>🚀</span>
          Space
          <ChevronDown size={18} style={{marginLeft:6,verticalAlign:"-3px"}}/>
        </h1>
        <div className="hm-head-actions">
          <button className="hm-iconbtn" aria-label="AI"><Sparkles size={16}/></button>
          <button className="hm-sort" onClick={()=>setSort(s=>s==="latest"?"top":"latest")}>
            {sort === "latest" ? "Latest" : "Top"} <ChevronDown size={14}/>
          </button>
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
            <span className="cc-composer-target">Posted In: <b>Community</b></span>
            {IS_ADMIN && <EmailBlastToggle on={emailBlast} onChange={setEmailBlast} />}
            <button className="cc-composer-send" onClick={publish} disabled={!draft.trim() || !title.trim()}>
              <Send size={14}/> Publish
            </button>
          </div>
        </div>
      </div>


      <div className="cc-posts">
        {sorted.map(p => (
          <article key={p.id} className={`cc-post${p.pinned?" pinned":""}`}>
            <header className="cc-post-head">
              <span className="post-av-wrap">
                <img className="post-av-img" src={p.photo} alt={p.author} loading="lazy"/>
                <span className="post-av-level">{p.level}</span>
              </span>
              <div className="cc-post-meta">
                <div className="cc-post-name">{p.author}</div>
                <div className="cc-post-time">{p.time}</div>
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
            <div className="cc-post-body">{p.body}</div>
            <footer className="cc-post-foot">
              <button className={`cc-post-act ${p.liked?"on":""}`} onClick={()=>toggleLike(p.id)}>
                <Heart size={16} fill={p.liked ? "currentColor":"none"}/> {p.likes}
              </button>
              <button className="cc-post-act">
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
    </div>
  );
}
