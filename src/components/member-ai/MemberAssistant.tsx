import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import { Sparkles, X, ArrowUp, Loader2, Info, LifeBuoy } from "lucide-react";
import { memberAssistant } from "@/lib/ai.functions";
import {
  disclosure, displayName, enabledActions, ESCALATION_TRIGGERS, NEXT_ACTIONS,
  type MemberAiSettings,
} from "@/lib/member-ai";
import { knowledgeSnapshot, memberSnapshot, type MemberIdentity } from "@/lib/member-ai-snapshot";
import { useMemberAi } from "@/hooks/use-member-ai";

type Msg = { id: number; from: "me" | "ai"; text: string; escalate?: boolean };

/** Avatar shown for the assistant — always badged as AI. */
function AiMark({ s, size = 30 }: { s: MemberAiSettings; size?: number }) {
  return (
    <span className="mai-mark" style={{ width: size, height: size }}>
      {s.avatarUrl
        ? <img src={s.avatarUrl} alt="" />
        : <Sparkles size={Math.round(size * 0.5)} />}
      <i className="mai-mark-b">AI</i>
    </span>
  );
}

export function MemberAssistantPanel({
  open, onClose, me, seedPrompt,
}: {
  open: boolean; onClose: () => void; me: MemberIdentity; seedPrompt?: string;
}) {
  const settings = useMemberAi();
  const run = useServerFn(memberAssistant);
  const nav = useNavigate();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(1);

  const name = displayName(settings);
  const actions = useMemo(() => enabledActions(settings), [settings]);
  const nextAction = NEXT_ACTIONS.find(n => n.id === settings.escalation.nextAction) ?? NEXT_ACTIONS[0];
  const ctaLabel = settings.escalation.nextActionLabel || nextAction.cta;

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 60); }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [msgs, busy]);
  useEffect(() => {
    if (open && seedPrompt) void send(seedPrompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, seedPrompt]);

  async function send(text?: string) {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    const mine: Msg = { id: idRef.current++, from: "me", text: q };
    const history = [...msgs, mine];
    setMsgs(history);
    setInput("");
    setBusy(true);
    setError(null);
    try {
      const res = await run({
        data: {
          persona: {
            name,
            mode: settings.mode,
            coachName: settings.coachName,
            tone: settings.tone,
            instructions: settings.instructions,
            introduction: settings.introduction,
          },
          escalation: {
            topics: ESCALATION_TRIGGERS.filter(t => settings.escalation.triggers[t.id]).map(t => t.label),
            message: settings.escalation.message,
            nextAction: `${ctaLabel}${settings.escalation.extra ? ` — ${settings.escalation.extra}` : ""}`,
          },
          knowledge: knowledgeSnapshot(settings),
          member: memberSnapshot(settings, me),
          messages: history.slice(-12).map(m => ({
            role: m.from === "me" ? ("user" as const) : ("assistant" as const),
            content: m.text,
          })),
        },
      });
      if (res.error) setError(res.error);
      else setMsgs(m => [...m, { id: idRef.current++, from: "ai", text: res.reply, escalate: res.escalate }]);
    } catch {
      setError("The assistant is unavailable right now.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div className="mai-overlay" onMouseDown={onClose}>
      <aside className="mai" onMouseDown={e => e.stopPropagation()} role="dialog" aria-label={`${name} — AI Assistant`}>
        <header className="mai-head">
          <AiMark s={settings} size={34} />
          <div className="mai-head-t">
            <div className="mai-name">{name} <span className="mai-badge">AI</span></div>
            <div className="mai-disc"><Info size={11} /> {disclosure(settings)}</div>
          </div>
          <button className="mai-x" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </header>

        <div className="mai-body" ref={bodyRef}>
          {!msgs.length && (
            <div className="mai-intro">
              <AiMark s={settings} size={44} />
              <p className="mai-intro-t">{settings.introduction}</p>
              <p className="mai-intro-s">{disclosure(settings)}</p>
              <div className="mai-chips">
                {actions.map(a => (
                  <button key={a.id} className="mai-chip" onClick={() => send(a.prompt)}>{a.label}</button>
                ))}
              </div>
            </div>
          )}

          {msgs.map(m => (
            m.from === "me" ? (
              <div key={m.id} className="mai-row me"><div className="mai-bub me">{m.text}</div></div>
            ) : (
              <div key={m.id} className="mai-row">
                <AiMark s={settings} size={26} />
                <div className="mai-bub">
                  <ReactMarkdown>{m.text}</ReactMarkdown>
                  {m.escalate && (
                    <div className="mai-esc">
                      <LifeBuoy size={14} />
                      <span>{settings.escalation.extra || "Your coach can take this from here."}</span>
                      <button onClick={() => { onClose(); nav({ to: nextAction.to }); }}>{ctaLabel}</button>
                    </div>
                  )}
                </div>
              </div>
            )
          ))}

          {busy && (
            <div className="mai-row">
              <AiMark s={settings} size={26} />
              <div className="mai-bub mai-typing"><Loader2 size={14} className="mai-spin" /> Thinking…</div>
            </div>
          )}
          {error && <div className="mai-err">{error}</div>}
        </div>

        {msgs.length > 0 && (
          <div className="mai-quick">
            {actions.slice(0, 4).map(a => (
              <button key={a.id} className="mai-chip sm" onClick={() => send(a.prompt)}>{a.label}</button>
            ))}
          </div>
        )}

        <div className="mai-input">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            placeholder={`Ask ${name} anything about your courses, goals, or next step…`}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
          />
          <button className="mai-send" disabled={!input.trim() || busy} onClick={() => send()} aria-label="Send">
            {busy ? <Loader2 size={15} className="mai-spin" /> : <ArrowUp size={15} strokeWidth={3} />}
          </button>
        </div>
        <p className="mai-foot">AI assistant. Responses are generated and may be imperfect — check anything important with your coach.</p>
      </aside>
    </div>
  );
}
