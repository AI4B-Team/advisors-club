import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUp, Check } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useAivaAttention } from "@/hooks/use-aiva-attention";
import { getAivaContext } from "@/lib/aiva-context";
import type { AmPrimaryKey, AmSettingsKey } from "./tabs";

type Action = { label: string; kind: "do" | "go"; go?: { tab: AmPrimaryKey; sub?: AmSettingsKey }; done?: string };
type Msg = { id: number; from: "you" | "aiva"; text: string; bullets?: string[]; actions?: Action[] };

type Reply = { text: string; bullets?: string[]; actions?: Action[] };

/**
 * AIVA answers like an operator: what it sees, what it would do, and a button
 * that does it — never a lecture ending in "you could".
 */
function respond(q: string, clubName: string): Reply {
  const t = q.toLowerCase();

  if (/(app|calculator|analyzer|estimator|tool)/.test(t)) {
    return {
      text: "Members keep asking how to run numbers on a deal, and there's no tool for it yet. I can build a Deal Analyzer, publish it to Apps, and link it from the two lessons where the question shows up most.",
      actions: [
        { label: "Build It", kind: "do", done: "Building — I'll post the draft in Activity." },
        { label: "See Opportunities", kind: "go", go: { tab: "opportunities" } },
      ],
    };
  }
  if (/(challenge|7-day|30-day)/.test(t)) {
    return {
      text: "I can run a 7-day challenge using material you already have. Here's the shape:",
      bullets: [
        "Day 1-2 — Foundations, drawn from your first course module",
        "Day 3-5 — Daily application task posted to the feed each morning",
        "Day 6 — Live hot seat on your existing coaching slot",
        "Day 7 — Wins thread plus a next-step offer",
      ],
      actions: [
        { label: "Build It", kind: "do", done: "Drafted. Review it in Activity before it goes live." },
        { label: "Adjust With Me", kind: "do", done: "Tell me what to change and I'll redo it." },
      ],
    };
  }
  if (/(drop|churn|inactive|engagement|disengag)/.test(t)) {
    return {
      text: "Drop-off concentrates right after the first module — members finish it, then go quiet for a week. I can step in at that exact moment.",
      bullets: [
        "Send a short nudge on day 8 of silence",
        "Point each member at the next lesson they actually started",
        "Flag anyone still quiet after 14 days for you personally",
      ],
      actions: [
        { label: "Turn It On", kind: "do", done: "Running. You'll see every send in Activity." },
        { label: "Review Member AI", kind: "go", go: { tab: "settings", sub: "member-ai" } },
      ],
    };
  }
  if (/(monetiz|offer|price|pricing|upgrade|sell|revenue)/.test(t)) {
    return {
      text: "You already own most of the value here. The fastest money is packaging, not building.",
      bullets: [
        "Your most-used app is free for everyone — an advanced tier is a natural paid upgrade",
        "Course graduates have nowhere to go next; a recurring review call fits",
        "Two resource bundles could sell as a standalone starter kit",
      ],
      actions: [
        { label: "Show Me The Detail", kind: "go", go: { tab: "opportunities" } },
        { label: "Draft The Offer", kind: "do", done: "Drafting the offer — it'll be in Activity shortly." },
      ],
    };
  }
  if (/(course|lesson|module|curricul)/.test(t)) {
    return {
      text: "There's enough existing material to assemble a mini-course without you recording anything new. I'd pull from your top threads, a coaching replay, and two resources.",
      actions: [
        { label: "Build It", kind: "do", done: "Assembling the outline — review it in Activity." },
        { label: "Explore First", kind: "go", go: { tab: "opportunities" } },
      ],
    };
  }
  if (/(content|post|newsletter|email|week)/.test(t)) {
    return {
      text: `I can plan this week for ${clubName}: three feed posts, one newsletter, and a discussion prompt — all pulled from what members actually asked recently.`,
      actions: [
        { label: "Draft It All", kind: "do", done: "Drafting. Everything lands in Activity for approval." },
        { label: "See What I've Done", kind: "go", go: { tab: "activity" } },
      ],
    };
  }
  if (/(coach|call|session)/.test(t)) {
    return {
      text: "Members finishing your course are asking deal-specific questions. A weekly review call is the cleanest next step, and it reuses time you already block.",
      actions: [
        { label: "Set It Up", kind: "do", done: "Setting up the offer draft — check Activity." },
        { label: "Explore", kind: "go", go: { tab: "opportunities" } },
      ],
    };
  }
  if (/(automat|workflow|onboard)/.test(t)) {
    return {
      text: "You answer the same onboarding question nearly every week. I can handle it automatically and only involve you when someone needs a real answer.",
      actions: [
        { label: "Handle It", kind: "do", done: "On it. You'll see each handled question in Activity." },
        { label: "Set Autonomy", kind: "go", go: { tab: "settings", sub: "autonomy" } },
      ],
    };
  }
  return {
    text: "I can work on that. Here's where I'd start, based on what's happening in your Club right now:",
    bullets: [
      "Package something you already built into a paid upgrade",
      "Turn your highest-engagement threads into a mini-course",
      "Take repeat member questions off your plate",
    ],
    actions: [
      { label: "Show Opportunities", kind: "go", go: { tab: "opportunities" } },
      { label: "Start With The First One", kind: "do", done: "Working on it — details will appear in Activity." },
    ],
  };
}

