import {
  ArrowRight, CheckCircle2, Play, Calendar, MessageCircle, Heart, Star,
  Clock, ShieldCheck, CreditCard, BookOpen, Users, Sparkles, Code2, Link2,
} from "lucide-react";
import type { SellBlock, SellTheme } from "@/lib/sell/types";
import { SEED_POSTS } from "@/lib/feed-posts";
import type { EventItem } from "@/lib/events-store";
import type { GSStore } from "@/lib/gs-store";

export type SellData = { gs: GSStore; events: EventItem[] };

const FONT_STACK: Record<string, string> = {
  system: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  grotesk: '"Space Grotesk", "Inter", ui-sans-serif, system-ui, sans-serif',
  serif: '"Instrument Serif", Georgia, "Times New Roman", serif',
  mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
};
const BG: Record<string, { page: string; surface: string; ink: string; line: string }> = {
  light: { page: "#FFFFFF", surface: "#FFFFFF", ink: "#111827", line: "#E8EAEE" },
  soft: { page: "#F7F8FA", surface: "#FFFFFF", ink: "#111827", line: "#E8EAEE" },
  warm: { page: "#FBF8F3", surface: "#FFFFFF", ink: "#1B1710", line: "#EDE4D6" },
  dark: { page: "#101216", surface: "#171A20", ink: "#F4F5F7", line: "#262A33" },
};
const RADIUS_BTN: Record<string, string> = { rounded: "10px", pill: "999px", square: "4px" };
const PAD: Record<string, string> = { comfortable: "22px", compact: "15px", spacious: "32px" };

export function sellStyle(theme: SellTheme): React.CSSProperties {
  const bg = BG[theme.background] ?? BG.light;
  return {
    ["--cz-brand" as string]: theme.brand,
    ["--cz-page" as string]: bg.page,
    ["--cz-surface" as string]: bg.surface,
    ["--cz-ink" as string]: bg.ink,
    ["--cz-line" as string]: bg.line,
    ["--cz-radius" as string]: `${theme.radius}px`,
    ["--cz-btn-radius" as string]: RADIUS_BTN[theme.buttonStyle] ?? "10px",
    ["--cz-pad" as string]: PAD[theme.density] ?? "22px",
    fontFamily: FONT_STACK[theme.font] ?? FONT_STACK.system,
  };
}

const str = (b: SellBlock, k: string, d = "") => String(b.props[k] ?? d);
const num = (b: SellBlock, k: string, d = 3) => Number(b.props[k] ?? d);
const bool = (b: SellBlock, k: string, d = true) => (b.props[k] === undefined ? d : Boolean(b.props[k]));
const lines = (b: SellBlock, k: string) => str(b, k).split("\n").map(s => s.trim()).filter(Boolean);
const pair = (l: string): [string, string] => {
  const i = l.indexOf("|");
  return i < 0 ? [l.trim(), ""] : [l.slice(0, i).trim(), l.slice(i + 1).trim()];
};

const TESTIMONIALS = [
  { name: "Sarah K.", body: "Closed my third deal in 60 days using the framework from week two.", photo: "https://randomuser.me/api/portraits/women/44.jpg" },
  { name: "Devon R.", body: "The weekly accountability call is the only reason I stayed consistent.", photo: "https://randomuser.me/api/portraits/men/52.jpg" },
  { name: "Priya N.", body: "Raised $1.4M in nine days from people I met inside this Club.", photo: "https://randomuser.me/api/portraits/women/68.jpg" },
  { name: "Greg D.", body: "Worth it for the deal reviews alone. My underwriting got twice as fast.", photo: "https://randomuser.me/api/portraits/men/22.jpg" },
  { name: "Maya P.", body: "Went from zero to a full pipeline in one quarter.", photo: "https://randomuser.me/api/portraits/women/32.jpg" },
  { name: "Jonas W.", body: "The templates saved me weeks of work in the first month.", photo: "https://randomuser.me/api/portraits/men/41.jpg" },
];

