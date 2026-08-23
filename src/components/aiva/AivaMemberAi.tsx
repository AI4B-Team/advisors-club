import { useState } from "react";
import { Sparkles, UserCircle2, ShieldCheck, Eye, LifeBuoy, BookOpen, Wand2, Info } from "lucide-react";
import { AmCard, AmField, AmToggle } from "./ui";
import { useMemberAiEditor } from "@/hooks/use-member-ai";
import { MemberAssistantPanel } from "@/components/member-ai/MemberAssistant";
import { MemberOnboardingConfig } from "./MemberOnboardingConfig";
import {
  MEMBER_AI_MODES, MEMBER_AI_SOURCES, MEMBER_AI_PERMISSIONS, MEMBER_AI_ACTIONS,
  ESCALATION_TRIGGERS, NEXT_ACTIONS, disclosure, displayName,
} from "@/lib/member-ai";

export function AivaMemberAi() {
  const { settings, update } = useMemberAiEditor();
  const [preview, setPreview] = useState(false);
  const name = displayName(settings);

  return (
    <div className="am-stack">
      <AmCard
        title="How Members Experience AI"
        desc="AIVA Stays The Intelligence Layer. Choose The Identity Members See."
        icon={<UserCircle2 size={16} />}
        actions={<button className="am-btn" onClick={() => setPreview(true)}><Eye size={13} /> Preview As Member</button>}
      >
        <div className="am-mode-grid">
          {MEMBER_AI_MODES.map(m => (
            <button key={m.id} className={`am-mode${settings.mode === m.id ? " on" : ""}`} onClick={() => update({ mode: m.id })}>
              <b>{m.label}</b>
              <span>{m.blurb}</span>
            </button>
          ))}
        </div>

        {settings.mode === "my-coach" && (
          <AmField label="Expert Name" hint="Used In The Assistant Name And The AI Disclosure.">
            <input className="am-input" value={settings.coachName} placeholder="Michael Alvarez" onChange={e => update({ coachName: e.target.value })} />
          </AmField>
        )}

        {settings.mode === "custom" && (
          <>
            <div className="am-grid-2">
              <AmField label="Custom Name"><input className="am-input" value={settings.name} placeholder="Ava" onChange={e => update({ name: e.target.value })} /></AmField>
              <AmField label="Avatar URL"><input className="am-input" value={settings.avatarUrl} placeholder="https://…" onChange={e => update({ avatarUrl: e.target.value })} /></AmField>
            </div>
            <AmField label="Trained On (Expert Name)" hint="Optional. Shown In The Disclosure So Members Know Whose Method It Uses.">
              <input className="am-input" value={settings.coachName} placeholder="Michael" onChange={e => update({ coachName: e.target.value })} />
            </AmField>
          </>
        )}

        {settings.mode !== "aiva" && (
          <>
            <AmField label="Introduction" hint="The First Thing Members Read.">
              <textarea className="am-textarea" rows={2} value={settings.introduction} onChange={e => update({ introduction: e.target.value })} />
            </AmField>
            <div className="am-grid-2">
              <AmField label="Tone"><input className="am-input" value={settings.tone} onChange={e => update({ tone: e.target.value })} /></AmField>
              <AmField label="Assistant Name Members See"><input className="am-input" value={name} readOnly /></AmField>
            </div>
            <AmField label="Instructions" hint="Rules Applied To Every Member Answer.">
              <textarea className="am-textarea" rows={3} value={settings.instructions} onChange={e => update({ instructions: e.target.value })} />
            </AmField>
          </>
        )}

        <div className="am-disclose">
          <ShieldCheck size={14} />
          <p><b>AI Disclosure Is Always On.</b> Members Always See: “{disclosure(settings)}”</p>
        </div>
      </AmCard>

      <AmCard title="Trained On" desc="What The Member Assistant Can Draw Answers From." icon={<BookOpen size={16} />}>
        <div className="am-toggle-list">
          {MEMBER_AI_SOURCES.map(s => (
            <div key={s.id} className="am-toggle-row">
              <div><b>{s.label}</b><span>{s.hint}</span></div>
              <AmToggle label={s.label} on={settings.sources[s.id]} onChange={v => update({ sources: { ...settings.sources, [s.id]: v } })} />
            </div>
          ))}
        </div>
      </AmCard>

      <AmCard title="Member Context Permissions" desc="Only What You Allow Is Shared. Private Notes Are Never Shared." icon={<ShieldCheck size={16} />}>
        <div className="am-toggle-list">
          {MEMBER_AI_PERMISSIONS.map(p => (
            <div key={p.id} className="am-toggle-row">
              <div><b>{p.label}</b><span>{p.hint}</span></div>
              <AmToggle label={p.label} on={settings.permissions[p.id]} onChange={v => update({ permissions: { ...settings.permissions, [p.id]: v } })} />
            </div>
          ))}
        </div>
        <div className="am-disclose">
          <Info size={14} />
          <p>Coach Notes, Pipeline, Billing, And Other Members' Data Are Never Available To The Member Assistant.</p>
        </div>
      </AmCard>

      <AmCard title="Quick Actions" desc="The Shortcuts Members See In The Assistant." icon={<Wand2 size={16} />}>
        <div className="am-chip-grid">
          {MEMBER_AI_ACTIONS.map(a => (
            <button
              key={a.id}
              className={`am-chip-t${settings.actions[a.id] ? " on" : ""}`}
              onClick={() => update({ actions: { ...settings.actions, [a.id]: !settings.actions[a.id] } })}
            >
              {a.label}
            </button>
          ))}
        </div>
      </AmCard>

      <AmCard title="Escalation" desc="When The AI Should Hand Off To You." icon={<LifeBuoy size={16} />}>
        <div className="am-chip-grid">
          {ESCALATION_TRIGGERS.map(t => (
            <button
              key={t.id}
              className={`am-chip-t${settings.escalation.triggers[t.id] ? " on" : ""}`}
              onClick={() => update({ escalation: { ...settings.escalation, triggers: { ...settings.escalation.triggers, [t.id]: !settings.escalation.triggers[t.id] } } })}
            >
              {t.label}
            </button>
          ))}
        </div>
        <AmField label="Hand-Off Message">
          <input className="am-input" value={settings.escalation.message} onChange={e => update({ escalation: { ...settings.escalation, message: e.target.value } })} />
        </AmField>
        <div className="am-grid-2">
          <AmField label="Next Action">
            <select
              className="am-input"
              value={settings.escalation.nextAction}
              onChange={e => update({ escalation: { ...settings.escalation, nextAction: e.target.value as typeof settings.escalation.nextAction } })}
            >
              {NEXT_ACTIONS.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
            </select>
          </AmField>
          <AmField label="Button Label" hint="Leave Blank For The Default.">
            <input className="am-input" value={settings.escalation.nextActionLabel} placeholder={NEXT_ACTIONS.find(n => n.id === settings.escalation.nextAction)?.cta} onChange={e => update({ escalation: { ...settings.escalation, nextActionLabel: e.target.value } })} />
          </AmField>
        </div>
        <AmField label="What To Tell The Member" hint="Shown Beside The Hand-Off Button.">
          <input className="am-input" value={settings.escalation.extra} placeholder="Your coach replies within one business day." onChange={e => update({ escalation: { ...settings.escalation, extra: e.target.value } })} />
        </AmField>
      </AmCard>

      <MemberOnboardingConfig />

      <AmCard title="Preview" desc="Exactly What A Member Sees." icon={<Sparkles size={16} />}>
        <button className="am-btn primary" onClick={() => setPreview(true)}><Eye size={13} /> Open Member Preview</button>
      </AmCard>

      <MemberAssistantPanel open={preview} onClose={() => setPreview(false)} me={{ id: "c_sarah", name: "Sarah Klein" }} />
    </div>
  );
}
