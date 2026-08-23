import { useEffect, useState } from "react";
import { Ban, Bot, MessageCircle, Plus, ShieldAlert, Sparkles, Trash2, UserCircle2 } from "lucide-react";
import { AmCard, AmField } from "./ui";
import type { AivaAdmin } from "@/lib/aiva-admin";
import { getAivaContext, setAivaContext, type MemberAiMode } from "@/lib/aiva-context";

const MEMBER_MODES: { id: MemberAiMode; label: string; blurb: string }[] = [
  { id: "aiva", label: "AIVA", blurb: "Members Meet AIVA By Name." },
  { id: "my-coach", label: "My AI Coach", blurb: "Framed As Your Coaching Companion." },
  { id: "custom", label: "Custom AI Assistant", blurb: "Your Own Name And Persona." },
];

function ListEditor({ label, hint, items, onChange }: {
  label: string; hint: string; items: string[]; onChange: (v: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  return (
    <div className="am-list-editor">
      <span className="am-field-l">{label}</span>
      <span className="am-field-h">{hint}</span>
      <ul className="am-rule-list">
        {items.map((it, i) => (
          <li key={i}>
            <span>{it}</span>
            <button className="am-icon-btn danger" aria-label="Remove Rule" onClick={() => onChange(items.filter((_, x) => x !== i))}>
              <Trash2 size={13} />
            </button>
          </li>
        ))}
        {items.length === 0 && <li className="am-muted">No Rules Yet.</li>}
      </ul>
      <div className="am-inline">
        <input className="am-input" value={draft} placeholder={hint} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && draft.trim()) { onChange([...items, draft.trim()]); setDraft(""); } }} />
        <button className="am-btn ghost" disabled={!draft.trim()} onClick={() => { onChange([...items, draft.trim()]); setDraft(""); }}>
          <Plus size={14} /> Add
        </button>
      </div>
    </div>
  );
}

