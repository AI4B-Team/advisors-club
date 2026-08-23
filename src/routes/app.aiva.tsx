import { createFileRoute } from "@tanstack/react-router";
import { AM_TABS, AM_CREATE_TABS, AM_CREATE_KEYS, type AmTabKey, type AmPrimaryKey } from "@/components/aiva/tabs";
import { AivaOverview } from "@/components/aiva/AivaOverview";
import { AivaKnowledge } from "@/components/aiva/AivaKnowledge";
import { AivaCatalog } from "@/components/aiva/AivaCatalog";
import { NewProductIntelligence } from "@/components/recos/NewProductIntelligence";
import { OpportunityBoard } from "@/components/aiva/OpportunityBoard";
import { AivaInstructions } from "@/components/aiva/AivaInstructions";
import { AivaMemberAi } from "@/components/aiva/AivaMemberAi";
import { AivaCapabilities } from "@/components/aiva/AivaCapabilities";
import { FlywheelBoard } from "@/components/aiva/FlywheelBoard";
import { AivaActivityFeed } from "@/components/aiva/activity/AivaActivityFeed";
import { useAivaAdmin } from "@/hooks/use-aiva-admin";
import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, RefreshCw, CheckCircle2, Copy, Check, BookOpen, Mail, Flame, Megaphone, MessageSquare, Calendar, Palette, Search, Map, Zap, Mic, Plus } from "lucide-react";

