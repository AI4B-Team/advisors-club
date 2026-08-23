import { useMemo, useState } from "react";
import { Plus, FileText, Check, X, Trash2, UserPlus, Copy } from "lucide-react";
import type { useCoaching } from "@/hooks/use-coaching";
import type { Application, IntakeField, IntakeForm } from "@/lib/coaching/types";
import { APPLICATION_LABEL } from "@/lib/coaching/types";
import { dayIso, fmtDate, newId } from "@/lib/coaching/store";
import { Avatar, Empty, Field, Modal } from "./bits";

type Api = ReturnType<typeof useCoaching>;
const STATUSES: Application["status"][] = ["new", "in-review", "approved", "rejected", "converted"];

export function CoachingIntakes({ api }: { api: Api }) {
  const { doc } = api;
  const [view, setView] = useState<"applications" | "forms">("applications");
  const [statusFilter, setStatusFilter] = useState<Application["status"] | "all">("all");
  const [open, setOpen] = useState<Application | null>(null);
  const [editing, setEditing] = useState<IntakeForm | null>(null);

  const apps = useMemo(
    () => doc.applications
      .filter(a => statusFilter === "all" || a.status === statusFilter)
      .sort((a, b) => a.submittedAt < b.submittedAt ? 1 : -1),
    [doc.applications, statusFilter],
  );
  const current = open ? doc.applications.find(a => a.id === open.id) ?? null : null;

  return (
    <>
      <div className="coach-section-head">
        <div>
          <h2>Intakes</h2>
          <p>Application Forms And The Approval Flow That Turns Applicants Into Clients.</p>
        </div>
        <div className="coach-seg">
          <button className={view === "applications" ? "is-on" : ""} onClick={() => setView("applications")}>Applications</button>
          <button className={view === "forms" ? "is-on" : ""} onClick={() => setView("forms")}>Forms</button>
        </div>
      </div>

      {view === "applications" ? (
        <>
          <div className="coach-filters">
            <button className={statusFilter === "all" ? "is-on" : ""} onClick={() => setStatusFilter("all")}>All</button>
            {STATUSES.map(s => (
              <button key={s} className={statusFilter === s ? "is-on" : ""} onClick={() => setStatusFilter(s)}>{APPLICATION_LABEL[s]}</button>
            ))}
          </div>

          {apps.length ? (
            <div className="coach-cards">
              {apps.map(a => (
                <article key={a.id} className="coach-card">
                  <button className="coach-card-main" onClick={() => setOpen(a)}>
                    <div className="coach-card-id">
                      <Avatar src={a.photo} name={a.name} size={36} />
                      <div>
                        <strong>{a.name}</strong>
                        <small>{doc.forms.find(f => f.id === a.formId)?.title ?? "Application"} · {fmtDate(a.submittedAt)}</small>
                      </div>
                    </div>
                    <span className={`coach-app-st st-${a.status}`}>{APPLICATION_LABEL[a.status]}</span>
                  </button>
                  <p className="coach-card-quote">“{a.answers[0]?.value ?? ""}”</p>
                </article>
              ))}
            </div>
          ) : <Empty icon={<FileText size={24} />} title="No Applications" body="Applications Submitted Through Your Intake Forms Land Here." />}
        </>
      ) : (
        <>
          <div className="coach-cards">
            {doc.forms.map(f => (
              <article key={f.id} className="coach-card">
                <div className="coach-card-main static">
                  <div>
                    <strong>{f.title}</strong>
                    <small>{f.fields.length} Questions · {f.published ? "Published" : "Draft"}</small>
                  </div>
                  <span className={`coach-app-st st-${f.published ? "approved" : "new"}`}>{f.published ? "Live" : "Draft"}</span>
                </div>
                <p className="coach-card-quote">{f.desc}</p>
                <div className="coach-card-actions">
                  <button className="coach-btn" onClick={() => setEditing(f)}>Edit Form</button>
                  <button className="coach-btn" onClick={() => api.updateForm(f.id, { published: !f.published })}>{f.published ? "Unpublish" : "Publish"}</button>
                  <button className="coach-icon-btn" aria-label="Delete form" onClick={() => api.removeForm(f.id)}><Trash2 size={13} /></button>
                </div>
              </article>
            ))}
          </div>
          <button
            className="coach-btn primary"
            onClick={() => {
              const id = api.addForm({
                title: "New Intake Form", desc: "Describe Who This Form Is For.", programId: null, published: false,
                createdAt: dayIso(0),
                fields: [
                  { id: newId("q"), label: "Full Name", type: "short", required: true },
                  { id: newId("q"), label: "Email Address", type: "email", required: true },
                ],
              });
              setTimeout(() => {
                const f = api.doc.forms.find(x => x.id === id);
                if (f) setEditing(f);
              }, 0);
            }}
          ><Plus size={14} /> New Intake Form</button>
        </>
      )}

      {current && (
        <Modal title={`Application — ${current.name}`} onClose={() => setOpen(null)} wide>
          <div className="coach-kv-grid">
            <div>{current.email}</div>
            <div>Submitted {fmtDate(current.submittedAt)}</div>
            <div>{doc.forms.find(f => f.id === current.formId)?.title}</div>
          </div>
          {current.answers.map((a, i) => (
            <div key={i} className="coach-answer">
              <span>{a.label}</span>
              <p>{a.value}</p>
            </div>
          ))}
          <Field label="Review Note">
            <textarea rows={2} value={current.reviewNote} onChange={e => api.updateApplication(current.id, { reviewNote: e.target.value })} placeholder="Why This Is Or Isn't A Fit…" />
          </Field>
          <div className="coach-card-actions">
            <button className="coach-btn" onClick={() => api.updateApplication(current.id, { status: "in-review" })}>Mark In Review</button>
            <button className="coach-btn ok" onClick={() => api.updateApplication(current.id, { status: "approved" })}><Check size={13} /> Approve</button>
            <button className="coach-btn danger" onClick={() => api.updateApplication(current.id, { status: "rejected" })}><X size={13} /> Reject</button>
            <button
              className="coach-btn primary"
              disabled={current.status === "converted"}
              onClick={() => { api.convertApplication(current.id); setOpen(null); }}
            ><UserPlus size={13} /> Convert To Client</button>
          </div>
        </Modal>
      )}

      {editing && <FormBuilder api={api} form={doc.forms.find(f => f.id === editing.id) ?? editing} onClose={() => setEditing(null)} />}
    </>
  );
}