export function AivaInstructions({ admin, update }: { admin: AivaAdmin; update: (p: Partial<AivaAdmin>) => void }) {
  const [memberAi, setMemberAi] = useState(() => getAivaContext().memberAi);
  useEffect(() => { setMemberAi(getAivaContext().memberAi); }, []);

  function saveMemberAi(patch: Partial<typeof memberAi>) {
    const next = { ...memberAi, ...patch, configured: true };
    setMemberAi(next);
    setAivaContext({ memberAi: next });
  }

  return (
    <div className="am-stack">
      <AmCard title="AIVA Identity" desc="One Intelligence Layer. One Identity." icon={<Sparkles size={16} />}>
        <div className="am-grid-2">
          <AmField label="Name">
            <input className="am-input" value={admin.identity.name} onChange={e => update({ identity: { ...admin.identity, name: e.target.value } })} />
          </AmField>
          <AmField label="Avatar URL" hint="Leave Empty To Use The Default Mark.">
            <input className="am-input" value={admin.identity.avatarUrl} placeholder="https://..." onChange={e => update({ identity: { ...admin.identity, avatarUrl: e.target.value } })} />
          </AmField>
        </div>
        <AmField label="Introduction" hint="The First Thing AIVA Says.">
          <textarea className="am-textarea" rows={3} value={admin.identity.introduction} onChange={e => update({ identity: { ...admin.identity, introduction: e.target.value } })} />
        </AmField>
      </AmCard>

      <AmCard title="Personality & Voice" icon={<MessageCircle size={16} />}>
        <div className="am-grid-2">
          <AmField label="Tone"><input className="am-input" value={admin.voice.tone} onChange={e => update({ voice: { ...admin.voice, tone: e.target.value } })} /></AmField>
          <AmField label="Terminology" hint="Words AIVA Should Always Use."><input className="am-input" value={admin.voice.terminology} onChange={e => update({ voice: { ...admin.voice, terminology: e.target.value } })} /></AmField>
        </div>
        <AmField label="Writing Style">
          <textarea className="am-textarea" rows={2} value={admin.voice.writingStyle} onChange={e => update({ voice: { ...admin.voice, writingStyle: e.target.value } })} />
        </AmField>
        <AmField label="Response Length">
          <div className="am-seg">
            {(["concise", "balanced", "detailed"] as const).map(l => (
              <button key={l} className={`am-seg-btn${admin.voice.length === l ? " on" : ""}`} onClick={() => update({ voice: { ...admin.voice, length: l } })}>
                {l === "concise" ? "Concise" : l === "balanced" ? "Balanced" : "Detailed"}
              </button>
            ))}
          </div>
        </AmField>
        <AmField label="Phrases To Avoid" hint="Comma Separated.">
          <textarea className="am-textarea" rows={2} value={admin.voice.avoidPhrases} onChange={e => update({ voice: { ...admin.voice, avoidPhrases: e.target.value } })} />
        </AmField>
      </AmCard>

      <AmCard title="Custom Instructions" desc="Rules AIVA Applies To Every Response." icon={<Bot size={16} />}>
        <ListEditor label="Always..." hint="Always Cite The Lesson You Pulled The Answer From."
          items={admin.custom.always} onChange={v => update({ custom: { ...admin.custom, always: v } })} />
        <ListEditor label="Never..." hint="Never Quote Prices That Aren't In Your Offers."
          items={admin.custom.never} onChange={v => update({ custom: { ...admin.custom, never: v } })} />
        <ListEditor label="When..." hint="When A Member Asks About Refunds, Hand Off To A Human."
          items={admin.custom.when} onChange={v => update({ custom: { ...admin.custom, when: v } })} />
      </AmCard>

      <AmCard title="Boundaries" icon={<ShieldAlert size={16} />}>
        <AmField label="Topics To Avoid"><textarea className="am-textarea" rows={2} value={admin.boundaries.topics} onChange={e => update({ boundaries: { ...admin.boundaries, topics: e.target.value } })} /></AmField>
        <AmField label="Questions AIVA Should Not Answer"><textarea className="am-textarea" rows={2} value={admin.boundaries.noAnswer} onChange={e => update({ boundaries: { ...admin.boundaries, noAnswer: e.target.value } })} /></AmField>
        <AmField label="Situations Requiring Human Escalation"><textarea className="am-textarea" rows={2} value={admin.boundaries.escalate} onChange={e => update({ boundaries: { ...admin.boundaries, escalate: e.target.value } })} /></AmField>
      </AmCard>

      <AmCard title="Member-Facing AI" desc="How The Same Intelligence Layer Presents Itself To Members." icon={<UserCircle2 size={16} />}>
        <div className="am-mode-grid">
          {MEMBER_MODES.map(m => (
            <button key={m.id} className={`am-mode${memberAi.mode === m.id ? " on" : ""}`} onClick={() => saveMemberAi({ mode: m.id })}>
              <b>{m.label}</b>
              <span>{m.blurb}</span>
            </button>
          ))}
        </div>
        <div className="am-grid-2">
          <AmField label="Display Name"><input className="am-input" value={memberAi.name} onChange={e => saveMemberAi({ name: e.target.value })} /></AmField>
          <AmField label="Avatar URL"><input className="am-input" value={memberAi.avatarUrl} placeholder="https://..." onChange={e => saveMemberAi({ avatarUrl: e.target.value })} /></AmField>
        </div>
        <AmField label="Introduction"><textarea className="am-textarea" rows={2} value={memberAi.personality} placeholder="Hi, I'm here to help you finish what you started." onChange={e => saveMemberAi({ personality: e.target.value })} /></AmField>
        <AmField label="Tone"><input className="am-input" value={admin.voice.tone} readOnly /></AmField>
        <AmField label="Member-Facing Instructions" hint="Applies Only To Member Conversations.">
          <textarea className="am-textarea" rows={3} value={memberAi.disclosure === "" ? "" : memberAi.personality ? memberAi.personality : ""} onChange={e => saveMemberAi({ personality: e.target.value })} placeholder="Keep Answers Short. Always Suggest The Next Lesson." />
        </AmField>
        <div className="am-disclose">
          <Ban size={14} />
          <p><b>AI Disclosure Is Always On.</b> Members Always See: “{memberAi.disclosure}”</p>
        </div>
      </AmCard>
    </div>
  );
}
