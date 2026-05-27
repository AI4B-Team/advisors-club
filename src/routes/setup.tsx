import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Sparkles, ArrowRight, Globe, BookOpen, Users, CreditCard,
  Brain, Video, Trophy, Mail, Zap, Check, Plus, Home as HomeIcon,
  MessageSquare, Calendar, BarChart3, Settings, Bell, Star
} from "lucide-react";

export const Route = createFileRoute("/setup")({
  component: SetupPage,
  head: () => ({
    meta: [
      { title: "AdvisorsClub — Build Your Club In 60 Seconds" },
      { name: "description", content: "AIVA, your AI agent, builds your entire Club setup in under a minute. Watch it happen live." },
      { name: "robots", content: "noindex,nofollow" },
    ],
    links: [
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap" },
    ],
  }),
});

type Item = { title: string; desc: string; Icon: typeof Globe; bg: string; fg: string };

const BUILD_ITEMS: Item[] = [
  { title: "Branded Club",        desc: "Custom domain & colours",   Icon: Globe,      bg: "#EDE9FE", fg: "#6366F1" },
  { title: "Courses & Curriculum",desc: "AIVA Builds Outline In 60s",Icon: BookOpen,   bg: "#E0F2FE", fg: "#0EA5E9" },
  { title: "Community Feed",      desc: "Posts, Threads, Reactions", Icon: Users,      bg: "#D1FAE5", fg: "#10B981" },
  { title: "Payments & Memberships", desc: "Stripe Connect · Tiers", Icon: CreditCard, bg: "#FEF3C7", fg: "#F59E0B" },
  { title: "AIVA Knowledgebase",  desc: "AI Answers Members 24/7",   Icon: Brain,      bg: "#EDE9FE", fg: "#8B5CF6" },
  { title: "Virtual Events",      desc: "Live Rooms · Replays",      Icon: Video,      bg: "#FCE7F3", fg: "#EC4899" },
  { title: "Gamification Engine", desc: "Points · Levels · Badges",  Icon: Trophy,     bg: "#FEF3C7", fg: "#F59E0B" },
  { title: "Email Marketing",     desc: "Welcome · Broadcasts",      Icon: Mail,       bg: "#E0F2FE", fg: "#0EA5E9" },
  { title: "Affiliate Program",   desc: "Referrals · Commissions",   Icon: Zap,        bg: "#D1FAE5", fg: "#10B981" },
];

function SetupPage() {
  const [checked, setChecked] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (checked < BUILD_ITEMS.length) setChecked(c => c + 1);
      else setReady(true);
    }, checked === 0 ? 500 : 200);
    return () => window.clearTimeout(t);
  }, [checked]);

  return (
    <div className="su-shell">
      {/* Background app preview */}
      <div className="su-bg" aria-hidden="true">
        <aside className="su-bg-sidebar">
          <div className="su-bg-logo">AC</div>
          {[HomeIcon, Users, BookOpen, Calendar, MessageSquare, BarChart3, Settings].map((I, i) => (
            <div key={i} className={`su-bg-nav${i === 0 ? " on" : ""}`}><I size={14}/> <span /></div>
          ))}
        </aside>
        <main className="su-bg-feed">
          <div className="su-bg-feed-hd">
            <div className="su-bg-feed-t" />
            <button className="su-bg-newpost"><Plus size={12}/> New Post</button>
          </div>
          <div className="su-bg-composer"><div /><div /></div>
          {[1,2,3].map(i => (
            <div className="su-bg-post" key={i}>
              <div className="su-bg-post-hd"><span className="su-bg-av" /><div><div /><div /></div></div>
              <div className="su-bg-post-body"><div /><div /><div style={{width:"60%"}}/></div>
              <div className="su-bg-post-ft"><span/><span/><span/></div>
            </div>
          ))}
        </main>
        <aside className="su-bg-right">
          <div className="su-bg-club">
            <div className="su-bg-club-cover" />
            <div className="su-bg-club-body"><div /><div /></div>
          </div>
          <div className="su-bg-lb">
            <div className="su-bg-lb-hd">Leaderboard</div>
            {[1,2,3].map(i => (
              <div className="su-bg-lb-row" key={i}>
                <span className="su-bg-lb-rk">{i}</span><span className="su-bg-av sm" /><div /><span className="su-bg-lb-pts" />
              </div>
            ))}
          </div>
          <div className="su-bg-evt">
            <div className="su-bg-evt-d">FRI</div>
            <div><div /><div /></div>
          </div>
        </aside>
      </div>

      <div className="su-backdrop">
        <div className="su-modal" role="dialog" aria-modal="true">
          <div className="su-modal-hd">
            <div className="su-avatar"><Sparkles size={22} strokeWidth={2.5} /></div>
            <div className="su-hd-text">
              <div className="su-hi">Hey, I'm AIVA <span className="su-wave">👋</span></div>
              <h1 className="su-h1">I'm Building Your Club…</h1>
            </div>
          </div>

          <div className="su-list">
            {BUILD_ITEMS.map((it, i) => {
              const state = i < checked ? "done" : i === checked ? "active" : "";
              const Icon = it.Icon;
              return (
                <div className={`su-item ${state}`} key={it.title}>
                  <div className="su-item-icon" style={{ background: it.bg, color: it.fg }}>
                    <Icon size={14} strokeWidth={2.4} />
                  </div>
                  <div className="su-item-txt">
                    <div className="su-item-t">{it.title}</div>
                    <div className="su-item-d">{it.desc}</div>
                  </div>
                  <div className={`su-item-check ${i < checked ? "on" : ""}`}>
                    {i < checked && <Check size={10} strokeWidth={4} />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="su-foot">
            <div className="su-fine">
              <Star size={11} fill="currentColor" strokeWidth={0} /> Free Forever · No Credit Card
            </div>
            <button
              className={`su-cta ${ready ? "ready" : ""}`}
              disabled={!ready}
              onClick={() => { window.location.href = "/signup"; }}
            >
              {ready ? <>Claim Your Club <ArrowRight size={14} strokeWidth={3}/></> : "Building…"}
            </button>
          </div>
        </div>

        <div className="su-trust">
          <Bell size={11}/> Joined By 14,000+ Advisors This Year
        </div>
      </div>
    </div>
  );
}