export const Route = createFileRoute("/app/aiva")({
  head: () => ({
    meta: [
      { title: "AIVA — Manage Your Business Intelligence Layer" },
      { name: "description", content: "Configure AIVA's knowledge, instructions, capabilities, and activity — one unified intelligence layer for your Club." },
      { property: "og:title", content: "AIVA — Manage Your Business Intelligence Layer" },
      { property: "og:description", content: "Inspect what AIVA knows, manage knowledge sources, set instructions, and review every action." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AivaArea,
});

type Msg = { id: number; from: "user" | "ai"; text: string; steps?: string[] };

const PROMPTS = [
  { i: <BookOpen size={15}/>, t: "Build me a 6-module course on real estate investing" },
  { i: <Megaphone size={15}/>, t: "Write a sales page for my $497 course" },
  { i: <Mail size={15}/>, t: "Draft a 5-email welcome sequence for new members" },
  { i: <Flame size={15}/>, t: "Create a 30-day challenge with daily tasks" },
  { i: <MessageSquare size={15}/>, t: "Write a Club post announcing my Q&A call" },
  { i: <Calendar size={15}/>, t: "Plan a 2-day virtual summit" },
];

function intent(text: string): { reply: string; steps?: string[] } {
  const q = text.toLowerCase();
  if (q.includes("course") || q.includes("module")) {
    return {
      reply: "Here's a 6-module outline. Each module has 4-6 lessons.",
      steps: [
        "Module 1 — Foundations: market analysis, deal types, terminology (5 lessons)",
        "Module 2 — Finding deals: MLS, off-market, wholesaling, networks (6 lessons)",
        "Module 3 — Underwriting: numbers, ARV, rehab estimates, cash flow (5 lessons)",
        "Module 4 — Financing: conventional, hard money, DSCR, partners (4 lessons)",
        "Module 5 — Acquisition & rehab: contracts, contractors, timelines (5 lessons)",
        "Module 6 — Scaling & exit: portfolios, refinance, 1031s, syndications (6 lessons)",
      ],
    };
  }
  if (q.includes("email") || q.includes("welcome") || q.includes("sequence")) {
    return {
      reply: "Here's a 5-email welcome sequence. Send across 7 days.",
      steps: [
        "Day 0 — Subject: \"You're in. Here's where to start.\" — Goal: orient & set expectation.",
        "Day 1 — Subject: \"The one habit that changes everything.\" — Goal: deliver quick win.",
        "Day 3 — Subject: \"Meet the community.\" — Goal: drive into feed + intro thread.",
        "Day 5 — Subject: \"Your first milestone.\" — Goal: nudge first course module.",
        "Day 7 — Subject: \"Let's talk live.\" — Goal: RSVP for weekly Q&A call.",
      ],
    };
  }
  if (q.includes("challenge")) {
    return {
      reply: "30-day challenge structured into 4 phases with points & prizes.",
      steps: [
        "Phase 1 (days 1-7): Foundations — daily 15-min task, 10 pts/day",
        "Phase 2 (days 8-14): Application — daily build + post in feed, 20 pts/day",
        "Phase 3 (days 15-21): Execution — daily metric tracking, 25 pts/day",
        "Phase 4 (days 22-30): Compounding — weekly hot-seat + reflection, 30 pts/day",
        "Prizes: 1st = 1:1 with you, 2nd = annual plan free, 3rd = signed playbook",
      ],
    };
  }
  if (q.includes("sales page") || q.includes("landing")) {
    return {
      reply: "Full sales page copy outline. Drop into your landing builder.",
      steps: [
        "Headline: \"The exact system I used to go from $0 to $1M in real estate — without quitting my job.\"",
        "Sub: \"6 modules, 31 lessons, weekly live coaching, and a community of 800+ investors actually doing the work.\"",
        "Primary CTA: \"Join for $497 — 14-day refund\"",
        "Social proof: 3 student wins ($12k flip, first rental, $40k syndication).",
        "Pain: \"You don't have time to test every guru's hot take.\"",
        "Promise: \"Skip the noise. Use the playbook that's already working for 800 students.\"",
      ],
    };
  }
  return {
    reply: "I can do a lot inside your Club. Here are 7 things you can ask me:",
    steps: [
      "Build a course outline from a topic",
      "Draft Club posts and announcements",
      "Write welcome / nurture / launch emails",
      "Design challenges with daily tasks & prizes",
      "Write sales pages, headlines, and CTAs",
      "Summarize coaching sessions and call recordings",
      "Reply to member questions in the feed",
    ],
  };
}

const MODES = [
  { k: "create", label: "Create", i: <Palette size={16}/>, color: "#10b981", hint: "Write a Club post about " },
  { k: "research", label: "Research", i: <Search size={16}/>, color: "#3b82f6", hint: "Research the latest trends in " },
  { k: "plan", label: "Plan", i: <Map size={16}/>, color: "#f59e0b", hint: "Plan a 30-day launch for " },
  { k: "automate", label: "Automate", i: <Zap size={16}/>, color: "#ef4444", hint: "Automate onboarding emails for " },
];

function AivaArea() {
  const [tab, setTab] = useState<AmPrimaryKey>("console");
  const [sub, setSub] = useState<AmTabKey>("overview");
  const { admin, update } = useAivaAdmin();

  const go = (key: AmTabKey) => {
    if (AM_CREATE_KEYS.includes(key)) { setTab("create"); setSub(key); }
    else setTab(key as AmPrimaryKey);
  };

  return (
    <>
      <div className="lt-ph">
        <div>
          <h1>AIVA</h1>
          <p>One Intelligence Layer That Knows Your Business, Your Content, And Your Members.</p>
        </div>
      </div>

      <nav className="am-tabs" aria-label="AIVA Sections">
        {AM_TABS.map(t => (
          <button key={t.key} className={`am-tab${tab === t.key ? " on" : ""}`} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </nav>

      {tab === "create" && (
        <nav className="am-tabs" aria-label="Create Sections" style={{marginTop:-6,gap:6}}>
          {AM_CREATE_TABS.map(t => (
            <button key={t.key} className={`am-tab${sub === t.key ? " on" : ""}`} onClick={() => setSub(t.key)}>{t.label}</button>
          ))}
        </nav>
      )}

      {tab === "console" && <AivaConsole />}
      {tab === "opportunities" && <OpportunityBoard />}
      {tab === "flywheel" && <FlywheelBoard />}
      {tab === "activity" && (
        <AivaActivityFeed
          legacy={admin.activity}
          onGoInternal={(view, s) => {
            if (view === "create") { setTab("create"); if (s) setSub(s as AmTabKey); }
            else setTab(view as AmPrimaryKey);
          }}
        />
      )}

      {tab === "create" && sub === "overview" && <AivaOverview admin={admin} update={update} go={go} />}
      {tab === "create" && sub === "knowledge" && <AivaKnowledge admin={admin} update={update} />}
      {tab === "create" && sub === "catalog" && <AivaCatalog />}
      {tab === "create" && sub === "intelligence" && <NewProductIntelligence />}
      {tab === "create" && sub === "instructions" && <AivaInstructions admin={admin} update={update} />}
      {tab === "create" && sub === "member-ai" && <AivaMemberAi />}
      {tab === "create" && sub === "capabilities" && <AivaCapabilities admin={admin} update={update} />}
    </>
  );
}


function AivaConsole() {
  const [input, setInput] = useState("");
  const [hero, setHero] = useState("");
  const [mode, setMode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: 0, from: "ai", text: "Hey Zaddy — I'm AIVA. Ask me to build a course, write emails, plan a challenge, or anything else for your Club." },
  ]);
  const streamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, loading]);

  function send(text?: string) {
    const value = (text ?? input).trim();
    if (!value || loading) return;
    const userMsg: Msg = { id: Date.now(), from: "user", text: value };
    setMsgs(m => [...m, userMsg]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      const { reply, steps } = intent(value);
      setMsgs(m => [...m, { id: Date.now()+1, from: "ai", text: reply, steps }]);
      setLoading(false);
    }, 900);
  }

  function generateHero() {
    const v = hero.trim();
    if (!v) return;
    send(v);
    setHero("");
    setMode(null);
  }

  function newChat() {
    setMsgs([{ id: 0, from: "ai", text: "New chat. What should we build?" }]);
    setInput("");
  }

  return (
    <>
      <div className="aiva-hero">
        <h2>What Would You Like To Do Today?</h2>
        <div className="aiva-modes">
          {MODES.map(m => (
            <button
              key={m.k}
              type="button"
              className={`aiva-mode${mode === m.k ? " on" : ""}`}
              onClick={() => setMode(mode === m.k ? null : m.k)}
            >
              <span style={{color:m.color}}>{m.i}</span>
              <span>{m.label}</span>
              <Plus size={14} className="aiva-mode-plus"/>
            </button>
          ))}
        </div>
        <div className="aiva-hero-box">
          <textarea
            value={hero}
            onChange={e => setHero(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generateHero(); }}
            placeholder={mode ? MODES.find(x => x.k === mode)!.hint + "..." : "What do you want to do?"}
          />
          <div className="aiva-hero-row">
            <button type="button" className="aiva-mic" aria-label="Voice"><Mic size={16}/></button>
            <button type="button" className="aiva-gen" disabled={!hero.trim() || loading} onClick={generateHero}>
              <Send size={14}/> Generate For Free!
            </button>
          </div>
        </div>
      </div>



      <div className="lt-aiva-wrap">
        <div className="lt-aiva-chat">
          <div className="lt-aiva-head">
            <div className="lt-aiva-av">A</div>
            <div className="lt-aiva-id">
              <b>AIVA</b>
              <span className="on">Online</span>
            </div>
            <button className="lt-aiva-new" onClick={newChat} aria-label="New chat"><RefreshCw size={16}/></button>
          </div>

          <div className="lt-aiva-stream" ref={streamRef}>
            {msgs.map(m => (
              <div key={m.id} className={`lt-aiva-msg ${m.from}`}>
                <div className="lt-aiva-u">{m.from === "user" ? "Z" : <Sparkles size={14}/>}</div>
                <div style={{flex:1}}>
                  <div className="lt-aiva-bub">
                    {m.text}
                    {m.steps && (
                      <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:6}}>
                        {m.steps.map((s, i) => (
                          <div key={i} className="lt-step">
                            <CheckCircle2 size={15} strokeWidth={2.5}/>
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {m.from === "ai" && m.steps && <CopyButton text={[m.text, ...m.steps].join("\n")} />}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="lt-aiva-msg ai">
                <div className="lt-aiva-u"><Sparkles size={14}/></div>
                <div className="lt-typing"><span/><span/><span/></div>
              </div>
            )}
          </div>

          <div className="lt-aiva-input">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") send(); }}
              placeholder="Ask AIVA to build, write, or plan something..."
            />
            <button className="lt-aiva-send" disabled={!input.trim() || loading} onClick={() => send()} aria-label="Send">
              <Send size={16} strokeWidth={2.5}/>
            </button>
          </div>
        </div>

        <div className="lt-aiva-sb">
          <h4>Quick prompts</h4>
          {PROMPTS.map((p, i) => (
            <button key={i} className="lt-prompt" onClick={() => send(p.t)}>
              {p.i}<span style={{flex:1}}>{p.t}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button className="lt-copy" onClick={() => {
      navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    }}>
      {done ? <><Check size={13}/> Copied</> : <><Copy size={13}/> Copy</>}
    </button>
  );
}
