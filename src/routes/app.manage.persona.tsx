import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { UserCircle2, Sparkles, BookOpen, ShieldCheck, Eye, LifeBuoy, Wand2, Upload, Info } from "lucide-react";
import { AmCard, AmField, AmToggle } from "@/components/aiva/ui";
import { usePersonaEditor } from "@/hooks/use-persona";
import { personaDisclosure, personaName } from "@/lib/persona/store";
import {
  PERSONA_ACTIONS, PERSONA_ESCALATION_TRIGGERS, PERSONA_MEMBER_CONTEXT,
  PERSONA_NEXT_ACTIONS, PERSONA_PRESETS, PERSONA_SOURCES,
} from "@/lib/persona/types";
import { PersonaAssistantPanel } from "@/components/persona/PersonaAssistant";
import { RecommendationControls } from "@/components/persona/RecommendationControls";

export const Route = createFileRoute("/app/manage/persona")({
  component: PersonaPage,
  head: () => ({
    meta: [
      { title: "AI Persona | Advisors Club" },
      { name: "description", content: "Create the member-facing AI representation of your expertise — identity, tone, knowledge sources and guardrails." },
      { property: "og:title", content: "AI Persona | Advisors Club" },
      { property: "og:description", content: "Configure the AI your members talk to inside your Club." },
    ],
  }),
});

function listField(value: string[], onChange: (v: string[]) => void, placeholder: string) {
  return (
    <textarea
      className="am-textarea"
      rows={3}
      placeholder={placeholder}
      value={value.join("\n")}
      onChange={e => onChange(e.target.value.split("\n").map(s => s.trim()).filter(Boolean))}
    />
  );
}

