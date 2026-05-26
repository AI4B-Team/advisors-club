import { useMemo, useState, useRef, useEffect } from "react";
import { Smile, Bookmark, MessageSquare, MoreHorizontal, Send } from "lucide-react";

type Reaction = { emoji: string; count: number; mine: boolean };
type Comment = {
  id: string;
  author: string;
  photo: string;
  time: string;
  body: string;
  reactions: Reaction[];
  saved: boolean;
  replyTo?: string;
};

const QUICK = ["👍", "❤️", "🎉", "🤣", "😮", "😢", "🙏"];

function seedFor(postId: string): Comment[] {
  return [
    {
      id: `${postId}-c1`,
      author: "Jens Heitmann",
      photo: "https://i.pravatar.cc/80?img=12",
      time: "03:16 PM",
      body: "If you check the pinned channels you will find all of them.",
      reactions: [{ emoji: "❤️", count: 1, mine: true }],
      saved: false,
    },
    {
      id: `${postId}-c2`,
      author: "Stacey Morris",
      photo: "https://i.pravatar.cc/80?img=47",
      time: "03:19 PM",
      body: "Just dropped my first deal recap in there — would love feedback when anyone has a sec 🙏",
      reactions: [],
      saved: false,
    },
  ];
}

export function PostComments({ postId }: { postId: string }) {
  const seed = useMemo(() => seedFor(postId), [postId]);
  const [comments, setComments] = useState<Comment[]>(seed);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);

  // close popovers on outside click
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setPickerFor(null);
        setMenuFor(null);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function toggleReact(commentId: string, emoji: string) {
    setComments(cs => cs.map(c => {
      if (c.id !== commentId) return c;
      const existing = c.reactions.find(r => r.emoji === emoji);
      let reactions: Reaction[];
      if (!existing) {
        reactions = [...c.reactions, { emoji, count: 1, mine: true }];
      } else if (existing.mine) {
        reactions = c.reactions
          .map(r => r.emoji === emoji ? { ...r, count: r.count - 1, mine: false } : r)
          .filter(r => r.count > 0);
      } else {
        reactions = c.reactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1, mine: true } : r);
      }
      return { ...c, reactions };
    }));
    setPickerFor(null);
  }

  function toggleSave(commentId: string) {
    setComments(cs => cs.map(c => c.id === commentId ? { ...c, saved: !c.saved } : c));
  }

  function deleteComment(commentId: string) {
    setComments(cs => cs.filter(c => c.id !== commentId));
    setMenuFor(null);
  }

  function submit() {
    const t = draft.trim();
    if (!t) return;
    const newC: Comment = {
      id: crypto.randomUUID(),
      author: "Zaddy",
      photo: "https://i.pravatar.cc/80?img=11",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      body: t,
      reactions: [],
      saved: false,
      replyTo: replyTo ?? undefined,
    };
    setComments(cs => [...cs, newC]);
    setDraft("");
    setReplyTo(null);
  }

  return (
    <div ref={rootRef} className="pc-wrap">
      {comments.map(c => {
        const replyTarget = c.replyTo ? comments.find(x => x.id === c.replyTo) : null;
        return (
          <div key={c.id} className="pc-row">
            <img className="pc-av" src={c.photo} alt={c.author} loading="lazy" />
            <div className="pc-body">
              <div className="pc-meta">
                <span className="pc-name">{c.author}</span>
                <span className="pc-time">{c.time}</span>
              </div>
              <div className="pc-text">
                {replyTarget && <span className="pc-reply-tag">@{replyTarget.author}</span>}
                {c.body}
              </div>
              {c.reactions.length > 0 && (
                <div className="pc-reactions">
                  {c.reactions.map(r => (
                    <button
                      key={r.emoji}
                      className={`pc-react-chip${r.mine ? " mine" : ""}`}
                      onClick={() => toggleReact(c.id, r.emoji)}
                    >
                      <span>{r.emoji}</span> <b>{r.count}</b>
                    </button>
                  ))}
                  <button
                    className="pc-react-add"
                    onClick={() => setPickerFor(p => p === c.id ? null : c.id)}
                    aria-label="Add reaction"
                  >
                    <Smile size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="pc-actions">
              <button onClick={() => setPickerFor(p => p === c.id ? null : c.id)} aria-label="React" title="React"><Smile size={15} /></button>
              <button onClick={() => toggleSave(c.id)} aria-label="Save" title={c.saved ? "Unsave" : "Save"} style={c.saved ? { color: "#F5A623" } : undefined}>
                <Bookmark size={15} fill={c.saved ? "currentColor" : "none"} />
              </button>
              <button onClick={() => setReplyTo(c.id)} aria-label="Reply" title="Reply"><MessageSquare size={15} /></button>
              <button onClick={() => setMenuFor(m => m === c.id ? null : c.id)} aria-label="More" title="More"><MoreHorizontal size={15} /></button>

              {menuFor === c.id && (
                <div className="pc-menu">
                  <button onClick={() => { navigator.clipboard?.writeText(c.body); setMenuFor(null); }}>Copy text</button>
                  <button onClick={() => deleteComment(c.id)} style={{ color: "#DC2626" }}>Delete</button>
                </div>
              )}
            </div>

            {pickerFor === c.id && (
              <div className="pc-picker">
                {QUICK.map(e => (
                  <button key={e} onClick={() => toggleReact(c.id, e)}>{e}</button>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <div className="pc-compose">
        <img className="pc-av sm" src="https://i.pravatar.cc/80?img=11" alt="You" />
        <div className="pc-compose-field">
          {replyTo && (
            <div className="pc-reply-bar">
              Replying to <b>{comments.find(c => c.id === replyTo)?.author}</b>
              <button onClick={() => setReplyTo(null)} aria-label="Cancel">×</button>
            </div>
          )}
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Write a comment…"
            onKeyDown={e => { if (e.key === "Enter") submit(); }}
          />
        </div>
        <button className="pc-send" onClick={submit} disabled={!draft.trim()}>
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