function FormBuilder({ api, form, onClose }: { api: Api; form: IntakeForm; onClose: () => void }) {
  function setFields(fields: IntakeField[]) { api.updateForm(form.id, { fields }); }
  return (
    <Modal title="Intake Form Builder" onClose={onClose} wide>
      <div className="coach-form-grid">
        <Field label="Form Title"><input value={form.title} onChange={e => api.updateForm(form.id, { title: e.target.value })} /></Field>
        <Field label="Description"><input value={form.desc} onChange={e => api.updateForm(form.id, { desc: e.target.value })} /></Field>
      </div>

      {form.fields.map((f, i) => (
        <div key={f.id} className="coach-fieldrow">
          <input value={f.label} onChange={e => setFields(form.fields.map(x => x.id === f.id ? { ...x, label: e.target.value } : x))} aria-label={`Question ${i + 1}`} />
          <select value={f.type} onChange={e => setFields(form.fields.map(x => x.id === f.id ? { ...x, type: e.target.value as IntakeField["type"] } : x))} aria-label="Question type">
            <option value="short">Short Text</option>
            <option value="long">Long Text</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="number">Number</option>
            <option value="select">Choice</option>
          </select>
          <label className="coach-req">
            <input type="checkbox" checked={f.required} onChange={e => setFields(form.fields.map(x => x.id === f.id ? { ...x, required: e.target.checked } : x))} />
            Required
          </label>
          <button className="coach-icon-btn" aria-label="Remove question" onClick={() => setFields(form.fields.filter(x => x.id !== f.id))}><Trash2 size={13} /></button>
        </div>
      ))}

      <div className="coach-card-actions">
        <button className="coach-btn" onClick={() => setFields([...form.fields, { id: newId("q"), label: "New Question", type: "short", required: false }])}>
          <Plus size={13} /> Add Question
        </button>
        <button className="coach-btn" onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/apply/${form.id}`)}>
          <Copy size={13} /> Copy Share Link
        </button>
        <button className="coach-btn primary" onClick={onClose}>Done</button>
      </div>
    </Modal>
  );
}