function PersonaPage() {
  const { persona, update } = usePersonaEditor();
  const [preview, setPreview] = useState(false);
  const [upTitle, setUpTitle] = useState("");
  const [upBody, setUpBody] = useState("");

  return (
    <div className="pg">
      <div className="pg-head">
        <h1 className="pg-title">AI Persona</h1>
        <p className="pg-sub">The Member-Facing AI Representation Of You. Separate From AI Assist, Your Own Business Operator.</p>
      </div>

      <div className="am-stack">
        <AmCard
          title="Identity"
          desc="Who Members Meet. The AI Disclosure Is Always On."
          icon={<UserCircle2 size={16} />}
          actions={
            <>
              <button className="am-btn" onClick={() => setPreview(true)}><Eye size={13} /> Preview As Member</button>
            </>
          }
        >
          <div className="am-toggle-row">
            <div><b>Enable AI Persona</b><span>Members Only Meet The Persona When This Is On.</span></div>
            <AmToggle label="Enable AI Persona" on={persona.enabled} onChange={v => update({ enabled: v })} />
          </div>

          <div className="am-mode-grid">
            <button className={`am-mode${persona.identityMode === "expert" ? " on" : ""}`} onClick={() => update({ identityMode: "expert" })}>
              <b>Use My Name</b><span>“Michael's AI Coach” — Clearly Yours, Clearly AI.</span>
            </button>
            <button className={`am-mode${persona.identityMode === "separate" ? " on" : ""}`} onClick={() => update({ identityMode: "separate" })}>
              <b>Create Separate AI Identity</b><span>Its Own Name And Avatar, Trained On Your Method.</span>
            </button>
          </div>

          <div className="am-grid-2">
            <AmField label="Your Name (Expert)" hint="Always Used In The AI Disclosure.">
              <input className="am-input" value={persona.expertName} placeholder="Michael Alvarez" onChange={e => update({ expertName: e.target.value })} />
            </AmField>
            <AmField label="Role / Title"><input className="am-input" value={persona.title} placeholder="Deal Coach" onChange={e => update({ title: e.target.value })} /></AmField>
          </div>

          {persona.identityMode === "separate" && (
            <div className="am-grid-2">
              <AmField label="Persona Name"><input className="am-input" value={persona.name} placeholder="Deal Coach AI" onChange={e => update({ name: e.target.value })} /></AmField>
              <AmField label="Avatar URL"><input className="am-input" value={persona.avatarUrl} placeholder="https://…" onChange={e => update({ avatarUrl: e.target.value })} /></AmField>
            </div>
          )}

          <AmField label="Short Description"><input className="am-input" value={persona.description} onChange={e => update({ description: e.target.value })} /></AmField>
          <AmField label="Greeting" hint="The First Thing Members Read."><textarea className="am-textarea" rows={2} value={persona.greeting} onChange={e => update({ greeting: e.target.value })} /></AmField>

          <div className="am-chip-grid">
            {PERSONA_PRESETS.map(p => (
              <button key={p.id} className="am-chip-t" onClick={() => update({ name: p.name, title: p.title, tone: p.tone, expertise: p.expertise, identityMode: "separate" })}>
                {p.name}
              </button>
            ))}
          </div>

          <div className="am-disclose">
            <ShieldCheck size={14} />
            <p><b>Members Always See:</b> “{personaDisclosure(persona)}”</p>
          </div>
          <div className="am-grid-2">
            <AmField label="Name Members See"><input className="am-input" value={personaName(persona)} readOnly /></AmField>
            <AmField label="Tone"><input className="am-input" value={persona.tone} onChange={e => update({ tone: e.target.value })} /></AmField>
          </div>
        </AmCard>

        <AmCard title="Personality & Boundaries" desc="How It Speaks, And What It Will Not Touch." icon={<Sparkles size={16} />}>
          <AmField label="Personality"><input className="am-input" value={persona.personality} onChange={e => update({ personality: e.target.value })} /></AmField>
          <AmField label="Instructions" hint="Applied To Every Member Answer.">
            <textarea className="am-textarea" rows={3} value={persona.instructions} onChange={e => update({ instructions: e.target.value })} />
          </AmField>
          <AmField label="Areas Of Expertise" hint="One Per Line.">
            {listField(persona.expertise, v => update({ expertise: v }), "Deal analysis\nFinancing\nNegotiation")}
          </AmField>
          <div className="am-grid-2">
            <AmField label="Should Answer" hint="One Per Line.">
              {listField(persona.shouldAnswer, v => update({ shouldAnswer: v }), "Course questions\nNext steps")}
            </AmField>
            <AmField label="Should Not Answer" hint="One Per Line.">
              {listField(persona.shouldNotAnswer, v => update({ shouldNotAnswer: v }), "Legal advice\nTax advice")}
            </AmField>
          </div>
        </AmCard>

        <AmCard title="Knowledge Sources" desc="What It May Draw Answers From." icon={<BookOpen size={16} />}>
          <div className="am-toggle-list">
            {PERSONA_SOURCES.map(s => (
              <div key={s.id} className="am-toggle-row">
                <div><b>{s.label}</b><span>{s.hint}</span></div>
                <AmToggle label={s.label} on={persona.sources[s.id]} onChange={v => update({ sources: { ...persona.sources, [s.id]: v } })} />
              </div>
            ))}
          </div>
          <div className="am-disclose">
            <ShieldCheck size={14} />
            <p><b>Gated Content Is Protected.</b> Paid Courses, Programs And Apps A Member Doesn't Own Are Passed As Titles Only — Never Their Contents.</p>
          </div>
        </AmCard>

        <AmCard title="Uploaded Knowledge" desc="Notes, FAQs Or Documents Pasted In Directly." icon={<Upload size={16} />}>
          {persona.uploads.length > 0 && (
            <div className="am-toggle-list">
              {persona.uploads.map(u => (
                <div key={u.id} className="am-toggle-row">
                  <div><b>{u.title}</b><span>{u.body.slice(0, 90)}…</span></div>
                  <button className="am-btn" onClick={() => update({ uploads: persona.uploads.filter(x => x.id !== u.id) })}>Remove</button>
                </div>
              ))}
            </div>
          )}
          <div className="am-grid-2">
            <AmField label="Title"><input className="am-input" value={upTitle} placeholder="Refund Policy" onChange={e => setUpTitle(e.target.value)} /></AmField>
            <AmField label="Content"><textarea className="am-textarea" rows={2} value={upBody} onChange={e => setUpBody(e.target.value)} /></AmField>
          </div>
          <button
            className="am-btn primary"
            disabled={!upTitle.trim() || !upBody.trim()}
            onClick={() => {
              update({ uploads: [...persona.uploads, { id: `u_${Date.now()}`, title: upTitle.trim(), body: upBody.trim() }] });
              setUpTitle(""); setUpBody("");
            }}
          >
            Add Knowledge
          </button>
        </AmCard>

        <AmCard title="Member Context" desc="Only What You Allow Is Shared. Coach Notes Are Never Shared." icon={<ShieldCheck size={16} />}>
          <div className="am-toggle-list">
            {PERSONA_MEMBER_CONTEXT.map(c => (
              <div key={c.id} className="am-toggle-row">
                <div><b>{c.label}</b><span>{c.hint}</span></div>
                <AmToggle label={c.label} on={persona.memberContext[c.id]} onChange={v => update({ memberContext: { ...persona.memberContext, [c.id]: v } })} />
              </div>
            ))}
          </div>
        </AmCard>

        <AmCard title="Recommendations" desc="What It May Point Members Toward." icon={<Wand2 size={16} />}>
          <div className="am-toggle-row">
            <div><b>Recommend Products</b><span>Allow It To Suggest Courses, Programs And Apps The Member Doesn't Own Yet.</span></div>
            <AmToggle label="Recommend Products" on={persona.recommendProducts} onChange={v => update({ recommendProducts: v })} />
          </div>
          <div className="am-chip-grid">
            {PERSONA_ACTIONS.map(a => (
              <button
                key={a.id}
                className={`am-chip-t${persona.actions[a.id] ? " on" : ""}`}
                onClick={() => update({ actions: { ...persona.actions, [a.id]: !persona.actions[a.id] } })}
              >
                {a.label}
              </button>
            ))}
          </div>
        </AmCard>

        <RecommendationControls />


        <AmCard title="Escalation" desc="When The Persona Should Hand Off To You." icon={<LifeBuoy size={16} />}>
          <div className="am-chip-grid">
            {PERSONA_ESCALATION_TRIGGERS.map(t => (
              <button
                key={t.id}
                className={`am-chip-t${persona.escalation.triggers[t.id] ? " on" : ""}`}
                onClick={() => update({ escalation: { ...persona.escalation, triggers: { ...persona.escalation.triggers, [t.id]: !persona.escalation.triggers[t.id] } } })}
              >
                {t.label}
              </button>
            ))}
          </div>
          <AmField label="Hand-Off Message">
            <input className="am-input" value={persona.escalation.message} onChange={e => update({ escalation: { ...persona.escalation, message: e.target.value } })} />
          </AmField>
          <div className="am-grid-2">
            <AmField label="Next Action">
              <select
                className="am-input"
                value={persona.escalation.nextAction}
                onChange={e => update({ escalation: { ...persona.escalation, nextAction: e.target.value as typeof persona.escalation.nextAction } })}
              >
                {PERSONA_NEXT_ACTIONS.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
              </select>
            </AmField>
            <AmField label="Button Label" hint="Leave Blank For The Default.">
              <input
                className="am-input"
                value={persona.escalation.nextActionLabel}
                placeholder={PERSONA_NEXT_ACTIONS.find(n => n.id === persona.escalation.nextAction)?.cta}
                onChange={e => update({ escalation: { ...persona.escalation, nextActionLabel: e.target.value } })}
              />
            </AmField>
          </div>
          <AmField label="What To Tell The Member" hint="Shown Beside The Hand-Off Button.">
            <input className="am-input" value={persona.escalation.extra} onChange={e => update({ escalation: { ...persona.escalation, extra: e.target.value } })} />
          </AmField>
        </AmCard>

        <AmCard title="Preview" desc="Exactly What A Member Sees." icon={<Eye size={16} />}>
          <div className="am-disclose">
            <Info size={14} />
            <p>AI Assist Stays Your Private Business Operator. The Persona Is Member-Facing Only.</p>
          </div>
          <button className="am-btn primary" onClick={() => setPreview(true)}><Eye size={13} /> Open Member Preview</button>
        </AmCard>
      </div>

      <PersonaAssistantPanel open={preview} onClose={() => setPreview(false)} me={{ id: "c_sarah", name: "Sarah Klein" }} />
    </div>
  );
}
