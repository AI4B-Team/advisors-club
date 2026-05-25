import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles, Send, Check, ChevronDown, ChevronUp, BookOpen, Users, Rocket, Settings as SettingsIcon, HelpCircle, Compass, Smartphone, Monitor, ExternalLink, Paperclip } from "lucide-react";
import { aivaChat } from "@/lib/ai.functions";

export const Route = createFileRoute("/app/getting-started")({
  head: () => ({
    meta: [
      { title: "Getting Started — AdvisorsClub" },
      { name: "description", content: "Welcome to AdvisorsClub. Describe your community idea and AIVA will help you launch in minutes." },
    ],
  }),
  component: GettingStarted,
});

type Msg = { role: "user" | "assistant"; content: string };

type Task = { id: string; label: string; done?: boolean };
type Group = { id: string; title: string; icon: React.ReactNode; tasks: Task[] };

const GROUPS: Group[] = [
  {
    id: "profile",
    title: "Complete your profile",
    icon: <Users size={16}/>,
    tasks: [
      { id: "p1", label: "Create account", done: true },
      { id: "p2", label: "Personalize your profile — photo + bio" },
      { id: "p3", label: "Connect Stripe for paid memberships" },
    ],
  },
  {
    id: "community",
    title: "Set up your community",
    icon: <SettingsIcon size={16}/>,
    tasks: [
      { id: "c1", label: "Name your Club & pick a niche" },
      { id: "c2", label: "Create your first 3 spaces" },
      { id: "c3", label: "Upload a cover image & write your About" },
      { id: "c4", label: "Set membership tiers and pricing" },
    ],
  },
  {
    id: "launch-prep",
    title: "Prepare to launch",
    icon: <BookOpen size={16}/>,
    tasks: [
      { id: "l1", label: "Publish a welcome post" },
      { id: "l2", label: "Outline your first course with AIVA" },
      { id: "l3", label: "Schedule your first live event" },
      { id: "l4", label: "Invite 5 founding members" },
    ],
  },
  {
    id: "launch",
    title: "Launch your community",
    icon: <Rocket size={16}/>,
    tasks: [
      { id: "g1", label: "Share your launch link on socials" },
      { id: "g2", label: "Send launch email to your list" },
      { id: "g3", label: "Run a 7-day kickoff challenge" },
    ],
  },
];

