import { useState } from "react";
import {
  Activity, Brain, CheckCircle2, Database, GraduationCap, Lightbulb, Pencil,
  Plus, Sparkles, Users, Wand2,
} from "lucide-react";
import { AmCard, AmSectionLabel, AmStatus } from "./ui";
import type { AmTabKey } from "./tabs";
import {
  CAPABILITIES, FACT_SECTIONS, OPERATING_MODES, timeAgo,
  type AivaAdmin, type KnowledgeFactKey,
} from "@/lib/aiva-admin";

export function AivaOverview({ admin, update, go }: {
  admin: AivaAdmin;
  update: (p: Partial<AivaAdmin>) => void;
  go: (tab: AmTabKey) => void;
}) {
  const [editing, setEditing] = useState<KnowledgeFactKey | null>(null);
  const [draft, setDraft] = useState("");
  const [teach, setTeach] = useState("");
  const [taught, setTaught] = useState(false);

  const enabled = CAPABILITIES.filter(c => admin.capabilities[c.id]);
  const ready = admin.knowledge.filter(k => k.status === "ready").length;
  const filledFacts = FACT_SECTIONS.filter(f => admin.facts[f.key].trim()).length;
  const mode = OPERATING_MODES.find(m => m.id === admin.mode)!;

  function saveFact(key: KnowledgeFactKey) {
    update({ facts: { ...admin.facts, [key]: draft } });
    setEditing(null);
  }

  function submitTeach() {
    const value = teach.trim();
    if (!value) return;
    update({
      knowledge: [
        {
          id: `k-${Date.now()}`, kind: "manual", label: value.slice(0, 60),
          detail: "Manually Added Knowledge", status: "ready", updatedAt: new Date().toISOString(),
        },
        ...admin.knowledge,
      ],
    });
    setTeach("");
    setTaught(true);
    setTimeout(() => setTaught(false), 2600);
  }

  const suggestions = [
    filledFacts < FACT_SECTIONS.length
      ? { t: "Complete What AIVA Knows", d: `${FACT_SECTIONS.length - filledFacts} Sections Are Still Empty. Filling Them Sharply Improves Answers.`, tab: "overview" as AmTabKey }
      : { t: "Review Your Brand Voice", d: "Re-Read The Voice Rules AIVA Uses In Member Replies.", tab: "instructions" as AmTabKey },
    { t: "Add A Website Or YouTube Source", d: "More Sources Means Fewer Guesses In Member Answers.", tab: "knowledge" as AmTabKey },
    { t: "Set Escalation Rules", d: "Decide Which Conversations Should Always Reach A Human.", tab: "instructions" as AmTabKey },
  ];

  return (
    <div className="am-stack">
      <div className="am-grid-3">
        <AmCard title="AIVA Status" icon={<Sparkles size={16} />}>
          <div className="am-stat">
            <AmStatus kind="ready">Active</AmStatus>
            <p className="am-stat-sub">Operating Mode: <b>{mode.label}</b></p>
            <p className="am-muted">{mode.blurb}</p>
          </div>
        </AmCard>
        <AmCard title="Business Understanding" icon={<Brain size={16} />}>
          <div className="am-stat">
            <div className="am-bar"><span style={{ width: `${Math.round((filledFacts / FACT_SECTIONS.length) * 100)}%` }} /></div>
            <p className="am-stat-sub">{filledFacts} Of {FACT_SECTIONS.length} Knowledge Sections Completed</p>
          </div>
        </AmCard>
        <AmCard title="Knowledge Sources" icon={<Database size={16} />}>
          <div className="am-stat">
            <b className="am-big">{admin.knowledge.length}</b>
            <p className="am-stat-sub">{ready} Ready · {admin.knowledge.length - ready} Pending</p>
            <button className="am-link" onClick={() => go("knowledge")}>Manage Sources</button>
          </div>
        </AmCard>
      </div>

      <div className="am-grid-2">
        <AmCard title="Enabled Capabilities" icon={<Wand2 size={16} />} actions={<button className="am-link" onClick={() => go("capabilities")}>Configure</button>}>
          <div className="am-chips">
            {enabled.length === 0 && <p className="am-muted">No Capabilities Are Enabled Yet.</p>}
            {enabled.map(c => <span key={c.id} className="am-chip on"><CheckCircle2 size={13} />{c.label}</span>)}
          </div>
        </AmCard>
        <AmCard title="Recent Activity" icon={<Activity size={16} />} actions={<button className="am-link" onClick={() => go("activity")}>View All</button>}>
          <ul className="am-mini-list">
            {admin.activity.slice(0, 4).map(a => (
              <li key={a.id}>
                <span className={`am-dot am-dot-${a.kind}`} />
                <span className="am-mini-t">{a.title}</span>
                <span className="am-mini-time">{timeAgo(a.at)}</span>
              </li>
            ))}
          </ul>
        </AmCard>
      </div>

      <AmCard
        title="What AIVA Knows"
        desc="Everything Below Is Inspectable And Editable. AIVA Only Uses What You Approve Here."
        icon={<GraduationCap size={16} />}
      >
        <div className="am-facts">
          {FACT_SECTIONS.map(f => {
            const value = admin.facts[f.key];
            const isEditing = editing === f.key;
            return (
              <div key={f.key} className="am-fact">
                <div className="am-fact-h">
                  <div>
                    <b>{f.label}</b>
                    {!value.trim() && <AmStatus kind="needs-review">Empty</AmStatus>}
                  </div>
                  {!isEditing && (
                    <button className="am-icon-btn" aria-label={`Edit ${f.label}`} onClick={() => { setEditing(f.key); setDraft(value); }}>
                      <Pencil size={14} />
                    </button>
                  )}
                </div>
                {isEditing ? (
                  <>
                    <textarea className="am-textarea" value={draft} placeholder={f.hint} onChange={e => setDraft(e.target.value)} rows={4} autoFocus />
                    <div className="am-row-end">
                      <button className="am-btn ghost" onClick={() => setEditing(null)}>Cancel</button>
                      <button className="am-btn" onClick={() => saveFact(f.key)}>Save</button>
                    </div>
                  </>
                ) : (
                  <p className={value.trim() ? "am-fact-v" : "am-muted"}>{value.trim() || f.hint}</p>
                )}
              </div>
            );
          })}
        </div>
      </AmCard>

      <AmCard
        tone="accent"
        title="Teach AIVA Something"
        desc="Add A Fact, Policy, Story, Or Correction. It Becomes Part Of Manually Added Knowledge Instantly."
        icon={<Lightbulb size={16} />}
      >
        <textarea
          className="am-textarea"
          rows={3}
          value={teach}
          onChange={e => setTeach(e.target.value)}
          placeholder="For Example: Our Refund Window Is 14 Days, No Questions Asked."
        />
        <div className="am-row-end">
          {taught && <span className="am-saved"><CheckCircle2 size={14} /> Added To Knowledge</span>}
          <button className="am-btn" disabled={!teach.trim()} onClick={submitTeach}><Plus size={14} /> Teach AIVA</button>
        </div>
      </AmCard>

      <AmCard title="Suggested Improvements" icon={<Users size={16} />}>
        <ul className="am-suggest">
          {suggestions.map(s => (
            <li key={s.t}>
              <div>
                <b>{s.t}</b>
                <p className="am-muted">{s.d}</p>
              </div>
              <button className="am-btn ghost" onClick={() => go(s.tab)}>Open</button>
            </li>
          ))}
        </ul>
      </AmCard>
    </div>
  );
}
