import { useMemo, useState } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import type { useCoaching } from "@/hooks/use-coaching";
import type { Client } from "@/lib/coaching/types";
import { dayIso } from "@/lib/coaching/store";
import { Avatar, Field, Modal } from "./bits";

type Api = ReturnType<typeof useCoaching>;

export function CoachingPipeline({ api, onOpen }: { api: Api; onOpen: (c: Client) => void }) {
  const { doc } = api;
  const [adding, setAdding] = useState(false);
  const [lead, setLead] = useState({ name: "", email: "", stageId: doc.stages[0]?.id ?? "new-lead" });

  const byStage = useMemo(() => {
    const m = new Map<string, Client[]>();
    for (const s of doc.stages) m.set(s.id, []);
    for (const c of doc.clients) {
      if (c.archived || !c.stageId) continue;
      m.get(c.stageId)?.push(c);
    }
    return m;
  }, [doc.clients, doc.stages]);

  function shift(c: Client, dir: -1 | 1) {
    const idx = doc.stages.findIndex(s => s.id === c.stageId);
    const next = doc.stages[idx + dir];
    if (next) api.moveToStage(c.id, next.id);
  }

  return (
    <>
      <div className="coach-section-head">
        <div>
          <h2>Pipeline</h2>
          <p>Move People From First Contact To Joined. Drag-Free — Just Nudge Them Forward.</p>
        </div>
        <button className="coach-btn primary" onClick={() => setAdding(true)}><Plus size={14} /> Add Lead</button>
      </div>

      <div className="coach-board">
        {doc.stages.map(stage => {
          const list = byStage.get(stage.id) ?? [];
          return (
            <section key={stage.id} className="coach-col">
              <header className="coach-col-head">
                <span className="coach-dot" style={{ background: stage.color }} />
                <h3>{stage.label}</h3>
                <span className="coach-count">{list.length}</span>
              </header>
              <div className="coach-col-body">
                {list.map(c => (
                  <article key={c.id} className="coach-lead">
                    <button className="coach-lead-main" onClick={() => onOpen(c)}>
                      <Avatar src={c.photo} name={c.name} size={28} />
                      <span>
                        <strong>{c.name}</strong>
                        <small>{c.email}</small>
                      </span>
                    </button>
                    <div className="coach-lead-nav">
                      <button aria-label="Move back" onClick={() => shift(c, -1)}><ChevronLeft size={13} /></button>
                      <button aria-label="Move forward" onClick={() => shift(c, 1)}><ChevronRight size={13} /></button>
                    </div>
                  </article>
                ))}
                {!list.length && <p className="coach-col-empty">Empty</p>}
              </div>
            </section>
          );
        })}
      </div>

      {adding && (
        <Modal title="Add Lead" onClose={() => setAdding(false)}>
          <div className="coach-form-grid">
            <Field label="Name"><input value={lead.name} onChange={e => setLead({ ...lead, name: e.target.value })} placeholder="Full Name" /></Field>
            <Field label="Email"><input value={lead.email} onChange={e => setLead({ ...lead, email: e.target.value })} placeholder="name@example.com" /></Field>
            <Field label="Stage">
              <select value={lead.stageId} onChange={e => setLead({ ...lead, stageId: e.target.value })}>
                {doc.stages.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </Field>
          </div>
          <button
            className="coach-btn primary"
            disabled={!lead.name.trim()}
            onClick={() => {
              api.addClient({
                name: lead.name.trim(), email: lead.email.trim(), phone: "", photo: "", location: "",
                lifecycle: "prospect", stageId: lead.stageId, programIds: [], membership: "Free",
                joinedAt: dayIso(0), lastActiveAt: dayIso(0), engagement: 10, courseProgress: 0, tags: [], value: 0,
              });
              setLead({ name: "", email: "", stageId: doc.stages[0]?.id ?? "new-lead" });
              setAdding(false);
            }}
          >Add Lead</button>
        </Modal>
      )}
    </>
  );
}