function GettingStarted() {
  const chat = useServerFn(aivaChat);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [openGroup, setOpenGroup] = useState<string>("profile");
  const [doneMap, setDoneMap] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(GROUPS.flatMap(g => g.tasks.filter(t => t.done).map(t => [t.id, true])))
  );

  const allTasks = GROUPS.flatMap(g => g.tasks);
  const doneCount = allTasks.filter(t => doneMap[t.id]).length;
  const pct = Math.round((doneCount / allTasks.length) * 100);

  function toggleTask(id: string) {
    setDoneMap(m => ({ ...m, [id]: !m[id] }));
  }

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await chat({ data: { messages: next } });
      if (res.error) {
        setMessages([...next, { role: "assistant", content: `⚠️ ${res.error}` }]);
      } else {
        setMessages([...next, { role: "assistant", content: res.reply || "(no response)" }]);
      }
    } catch (e) {
      console.error(e);
      setMessages([...next, { role: "assistant", content: "⚠️ Something went wrong. Try again." }]);
    } finally {
      setBusy(false);
    }
  }

  const suggestions = [
    "I want to start a real-estate investing community",
    "Help me launch a fitness coaching club for busy founders",
    "I'm a financial advisor — design my paid community",
    "Plan a 7-day challenge to attract first 50 members",
  ];

  return (
    <div className="gs">
      <div className="gs-inner">
        <h1 className="gs-title">Welcome to AdvisorsClub, Zaddy!</h1>
        <p className="gs-sub">What's your community idea? AIVA will help you build it.</p>

        <div className="gs-chat-card">
          {messages.length > 0 && (
            <div className="gs-chat-log">
              {messages.map((m, i) => (
                <div key={i} className={`gs-msg ${m.role}`}>
                  {m.role === "assistant" && <span className="gs-msg-av"><Sparkles size={14}/></span>}
                  <div className="gs-msg-body"><ReactMarkdown>{m.content}</ReactMarkdown></div>
                </div>
              ))}
              {busy && <div className="gs-msg assistant"><span className="gs-msg-av"><Sparkles size={14}/></span><div className="gs-msg-body gs-typing"><span/><span/><span/></div></div>}
            </div>
          )}

          {messages.length === 0 && (
            <div className="gs-suggest">
              {suggestions.map(s => (
                <button key={s} className="gs-suggest-chip" onClick={() => setInput(s)}>{s}</button>
              ))}
            </div>
          )}

          <div className="gs-composer">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Describe your community idea..."
              rows={2}
            />
            <div className="gs-composer-bar">
              <div className="gs-composer-tools">
                <button aria-label="Add space" type="button"><Hash size={16}/></button>
                <button aria-label="Attach" type="button"><Paperclip size={16}/></button>
              </div>
              <button className="gs-send" onClick={send} disabled={busy || !input.trim()} aria-label="Send">
                <Send size={15}/>
              </button>
            </div>
          </div>
        </div>

        <div className="gs-card">
          <div className="gs-checklist-h">
            <div>
              <h3>Setup checklist</h3>
              <div className="gs-progress-meta">{doneCount} of {allTasks.length} tasks completed</div>
            </div>
            <div className="gs-progress-pct">{pct}%</div>
          </div>
          <div className="gs-progress"><span style={{width:`${pct}%`}}/></div>

          <div className="gs-groups">
            {GROUPS.map(g => {
              const open = openGroup === g.id;
              const gDone = g.tasks.filter(t => doneMap[t.id]).length;
              return (
                <div key={g.id} className="gs-group">
                  <button className="gs-group-h" onClick={() => setOpenGroup(open ? "" : g.id)}>
                    <span className="gs-group-i">{g.icon}</span>
                    <span className="gs-group-t">{g.title}</span>
                    <span className="gs-group-c">{gDone}/{g.tasks.length}</span>
                    {open ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                  </button>
                  {open && (
                    <div className="gs-tasks">
                      {g.tasks.map(t => {
                        const done = !!doneMap[t.id];
                        return (
                          <div key={t.id} className={`gs-task${done?" done":""}`}>
                            <button className={`gs-check${done?" on":""}`} onClick={() => toggleTask(t.id)} aria-label="Toggle">
                              {done && <Check size={12} strokeWidth={3}/>}
                            </button>
                            <span className="gs-task-l">{t.label}</span>
                            {!done && <button className="gs-task-btn" onClick={() => toggleTask(t.id)}>Mark complete</button>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="gs-section-l">Resources</div>
        <div className="gs-card gs-resources">
          <ResourceRow icon={<HelpCircle size={18}/>} title="Ask for help" desc="We're here to answer your questions." cta="Get help"/>
          <ResourceRow icon={<BookOpen size={18}/>} title="Knowledge base" desc="Find answers, guides, and how-tos." cta="Open"/>
          <ResourceRow icon={<Compass size={18}/>} title="Discover Clubs" desc="See what other advisors are building." cta="Explore" to="/discover"/>
          <ResourceRow icon={<Sparkles size={18}/>} title="AIVA Academy" desc="Master AI-powered community building." cta="Unlock"/>
        </div>

        <div className="gs-section-l">Download the AdvisorsClub app</div>
        <div className="gs-card gs-resources">
          <ResourceRow icon={<Monitor size={18}/>} title="Desktop app" desc="Mac and Windows app." cta="Download"/>
          <ResourceRow icon={<Smartphone size={18}/>} title="Mobile app" desc="iOS and Android." cta="Download"/>
        </div>
      </div>
    </div>
  );
}

function ResourceRow({ icon, title, desc, cta, to }: { icon: React.ReactNode; title: string; desc: string; cta: string; to?: string }) {
  const Btn = (
    <span className="gs-res-cta">{cta} <ExternalLink size={13}/></span>
  );
  return (
    <div className="gs-res-row">
      <span className="gs-res-i">{icon}</span>
      <div className="gs-res-t">
        <div className="gs-res-n">{title}</div>
        <div className="gs-res-d">{desc}</div>
      </div>
      {to ? <Link to={to}>{Btn}</Link> : <button>{Btn}</button>}
    </div>
  );
}
