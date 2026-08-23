import {
  Heart, MessageCircle, Play, Calendar, Users, Trophy, Flame, BookOpen, FileText,
  Download, Link2, CheckCircle2, Clock, Star, ArrowRight, ImageIcon, HelpCircle, Video,
  UserCheck, ShoppingBag, CreditCard,
} from "lucide-react";
import type { Block } from "@/lib/customize/types";
import { SEED_POSTS } from "@/lib/feed-posts";
import { LB_MEMBERS } from "@/lib/leaderboard-data";
import type { EventItem } from "@/lib/events-store";
import type { GSStore } from "@/lib/gs-store";

export type PreviewData = {
  gs: GSStore;
  events: EventItem[];
};

const str = (b: Block, k: string, d = "") => String(b.props[k] ?? d);
const num = (b: Block, k: string, d = 3) => Number(b.props[k] ?? d);
const bool = (b: Block, k: string, d = true) => b.props[k] === undefined ? d : Boolean(b.props[k]);

function Section({ title, action, children }: { title?: string; action?: string; children: React.ReactNode }) {
  return (
    <section className="cz-sec">
      {title ? (
        <header className="cz-sec-head">
          <h3>{title}</h3>
          {action ? <span className="cz-sec-act">{action} <ArrowRight size={12} /></span> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

const SPACES = [
  { name: "General", icon: MessageCircle, count: 128 },
  { name: "Wins", icon: Trophy, count: 64 },
  { name: "Deal Reviews", icon: FileText, count: 41 },
  { name: "Accountability", icon: Flame, count: 33 },
  { name: "Ask The Coach", icon: HelpCircle, count: 27 },
  { name: "Resources", icon: Download, count: 19 },
  { name: "Introductions", icon: Users, count: 88 },
  { name: "Off Topic", icon: MessageCircle, count: 12 },
];

const COURSES = [
  { title: "Wholesaling Fundamentals", sub: "8 Lessons · 2h 45m", pct: 68 },
  { title: "Creative Financing Masterclass", sub: "12 Lessons · 3h 20m", pct: 54 },
  { title: "Building Your Buyers List", sub: "6 Lessons · 1h 10m", pct: 0 },
  { title: "Deal Analysis Deep Dive", sub: "9 Lessons · 2h 05m", pct: 22 },
  { title: "Scaling To 10 Deals", sub: "7 Lessons · 1h 48m", pct: 0 },
  { title: "Investor Mindset", sub: "5 Lessons · 55m", pct: 100 },
];

const RESOURCES = [
  { label: "Deal Analyzer Spreadsheet", kind: "XLSX", icon: FileText },
  { label: "Cold Call Script Pack", kind: "PDF", icon: FileText },
  { label: "Contract Templates", kind: "ZIP", icon: Download },
  { label: "Skip Tracing Vendor List", kind: "LINK", icon: Link2 },
  { label: "Buyer Outreach Emails", kind: "PDF", icon: FileText },
  { label: "Weekly Planning Board", kind: "LINK", icon: Link2 },
  { label: "Objection Handling Guide", kind: "PDF", icon: FileText },
  { label: "KPI Tracker", kind: "XLSX", icon: FileText },
];

const TESTIMONIALS = [
  { name: "Sarah K.", body: "Closed my third deal in 60 days using the framework from week two.", photo: "https://randomuser.me/api/portraits/women/44.jpg" },
  { name: "Devon R.", body: "The weekly accountability call is the only reason I stayed consistent.", photo: "https://randomuser.me/api/portraits/men/52.jpg" },
  { name: "Priya N.", body: "Raised $1.4M in nine days from people I met inside this Club.", photo: "https://randomuser.me/api/portraits/women/68.jpg" },
  { name: "Greg D.", body: "Worth it for the deal reviews alone. My underwriting got twice as fast.", photo: "https://randomuser.me/api/portraits/men/22.jpg" },
  { name: "Maya P.", body: "Went from zero to a full pipeline in one quarter.", photo: "https://randomuser.me/api/portraits/women/32.jpg" },
  { name: "Jonas W.", body: "The templates saved me weeks of work in the first month.", photo: "https://randomuser.me/api/portraits/men/41.jpg" },
];

const PRODUCTS = [
  { name: "Deal Analyzer Pro", price: "$79", sub: "One-Time" },
  { name: "Cold Call Script Vault", price: "$39", sub: "One-Time" },
  { name: "90-Day Accountability Planner", price: "$29", sub: "One-Time" },
  { name: "Investor Pitch Kit", price: "$59", sub: "One-Time" },
  { name: "Underwriting Bootcamp", price: "$149", sub: "One-Time" },
  { name: "Private Deal Review", price: "$249", sub: "Per Session" },
];

const CHALLENGES = [
  { name: "30-Day Outreach Sprint", day: 12, total: 30, joined: 84 },
  { name: "7-Day Content Streak", day: 3, total: 7, joined: 51 },
  { name: "14-Day Follow-Up Challenge", day: 9, total: 14, joined: 37 },
  { name: "Deal-A-Week Push", day: 2, total: 4, joined: 22 },
];

function fmtDate(iso: string) {
  const [, m, d] = iso.split("-").map(Number);
  const MO = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return { mo: MO[(m || 1) - 1], d: String(d || 1) };
}

export function BlockPreview({ block, data }: { block: Block; data: PreviewData }) {
  const { gs, events } = data;
  const t = str(block, "title");

  switch (block.type) {
    /* ---------------- CONTENT ---------------- */
    case "hero": {
      const center = str(block, "align", "left") === "center";
      return (
        <section className={`cz-hero${center ? " is-center" : ""}`}>
          {bool(block, "showCover") ? <div className="cz-hero-cover" /> : null}
          <div className="cz-hero-in">
            <h2>{t || gs.clubName}</h2>
            <p>{str(block, "subtitle")}</p>
            {str(block, "ctaLabel") ? <span className="cz-btn">{str(block, "ctaLabel")}</span> : null}
          </div>
        </section>
      );
    }
    case "text":
      return <Section title={t}><p className="cz-copy">{str(block, "body")}</p></Section>;
    case "rich-text":
      return (
        <Section title={t}>
          <ul className="cz-bullets">
            {str(block, "body").split("\n").filter(Boolean).map((l, i) => (
              <li key={i}><CheckCircle2 size={14} /> {l}</li>
            ))}
          </ul>
        </Section>
      );
    case "image": {
      const url = str(block, "url");
      return (
        <Section>
          <div className={`cz-img ${str(block, "ratio", "wide")}`}>
            {url ? <img src={url} alt={str(block, "caption") || "Club image"} /> : <div className="cz-img-ph"><ImageIcon size={22} /> Image</div>}
          </div>
          {str(block, "caption") ? <div className="cz-cap">{str(block, "caption")}</div> : null}
        </Section>
      );
    }
    case "video":
      return (
        <Section title={t}>
          <div className="cz-video">
            <span className="cz-video-play"><Play size={18} /></span>
            <span className="cz-video-lab"><Video size={12} /> {str(block, "caption") || "Video"}</span>
          </div>
        </Section>
      );
    case "cta":
      return (
        <section className={`cz-cta ${str(block, "style", "solid")}`}>
          <div>
            <strong>{t}</strong>
            <span>{str(block, "body")}</span>
          </div>
          <span className="cz-btn">{str(block, "ctaLabel")}</span>
        </section>
      );
    case "faq":
      return (
        <Section title={t}>
          <div className="cz-faq">
            {str(block, "items").split("\n").filter(Boolean).map((line, i) => {
              const [q, a] = line.split("|");
              return (
                <div className="cz-faq-row" key={i}>
                  <div className="cz-faq-q"><HelpCircle size={14} /> {q?.trim()}</div>
                  {a ? <div className="cz-faq-a">{a.trim()}</div> : null}
                </div>
              );
            })}
          </div>
        </Section>
      );
    case "quick-links":
      return (
        <Section title={t}>
          <div className="cz-links">
            {str(block, "items").split("\n").filter(Boolean).map((line, i) => (
              <span className="cz-link" key={i}><Link2 size={13} /> {line.split("|")[0]?.trim()}</span>
            ))}
          </div>
        </Section>
      );

    /* ---------------- COMMUNITY ---------------- */
    case "feed": {
      const posts = SEED_POSTS.slice(0, Math.max(1, num(block, "limit", 3)));
      return (
        <Section title={t}>
          {bool(block, "showComposer") ? (
            <div className="cz-composer">
              <span className="cz-av" style={{ background: gs.coverColor }}>{(gs.clubName || "Y").slice(0, 1)}</span>
              <span className="cz-composer-ph">Start A Post…</span>
              <span className="cz-btn sm">Publish</span>
            </div>
          ) : null}
          {bool(block, "showTabs") ? (
            <div className="cz-tabs">{["All", "General", "Wins", "Updates"].map((x, i) => <span key={x} className={i === 0 ? "on" : ""}>{x}</span>)}</div>
          ) : null}
          <div className="cz-posts">
            {posts.map(p => (
              <article className={`cz-post${p.pinned ? " pinned" : ""}`} key={p.id}>
                <header>
                  <img src={p.photo} alt="" />
                  <div><strong>{p.author}</strong><span>{p.time}</span></div>
                </header>
                <h4>{p.title}</h4>
                <p>{p.body.replace(/\*\*/g, "").slice(0, 140)}…</p>
                <footer><span><Heart size={13} /> {p.likes}</span><span><MessageCircle size={13} /> {p.comments}</span></footer>
              </article>
            ))}
          </div>
        </Section>
      );
    }
    case "featured-posts": {
      const posts = SEED_POSTS.slice(0, Math.max(1, num(block, "limit", 2)));
      return (
        <Section title={t} action="View All">
          <div className="cz-grid2">
            {posts.map(p => (
              <div className="cz-feat" key={p.id}>
                <span className="cz-pin">Featured</span>
                <h4>{p.title}</h4>
                <div className="cz-feat-by"><img src={p.photo} alt="" /> {p.author}</div>
              </div>
            ))}
          </div>
        </Section>
      );
    }
    case "spaces":
      return (
        <Section title={t} action="Browse">
          <div className="cz-grid2">
            {SPACES.slice(0, Math.max(1, num(block, "limit", 4))).map(s => (
              <div className="cz-tile" key={s.name}>
                <span className="cz-ico community"><s.icon size={15} /></span>
                <div><strong>{s.name}</strong><span>{s.count} Posts</span></div>
              </div>
            ))}
          </div>
        </Section>
      );
    case "members":
      return (
        <Section title={t} action="See All">
          <div className="cz-members">
            <div className="cz-avs">
              {LB_MEMBERS.slice(0, 8).map(m => <img key={m.id} src={m.photo} alt="" />)}
            </div>
            {bool(block, "showCount") ? (
              <div className="cz-stats">
                <div><strong>3,541</strong><span>Members</span></div>
                <div><strong>221</strong><span>Online</span></div>
                <div><strong>3</strong><span>Admins</span></div>
              </div>
            ) : null}
          </div>
        </Section>
      );
    case "leaderboard":
      return (
        <Section title={t} action="Full Board">
          <div className="cz-lb">
            {LB_MEMBERS.slice(0, Math.max(1, num(block, "limit", 5))).map((m, i) => (
              <div className="cz-lb-row" key={m.id}>
                <span className="cz-rank">{i + 1}</span>
                <img src={m.photo} alt="" />
                <strong>{m.name}</strong>
                <span className="cz-pts">{m.points}</span>
              </div>
            ))}
          </div>
        </Section>
      );
    case "events": {
      const list = events.slice(0, Math.max(1, num(block, "limit", 3)));
      return (
        <Section title={t} action="Calendar">
          <div className="cz-events">
            {(list.length ? list : []).map(e => {
              const d = fmtDate(e.date);
              return (
                <div className="cz-event" key={e.id}>
                  <span className="cz-date"><b>{d.d}</b><i>{d.mo}</i></span>
                  <div><strong>{e.title}</strong><span>{e.start} – {e.end}</span></div>
                  <span className="cz-btn xs">RSVP</span>
                </div>
              );
            })}
            {!list.length ? <div className="cz-empty"><Calendar size={16} /> No Events Scheduled Yet</div> : null}
          </div>
        </Section>
      );
    }
    case "challenges":
      return (
        <Section title={t} action="All Challenges">
          <div className="cz-grid2">
            {CHALLENGES.slice(0, Math.max(1, num(block, "limit", 2))).map(c => (
              <div className="cz-tile" key={c.name}>
                <span className="cz-ico community"><Flame size={15} /></span>
                <div><strong>{c.name}</strong><span>Day {c.day} Of {c.total} · {c.joined} Joined</span></div>
              </div>
            ))}
          </div>
        </Section>
      );

    /* ---------------- LEARNING ---------------- */
    case "courses": {
      const list = COURSES.slice(0, Math.max(1, num(block, "limit", 3)));
      const isList = str(block, "layout", "grid") === "list";
      return (
        <Section title={t} action="All Courses">
          <div className={isList ? "cz-course-list" : "cz-grid3"}>
            {list.map(c => (
              <div className={isList ? "cz-course-row" : "cz-course"} key={c.title}>
                <div className="cz-course-thumb"><BookOpen size={16} /></div>
                <div className="cz-course-in">
                  <strong>{c.title}</strong>
                  <span>{c.sub}</span>
                  <div className="cz-bar"><i style={{ width: `${c.pct}%` }} /></div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      );
    }
    case "programs":
      return (
        <Section title={t} action="Details">
          <div className="cz-grid2">
            {[{ n: "1:1 Coaching", s: "2 Sessions / Month" }, { n: "Group Mastermind", s: "Weekly Call · 12 Seats" }, { n: "Accelerator Cohort", s: "8 Weeks · Starts Monday" }, { n: "Alumni Circle", s: "Monthly Deep Dive" }]
              .slice(0, Math.max(1, num(block, "limit", 2))).map(p => (
                <div className="cz-tile" key={p.n}>
                  <span className="cz-ico learning"><UserCheck size={15} /></span>
                  <div><strong>{p.n}</strong><span>{p.s}</span></div>
                </div>
              ))}
          </div>
        </Section>
      );
    case "resources":
      return (
        <Section title={t} action="Library">
          <div className="cz-res">
            {RESOURCES.slice(0, Math.max(1, num(block, "limit", 4))).map(r => (
              <div className="cz-res-row" key={r.label}>
                <span className="cz-ico learning"><r.icon size={14} /></span>
                <strong>{r.label}</strong>
                <span className="cz-kind">{r.kind}</span>
              </div>
            ))}
          </div>
        </Section>
      );
    case "progress":
      return (
        <Section title={t}>
          <div className="cz-progress">
            <div className="cz-progress-top">
              <div><strong>4 Of 10 Lessons Complete</strong><span>Estimated Time Left · 1h 40m</span></div>
              {bool(block, "showStreak") ? <span className="cz-streak"><Flame size={13} /> 12-Day Streak</span> : null}
            </div>
            <div className="cz-bar lg"><i style={{ width: "40%" }} /></div>
            <div className="cz-progress-foot"><span><Clock size={12} /> Next: Deal Analysis</span><span><Trophy size={12} /> Level 6</span></div>
          </div>
        </Section>
      );
    case "upcoming-sessions":
      return (
        <Section title={t} action="Reschedule">
          <div className="cz-events">
            {[{ n: "1:1 Strategy Call", w: "Tue · 12:00 PM ET" }, { n: "Group Coaching", w: "Thu · 5:00 PM ET" }, { n: "Deal Review Clinic", w: "Fri · 11:00 AM ET" }]
              .slice(0, Math.max(1, num(block, "limit", 2))).map(s => (
                <div className="cz-event" key={s.n}>
                  <span className="cz-ico learning"><Calendar size={15} /></span>
                  <div><strong>{s.n}</strong><span>{s.w}</span></div>
                  <span className="cz-btn xs">Join</span>
                </div>
              ))}
          </div>
        </Section>
      );

    /* ---------------- BUSINESS ---------------- */
    case "offer":
      return (
        <section className="cz-offer">
          <div>
            <span className="cz-eyebrow"><Star size={11} /> Offer</span>
            <h3>{t}</h3>
            <p>{str(block, "body")}</p>
          </div>
          <span className="cz-btn">{str(block, "ctaLabel")}</span>
        </section>
      );
    case "pricing":
      return (
        <Section title={t}>
          <div className="cz-grid2">
            <div className="cz-price">
              <strong>{gs.membership?.freeLabel || "Free Member"}</strong>
              <em>$0</em>
              <ul><li><CheckCircle2 size={12} /> Community Access</li><li><CheckCircle2 size={12} /> Weekly Digest</li></ul>
              <span className="cz-btn soft">Join Free</span>
            </div>
            <div className="cz-price is-featured">
              <strong>{gs.membership?.paidLabel || "Pro"}</strong>
              <em>${gs.membership?.paidPrice ?? 49}<i>/mo</i></em>
              <ul><li><CheckCircle2 size={12} /> All Courses</li><li><CheckCircle2 size={12} /> Live Coaching</li><li><CheckCircle2 size={12} /> Private Spaces</li></ul>
              <span className="cz-btn">Upgrade</span>
            </div>
          </div>
          {str(block, "note") ? <div className="cz-cap">{str(block, "note")}</div> : null}
        </Section>
      );
    case "testimonials":
      return (
        <Section title={t}>
          <div className="cz-grid3">
            {TESTIMONIALS.slice(0, Math.max(1, num(block, "limit", 3))).map(x => (
              <div className="cz-quote" key={x.name}>
                <p>“{x.body}”</p>
                <div><img src={x.photo} alt="" /> {x.name}</div>
              </div>
            ))}
          </div>
        </Section>
      );
    case "booking":
      return (
        <section className="cz-cta soft">
          <div><strong>{t}</strong><span>{str(block, "body")}</span></div>
          <span className="cz-btn">{str(block, "ctaLabel")}</span>
        </section>
      );
    case "products":
      return (
        <Section title={t} action="Store">
          <div className="cz-grid3">
            {PRODUCTS.slice(0, Math.max(1, num(block, "limit", 3))).map(p => (
              <div className="cz-product" key={p.name}>
                <span className="cz-ico business"><ShoppingBag size={15} /></span>
                <strong>{p.name}</strong>
                <span className="cz-price-line"><CreditCard size={12} /> {p.price} · {p.sub}</span>
              </div>
            ))}
          </div>
        </Section>
      );
    default:
      return null;
  }
}
