import { useState } from "react";
import { Ban, Bot, MessageCircle, Plus, ShieldAlert, Sparkles, Trash2, UserCircle2 } from "lucide-react";
import { AmCard, AmField } from "./ui";
import type { AivaAdmin } from "@/lib/aiva-admin";
import { usePersona } from "@/hooks/use-persona";
import { personaName } from "@/lib/persona/store";

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
  const persona = usePersona();

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

      <AmCard title="Member-Facing AI" desc="These Rules Apply To AIVA Only. Your Member-Facing AI Is Configured In AI Persona." icon={<UserCircle2 size={16} />}>
        <p className="am-muted">Members Currently See: <b>{personaName(persona)}</b>. Open <b>AI Persona</b> To Change How Members Experience The Assistant.</p>
      </AmCard>
    </div>
  );
}
