import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import { Sparkles, X, ArrowUp, Loader2, Info, LifeBuoy } from "lucide-react";
import { memberAssistant } from "@/lib/ai.functions";
import { usePersona } from "@/hooks/use-persona";
import { personaActions, personaDisclosure, personaName } from "@/lib/persona/store";
import { personaInstructions, personaKnowledge } from "@/lib/persona/knowledge";
import { detectVoiceContext } from "@/lib/persona/voice-prompt";
import { PERSONA_ESCALATION_TRIGGERS, PERSONA_NEXT_ACTIONS, type PersonaSettings } from "@/lib/persona/types";
import { memberSnapshot, type MemberIdentity } from "@/lib/member-ai-snapshot";
import { getMemberAi, type MemberAiPermissionId } from "@/lib/member-ai";
import { useViewMode } from "@/hooks/use-view-mode";
import { usePermissions } from "@/hooks/use-club-access";
import { recommendForMember, type MemberReco } from "@/lib/persona/recommend";
import { trackReco } from "@/lib/persona/reco-events";
import { attachRecoAttribution } from "@/lib/persona/reco-attribution";
import { MemberRecoCards } from "./MemberRecoCards";

type Msg = { id: number; from: "me" | "ai"; text: string; escalate?: boolean; recos?: MemberReco[] };

function AiMark({ s, size = 30 }: { s: PersonaSettings; size?: number }) {
  return (
    <span className="mai-mark" style={{ width: size, height: size }}>
      {s.avatarUrl ? <img src={s.avatarUrl} alt="" /> : <Sparkles size={Math.round(size * 0.5)} />}
      <i className="mai-mark-b">AI</i>
    </span>
  );
}

export function PersonaAssistantPanel({
  open, onClose, me, seedPrompt,
}: {
  open: boolean; onClose: () => void; me: MemberIdentity; seedPrompt?: string;
}) {
  const persona = usePersona();
  const { isAdmin } = useViewMode();
  // Persona knowledge is gated on real authority, not the preview toggle.
  const canManage = usePermissions().canManageClub() && isAdmin;
  const run = useServerFn(memberAssistant);
  const nav = useNavigate();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(1);
  const turnRef = useRef(0);
  // Everything recommended in THIS conversation — feeds the frequency rules.
  const shownRef = useRef<{ nodeId: string; paid: boolean; turn: number }[]>([]);

  const name = personaName(persona);
  const actions = useMemo(() => personaActions(persona), [persona]);
  const nextAction = PERSONA_NEXT_ACTIONS.find(n => n.id === persona.escalation.nextAction) ?? PERSONA_NEXT_ACTIONS[0];
  const ctaLabel = persona.escalation.nextActionLabel || nextAction.cta;

  useEffect(() => { attachRecoAttribution(); }, []);
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
      const knowledge = personaKnowledge(persona, { canManage, id: me.id });
      // Member context reuses the shared, permission-gated snapshot builder.
      const permissions = { ...getMemberAi().permissions } as Record<MemberAiPermissionId, boolean>;
      (Object.keys(permissions) as MemberAiPermissionId[]).forEach(k => {
        permissions[k] = Boolean((persona.memberContext as Record<string, boolean>)[k]);
      });
      const res = await run({
        data: {
          persona: {
            name,
            mode: "custom" as const,
            coachName: persona.expertName,
            tone: persona.tone,
            instructions: personaInstructions(persona, detectVoiceContext(q)),
            introduction: persona.greeting,
          },
          escalation: {
            topics: PERSONA_ESCALATION_TRIGGERS.filter(t => persona.escalation.triggers[t.id]).map(t => t.label),
            message: persona.escalation.message,
            nextAction: `${ctaLabel}${persona.escalation.extra ? ` — ${persona.escalation.extra}` : ""}`,
          },
          knowledge: knowledge.text,
          member: memberSnapshot({ ...getMemberAi(), permissions }, me),
          messages: history.slice(-12).map(m => ({
            role: m.from === "me" ? ("user" as const) : ("assistant" as const),
            content: m.text,
          })),
        },
      });
      if (res.error) setError(res.error);
      else {
        // Help first: recommendations are attached to an answer, never instead of one.
        turnRef.current += 1;
        let recos: MemberReco[] = [];
        if (!res.escalate) {
          recos = recommendForMember(
            { query: q, extra: res.reply, turn: turnRef.current, shownThisConversation: shownRef.current },
            persona,
            { canManage, id: me.id },
          );
          recos.forEach(r => {
            shownRef.current.push({ nodeId: r.nodeId, paid: r.paid, turn: turnRef.current });
            trackReco({ nodeId: r.nodeId, title: r.title, owned: r.owned, paid: r.paid, type: "shown", query: q, memberId: me.id });
          });
        }
        setMsgs(m => [...m, { id: idRef.current++, from: "ai", text: res.reply, escalate: res.escalate, recos }]);
      }
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
          <AiMark s={persona} size={34} />
          <div className="mai-head-t">
            <div className="mai-name">{name} <span className="mai-badge">AI</span></div>
            <div className="mai-disc"><Info size={11} /> {personaDisclosure(persona)}</div>
          </div>
          <button className="mai-x" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </header>

        <div className="mai-body" ref={bodyRef}>
          {!msgs.length && (
            <div className="mai-intro">
              <AiMark s={persona} size={44} />
              <p className="mai-intro-t">{persona.greeting}</p>
              <p className="mai-intro-s">{personaDisclosure(persona)}</p>
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
                <AiMark s={persona} size={26} />
                <div className="mai-bub">
                  <ReactMarkdown>{m.text}</ReactMarkdown>
                  {m.escalate && (
                    <div className="mai-esc">
                      <LifeBuoy size={14} />
                      <span>{persona.escalation.extra || "Your coach can take this from here."}</span>
                      <button onClick={() => { onClose(); nav({ to: nextAction.to }); }}>{ctaLabel}</button>
                    </div>
                  )}
                  {!!m.recos?.length && (
                    <MemberRecoCards
                      recos={m.recos}
                      memberId={me.id}
                      query={msgs.find(x => x.id === m.id - 1)?.text ?? ""}
                      onNavigate={onClose}
                      onDismiss={id => setMsgs(list => list.map(x =>
                        x.id === m.id ? { ...x, recos: (x.recos ?? []).filter(r => r.nodeId !== id) } : x))}
                    />
                  )}
                </div>
              </div>
            )
          ))}

          {busy && (
            <div className="mai-row">
              <AiMark s={persona} size={26} />
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
            placeholder={`Ask ${name} anything…`}
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