const SUGGESTIONS = [
  "Find growth opportunities",
  "Create something",
  "Review member activity",
  "Build an app",
  "Plan this week's content",
];

export function AivaChat({ onOpen }: { onOpen: (tab: AmPrimaryKey, sub?: AmSettingsKey) => void }) {
  const attention = useAivaAttention();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [doneLabels, setDoneLabels] = useState<Record<string, string>>({});
  const streamRef = useRef<HTMLDivElement>(null);
  const [clubName, setClubName] = useState("your Club");
  const { displayName } = useAuth();
  const firstName = (displayName ?? "").split(" ")[0];

  useEffect(() => {
    const ctx = getAivaContext();
    const name = ctx?.profile?.business?.trim();
    if (name) setClubName(name);
  }, []);


  useEffect(() => {
    streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, thinking]);

  function send(text?: string) {
    const value = (text ?? input).trim();
    if (!value || thinking) return;
    setMsgs(m => [...m, { id: Date.now(), from: "you", text: value }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      const r = respond(value, clubName);
      setMsgs(m => [...m, { id: Date.now() + 1, from: "aiva", ...r }]);
      setThinking(false);
    }, 700);
  }

  const empty = msgs.length === 0;

  return (
    <div className="aiva-chat">
      {empty ? (
        <div className="aiva-open">
          <p className="aiva-open-greet">
            {attention.greeting}{firstName ? `, ${firstName}` : ""}.
          </p>
          <p className="aiva-open-line">
            I've been keeping an eye on {clubName}.
            {attention.hasAttention
              ? ` ${attention.count} ${attention.count === 1 ? "thing is" : "things are"} worth your attention.`
              : " Nothing needs you right now."}
          </p>
          {attention.hasAttention && (
            <button type="button" className="aiva-open-cta" onClick={() => onOpen("opportunities")}>
              View Opportunities <ArrowRight size={15}/>
            </button>
          )}
          <p className="aiva-open-ask">What do you want to work on?</p>
          <div className="aiva-open-sugg">
            {SUGGESTIONS.map(s => (
              <button key={s} type="button" onClick={() => send(s)}>{s}</button>
            ))}
          </div>
        </div>
      ) : (
        <div className="aiva-stream" ref={streamRef}>
          {msgs.map(m => (
            <div key={m.id} className={`aiva-turn ${m.from}`}>
              {m.from === "you" ? (
                <p className="aiva-you">{m.text}</p>
              ) : (
                <div className="aiva-said">
                  <p>{m.text}</p>
                  {m.bullets && (
                    <ul className="aiva-bullets">
                      {m.bullets.map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                  )}
                  {m.actions && (
                    <div className="aiva-actions">
                      {m.actions.map((a, i) => {
                        const key = `${m.id}-${i}`;
                        const done = doneLabels[key];
                        if (done) {
                          return <span key={key} className="aiva-action-done"><Check size={14}/> {done}</span>;
                        }
                        return (
                          <button
                            key={key}
                            type="button"
                            className={`aiva-action${a.kind === "do" ? " primary" : ""}`}
                            onClick={() => {
                              if (a.kind === "go" && a.go) onOpen(a.go.tab, a.go.sub);
                              else setDoneLabels(d => ({ ...d, [key]: a.done ?? "Done." }));
                            }}
                          >
                            {a.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {thinking && <p className="aiva-thinking">Thinking…</p>}
        </div>
      )}

      <div className="aiva-composer">
        <textarea
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
          }}
          placeholder="Ask AIVA anything about your business…"
        />
        <button type="button" aria-label="Send" disabled={!input.trim() || thinking} onClick={() => send()}>
          <ArrowUp size={16} strokeWidth={2.5}/>
        </button>
      </div>
    </div>
  );
}
