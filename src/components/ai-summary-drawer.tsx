import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Sparkles, Clock, FileText, Image as ImageIcon, Video, Megaphone, TrendingUp, Users, MessageSquare, Download, Calendar, Zap } from "lucide-react";

type Range = "24h" | "7d" | "30d" | "all";

const RANGES: { id: Exclude<Range,"all">; label: string }[] = [
  { id: "24h", label: "24 Hours" },
  { id: "7d", label: "7 Days" },
  { id: "30d", label: "30 Days" },
];

const SUMMARIES: Record<Range, { headline: string; bullets: string[]; stats: { label: string; value: string }[] }> = {
  "24h": {
    headline: "Quiet day in the community — 3 new posts, mostly around the upcoming live event.",
    bullets: [
      "Zaddy pinned the **Real Estate Empire kickoff** thread.",
      "2 new members joined via the Founders link.",
      "Top reaction: 🔥 on Molly's deal breakdown post.",
    ],
    stats: [
      { label: "Posts", value: "3" },
      { label: "Comments", value: "12" },
      { label: "New members", value: "2" },
      { label: "Live sessions", value: "0" },
    ],
  },
  "7d": {
    headline: "High engagement week — discussions centered on AI tooling and live deal flow.",
    bullets: [
      "Most active thread: **'How are you using AI in cold outreach?'** (48 replies).",
      "**Linda Olsen** and **Lisa Lieberman-Wang** drove key conversations on systemization.",
      "3 new courses were uploaded in the Classroom.",
      "Push Ten Mastermind had the highest RSVP rate of the week.",
    ],
    stats: [
      { label: "Posts", value: "27" },
      { label: "Comments", value: "184" },
      { label: "New members", value: "14" },
      { label: "Live sessions", value: "3" },
    ],
  },
  "30d": {
    headline: "Strong month for community growth, driven by AI workflows and live mastermind sessions.",
    bullets: [
      "Membership grew **18%** with strongest signups from the Free Virtual Summit funnel.",
      "Top 3 topics: AI prompting, deal financing, cold outreach systems.",
      "Engagement peaked around the **REAL360 Weekly Mastermind**.",
      "**12 admin uploads** including new templates and call replays.",
    ],
    stats: [
      { label: "Posts", value: "112" },
      { label: "Comments", value: "892" },
      { label: "New members", value: "67" },
      { label: "Live sessions", value: "11" },
    ],
  },
  "all": {
    headline: "Community-wide overview — your members consistently rally around live coaching and templates.",
    bullets: [
      "Most engaged segment: **PRO Insiders** (avg 4.2 posts/week).",
      "Top format: video replays + worksheet pairings.",
      "Sentiment trend: overwhelmingly positive (94% positive reactions).",
    ],
    stats: [
      { label: "Posts", value: "1.2k" },
      { label: "Comments", value: "8.4k" },
      { label: "Members", value: "412" },
      { label: "Live sessions", value: "58" },
    ],
  },
};

const RECENT_UPLOADS = [
  { icon: <FileText size={14}/>, title: "Cold Outreach Template v4", by: "Zaddy", time: "2h ago", type: "Doc" },
  { icon: <Video size={14}/>, title: "Push Ten Mastermind — Replay", by: "Brian Hanson", time: "1d ago", type: "Video" },
  { icon: <ImageIcon size={14}/>, title: "AI Workflow Diagram", by: "Molly Shaw-Matthers", time: "2d ago", type: "Image" },
  { icon: <FileText size={14}/>, title: "Q2 Deal Pipeline Spreadsheet", by: "Linda Olsen", time: "4d ago", type: "Sheet" },
  { icon: <Megaphone size={14}/>, title: "Announcement: Summit dates", by: "Zaddy", time: "5d ago", type: "Post" },
];

const QUICK = [
  { icon: <TrendingUp size={14}/>, label: "Trending posts this week" },
  { icon: <Users size={14}/>, label: "Top contributing members" },
  { icon: <MessageSquare size={14}/>, label: "Unanswered questions" },
  { icon: <Calendar size={14}/>, label: "Upcoming events digest" },
  { icon: <Zap size={14}/>, label: "Draft a community update post" },
];

export function AISummaryDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [range, setRange] = useState<Range>("7d");
  const [loading, setLoading] = useState(false);
  const [shownRange, setShownRange] = useState<Range>("7d");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const t = setTimeout(() => { setShownRange(range); setLoading(false); }, 900);
    return () => clearTimeout(t);
  }, [range, open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;
  const data = SUMMARIES[shownRange];

  return createPortal(
    <>

      <div className="ai-drawer-scrim" onClick={onClose} />
      <aside className="ai-drawer" role="dialog" aria-label="AI community summary">
        <header className="ai-drawer-head">
          <div className="ai-drawer-title">
            <span className="ai-drawer-spark"><Sparkles size={16}/></span>
            <div>
              <div className="ai-drawer-h1">AIVA Summary</div>
              <div className="ai-drawer-h2">Catch Up On Your Community</div>
            </div>
          </div>
          <button className="ai-drawer-x" onClick={onClose} aria-label="Close"><X size={16}/></button>
        </header>

        <div className="ai-drawer-body">
          <div className="ai-section-label"><Clock size={12}/> Summarize Period</div>
          <div className="ai-range-grid">
            {RANGES.map(r => (
              <button
                key={r.id}
                className={`ai-range-chip ${range === r.id ? "on" : ""}`}
                onClick={() => setRange(r.id)}
              >{r.label}</button>
            ))}
          </div>

          <div className="ai-summary-card">
            {loading ? (
              <div className="ai-summary-loading">
                <div className="ai-spark-orbit"><Sparkles size={18}/></div>
                <div className="ai-shimmer-lines">
                  <span style={{width:"92%"}}/>
                  <span style={{width:"78%"}}/>
                  <span style={{width:"85%"}}/>
                  <span style={{width:"60%"}}/>
                </div>
                <div className="ai-loading-label">Reading {RANGES.find(r=>r.id===range)?.label.toLowerCase()} of activity…</div>
              </div>
            ) : (
              <div className="ai-summary-content">
                <p className="ai-summary-headline">{data.headline}</p>
                <ul className="ai-summary-bullets">
                  {data.bullets.map((b, i) => (
                    <li key={i} style={{animationDelay:`${i*80}ms`}} dangerouslySetInnerHTML={{__html: b.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}}/>
                  ))}
                </ul>
                <div className="ai-stats-grid">
                  {data.stats.map(s => (
                    <div key={s.label} className="ai-stat">
                      <div className="ai-stat-v">{s.value}</div>
                      <div className="ai-stat-l">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="ai-section-label"><Zap size={12}/> Quick Actions</div>
          <div className="ai-quick-list">
            {QUICK.map(q => (
              <button key={q.label} className="ai-quick-item">
                <span className="ai-quick-i">{q.icon}</span>
                <span>{q.label}</span>
              </button>
            ))}
          </div>

          <div className="ai-section-label"><Download size={12}/> Recent Uploads</div>
          <div className="ai-upload-list">
            {RECENT_UPLOADS.map(u => (
              <button key={u.title} className="ai-upload-item">
                <span className="ai-upload-i">{u.icon}</span>
                <div className="ai-upload-meta">
                  <div className="ai-upload-t">{u.title}</div>
                  <div className="ai-upload-s">{u.by} · {u.time}</div>
                </div>
                <span className="ai-upload-type">{u.type}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