const COURSES = [
  { title: "Wholesaling Fundamentals", sub: "8 Lessons · 2h 45m" },
  { title: "Creative Financing Masterclass", sub: "12 Lessons · 3h 20m" },
  { title: "Building Your Buyers List", sub: "6 Lessons · 1h 10m" },
  { title: "Deal Analysis Deep Dive", sub: "9 Lessons · 2h 05m" },
  { title: "Scaling To 10 Deals", sub: "7 Lessons · 1h 48m" },
  { title: "Investor Mindset", sub: "5 Lessons · 55m" },
];

function Sec({ title, children, tone }: { title?: string; children: React.ReactNode; tone?: string }) {
  return (
    <section className={`sp-sec${tone ? ` ${tone}` : ""}`}>
      {title ? <h3 className="sp-h">{title}</h3> : null}
      {children}
    </section>
  );
}

export function SellBlockView({ block, data }: { block: SellBlock; data: SellData }) {
  const { gs, events } = data;
  const t = str(block, "title");

  switch (block.type) {
    case "hero":
      return (
        <section className={`sp-hero${str(block, "align", "left") === "center" ? " is-center" : ""}`}>
          <div className="sp-hero-copy">
            {str(block, "eyebrow") ? <span className="sp-eyebrow"><Sparkles size={11} /> {str(block, "eyebrow")}</span> : null}
            <h1>{t || gs.clubName}</h1>
            <p>{str(block, "sub")}</p>
            <div className="sp-hero-cta">
              <span className="cz-btn">{str(block, "ctaLabel", "Join")}</span>
              <span className="sp-tiny"><ShieldCheck size={12} /> Cancel Anytime</span>
            </div>
          </div>
          {str(block, "imageUrl")
            ? <img className="sp-hero-img" src={str(block, "imageUrl")} alt="" />
            : <div className="sp-hero-img sp-ph"><Play size={22} /></div>}
        </section>
      );

    case "about":
    case "text":
    case "coaching":
      return (
        <Sec title={t}>
          <p className="sp-body">{str(block, "body")}</p>
        </Sec>
      );

    case "learn":
    case "benefits":
      return (
        <Sec title={t}>
          <ul className="sp-checks">
            {lines(block, "items").map((l, i) => <li key={i}><CheckCircle2 size={15} /> {l}</li>)}
          </ul>
        </Sec>
      );

    case "included":
    case "features":
      return (
        <Sec title={t}>
          <div className="sp-grid2">
            {lines(block, "items").map((l, i) => {
              const [a, b] = pair(l);
              return <div className="sp-tile" key={i}><strong>{a}</strong>{b ? <span>{b}</span> : null}</div>;
            })}
          </div>
        </Sec>
      );

    case "curriculum":
      return (
        <Sec title={t}>
          <ol className="sp-curric">
            {lines(block, "items").map((l, i) => {
              const [a, b] = pair(l);
              return <li key={i}><em>{String(i + 1).padStart(2, "0")}</em><div><strong>{a}</strong>{b ? <span>{b}</span> : null}</div></li>;
            })}
          </ol>
        </Sec>
      );

    case "image":
      return (
        <Sec>
          {str(block, "imageUrl")
            ? <img className="sp-img" src={str(block, "imageUrl")} alt={str(block, "caption")} />
            : <div className="sp-img sp-ph"><Play size={20} /></div>}
          {str(block, "caption") ? <div className="sp-cap">{str(block, "caption")}</div> : null}
        </Sec>
      );

    case "video":
      return (
        <Sec title={t}>
          <div className="sp-video"><span className="sp-play"><Play size={20} /></span></div>
          {str(block, "caption") ? <div className="sp-cap">{str(block, "caption")}</div> : null}
        </Sec>
      );

    case "creator":
    case "coach-bio": {
      const name = str(block, "name") || gs.clubName || "Your Coach";
      const photo = str(block, "photoUrl") || gs.headshotUrl;
      return (
        <Sec title={t}>
          <div className="sp-coach">
            {photo ? <img src={photo} alt="" /> : <span className="sp-coach-ph">{name.slice(0, 1)}</span>}
            <div>
              <strong>{name}</strong>
              <em>{str(block, "role")}</em>
              <p>{str(block, "body")}</p>
              {lines(block, "stats").length ? (
                <div className="sp-stats">
                  {lines(block, "stats").map((l, i) => {
                    const [v, lab] = pair(l);
                    return <div key={i}><b>{v}</b><span>{lab}</span></div>;
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </Sec>
      );
    }

    case "testimonials": {
      const items = gs.testimonials?.length
        ? gs.testimonials.map((x, i) => ({ name: x.name, body: x.body, photo: TESTIMONIALS[i % TESTIMONIALS.length].photo }))
        : TESTIMONIALS;
      return (
        <Sec title={t}>
          <div className="sp-grid3">
            {items.slice(0, Math.max(1, num(block, "limit", 3))).map(x => (
              <div className="sp-quote" key={x.name}>
                <div className="sp-stars">{[0, 1, 2, 3, 4].map(i => <Star key={i} size={12} />)}</div>
                <p>“{x.body}”</p>
                <div className="sp-by"><img src={x.photo} alt="" /> {x.name}</div>
              </div>
            ))}
          </div>
        </Sec>
      );
    }

    case "countdown":
      return (
        <section className="sp-count">
          <div><strong>{t}</strong><span>{str(block, "sub")}</span></div>
          <div className="sp-clock">
            {[["Days", num(block, "days", 5)], ["Hours", 11], ["Mins", 42]].map(([lab, v]) => (
              <div key={String(lab)}><b>{String(v).padStart(2, "0")}</b><span>{lab}</span></div>
            ))}
          </div>
        </section>
      );

    case "community-preview":
      return (
        <Sec title={t}>
          <div className="sp-posts">
            {SEED_POSTS.slice(0, Math.max(1, num(block, "limit", 2))).map((p, i) => (
              <div className="sp-post" key={i}>
                <div className="sp-post-top">
                  {p.photo ? <img src={p.photo} alt="" /> : <span className="sp-av">{p.initials || (p.author || "M").slice(0, 1)}</span>}
                  <strong>{p.author}</strong><span>{p.time ?? "2h"}</span>
                </div>
                <p>{(p.body || "").slice(0, 180)}</p>
                <div className="sp-post-meta"><Heart size={12} /> {p.likes ?? 12} <MessageCircle size={12} /> {p.comments ?? 4}</div>
              </div>
            ))}
          </div>
          <div className="sp-blur">Join To See The Full Conversation</div>
        </Sec>
      );

    case "courses":
    case "course-preview":
      return (
        <Sec title={t}>
          <div className="sp-grid3">
            {COURSES.slice(0, Math.max(1, num(block, "limit", 3))).map(c => (
              <div className="sp-course" key={c.title}>
                <span className="sp-course-ico"><BookOpen size={16} /></span>
                <strong>{c.title}</strong><span>{c.sub}</span>
              </div>
            ))}
          </div>
        </Sec>
      );

    case "events":
      return (
        <Sec title={t}>
          <div className="sp-list">
            {(events.length ? events : [{ id: "1", title: "Weekly Coaching Call", date: "Tuesday · 12:00pm ET" } as unknown as EventItem])
              .slice(0, Math.max(1, num(block, "limit", 3)))
              .map((e, i) => (
                <div className="sp-row" key={e.id ?? i}>
                  <span className="sp-row-ico"><Calendar size={15} /></span>
                  <div><strong>{e.title}</strong><span>{(e as { date?: string; when?: string }).date ?? (e as { when?: string }).when ?? "Upcoming"}</span></div>
                  <span className="cz-btn xs">Save Seat</span>
                </div>
              ))}
          </div>
        </Sec>
      );

    case "pricing": {
      const usePlans = bool(block, "usePlans", true);
      return (
        <Sec title={t}>
          {usePlans ? (
            <div className="sp-grid2">
              <div className="sp-price">
                <strong>{gs.membership?.freeLabel || "Free Member"}</strong>
                <em>$0</em>
                <ul><li><CheckCircle2 size={12} /> Community Access</li><li><CheckCircle2 size={12} /> Weekly Digest</li></ul>
                <span className="cz-btn soft">Join Free</span>
              </div>
              <div className="sp-price is-featured">
                <strong>{gs.membership?.paidLabel || "Pro"}</strong>
                <em>${gs.membership?.paidPrice ?? 49}<i>/mo</i></em>
                <ul><li><CheckCircle2 size={12} /> All Courses</li><li><CheckCircle2 size={12} /> Live Coaching</li><li><CheckCircle2 size={12} /> Private Spaces</li></ul>
                <span className="cz-btn">Join Now</span>
              </div>
            </div>
          ) : (
            <div className="sp-price is-featured solo">
              <strong>{str(block, "planName")}</strong>
              <em>{str(block, "planPrice")}</em>
              <ul>{lines(block, "planItems").map((l, i) => <li key={i}><CheckCircle2 size={12} /> {l}</li>)}</ul>
              <span className="cz-btn">Enroll Now</span>
            </div>
          )}
          {str(block, "note") ? <div className="sp-cap">{str(block, "note")}</div> : null}
        </Sec>
      );
    }

    case "checkout":
      return (
        <section className="sp-checkout" id="checkout">
          <div className="sp-checkout-sum">
            <span className="sp-eyebrow"><CreditCard size={11} /> {t || "Checkout"}</span>
            <strong>{str(block, "productName")}</strong>
            <em>{str(block, "price")}<i>{str(block, "billing") === "monthly" ? "/mo" : str(block, "billing") === "annual" ? "/yr" : ""}</i></em>
            <span className="sp-tiny"><ShieldCheck size={12} /> {str(block, "guarantee")}</span>
          </div>
          <div className="sp-checkout-form">
            {["Email", "Card Number", "Name On Card"].map(f => (
              <div className="sp-input" key={f}><span>{f}</span><i /></div>
            ))}
            <span className="cz-btn full">{str(block, "ctaLabel", "Complete Order")}</span>
          </div>
        </section>
      );

    case "form":
      return (
        <Sec title={t}>
          <p className="sp-body">{str(block, "sub")}</p>
          <div className="sp-form">
            {lines(block, "fields").map((f, i) => <div className="sp-input" key={i}><span>{f}</span><i /></div>)}
            <span className="cz-btn full">{str(block, "ctaLabel", "Submit")}</span>
          </div>
        </Sec>
      );

    case "booking":
      return (
        <section className="sp-cta soft">
          <div><strong>{t}</strong><span>{str(block, "sub")}</span></div>
          <span className="cz-btn"><Clock size={13} /> {str(block, "ctaLabel", "See Availability")}</span>
        </section>
      );

    case "faq":
      return (
        <Sec title={t}>
          <div className="sp-faq">
            {lines(block, "items").map((l, i) => {
              const [q, a] = pair(l);
              return <div key={i}><strong>{q}</strong><p>{a}</p></div>;
            })}
          </div>
        </Sec>
      );

    case "cta":
    case "join-cta":
      return (
        <section className="sp-cta">
          <div><strong>{t}</strong><span>{str(block, "sub")}</span></div>
          <span className="cz-btn">{str(block, "ctaLabel", "Join")} <ArrowRight size={14} /></span>
        </section>
      );

    case "embed":
      return (
        <Sec title={t}>
          <div className="sp-embed" style={{ height: Math.max(160, num(block, "height", 320)) }}>
            <Code2 size={18} />
            <strong>{str(block, "provider") || "Custom Embed"}</strong>
            {str(block, "url") ? <span><Link2 size={11} /> {str(block, "url")}</span> : <span>Add An Embed URL In The Inspector</span>}
          </div>
        </Sec>
      );

    default:
      return null;
  }
}

export function SellMembersStrip({ gs }: { gs: GSStore }) {
  return <div className="sp-strip"><Users size={13} /> {gs.clubName || "Your Club"} · Members Online Now</div>;
}
