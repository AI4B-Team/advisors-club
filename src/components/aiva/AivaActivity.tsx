import { useState } from "react";
import { Eye, Filter, Pause, Pencil, Play, RotateCcw } from "lucide-react";
import { AmCard, AmStatus } from "./ui";
import { CAPABILITIES, timeAgo, type ActivityEntry, type AivaAdmin } from "@/lib/aiva-admin";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "action", label: "Actions" },
  { id: "suggestion", label: "Suggestions" },
  { id: "flag", label: "Flags" },
] as const;

export function AivaActivity({ admin, update }: { admin: AivaAdmin; update: (p: Partial<AivaAdmin>) => void }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [open, setOpen] = useState<ActivityEntry | null>(null);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);

  const rows = admin.activity.filter(a => filter === "all" || a.kind === filter);

  function undo(id: string) {
    update({ activity: admin.activity.map(a => a.id === id ? { ...a, undone: true } : a) });
  }

  function togglePause(cap: ActivityEntry["capability"]) {
    const paused = admin.pausedCapabilities.includes(cap);
    update({
      pausedCapabilities: paused
        ? admin.pausedCapabilities.filter(c => c !== cap)
        : [...admin.pausedCapabilities, cap],
    });
  }

  function saveEdit() {
    if (!open) return;
    update({ activity: admin.activity.map(a => a.id === open.id ? { ...a, detail: draft } : a) });
    setOpen({ ...open, detail: draft });
    setEditing(false);
  }

  return (
    <div className="am-stack">
      <AmCard
        title="Activity Log"
        desc="Every Action, Suggestion, And Flag AIVA Produced. Fully Transparent."
        icon={<Filter size={16} />}
        actions={
          <div className="am-seg">
            {FILTERS.map(f => (
              <button key={f.id} className={`am-seg-btn${filter === f.id ? " on" : ""}`} onClick={() => setFilter(f.id)}>{f.label}</button>
            ))}
          </div>
        }
      >
        <ul className="am-act-list">
          {rows.map(a => {
            const paused = admin.pausedCapabilities.includes(a.capability);
            const cap = CAPABILITIES.find(c => c.id === a.capability);
            return (
              <li key={a.id} className={a.undone ? "undone" : ""}>
                <span className={`am-dot am-dot-${a.kind}`} />
                <div className="am-act-main">
                  <b>{a.title}</b>
                  <p className="am-muted">{a.detail}</p>
                  <span className="am-act-meta">{cap?.label} · {timeAgo(a.at)}{a.undone ? " · Undone" : ""}</span>
                </div>
                {paused && <AmStatus kind="off">Paused</AmStatus>}
                <div className="am-src-actions">
                  {a.can.includes("view") && (
                    <button className="am-icon-btn" aria-label="View" onClick={() => { setOpen(a); setDraft(a.detail); setEditing(false); }}><Eye size={14} /></button>
                  )}
                  {a.can.includes("edit") && (
                    <button className="am-icon-btn" aria-label="Edit" onClick={() => { setOpen(a); setDraft(a.detail); setEditing(true); }}><Pencil size={14} /></button>
                  )}
                  {a.can.includes("undo") && !a.undone && (
                    <button className="am-icon-btn" aria-label="Undo" onClick={() => undo(a.id)}><RotateCcw size={14} /></button>
                  )}
                  {a.can.includes("pause") && (
                    <button className="am-icon-btn" aria-label={paused ? "Resume This Action" : "Pause This Action"} onClick={() => togglePause(a.capability)}>
                      {paused ? <Play size={14} /> : <Pause size={14} />}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
          {rows.length === 0 && <li className="am-muted">Nothing Logged Yet.</li>}
        </ul>
      </AmCard>

      {open && (
        <div className="am-modal-wrap" role="dialog" aria-modal="true" onClick={() => setOpen(null)}>
          <div className="am-modal" onClick={e => e.stopPropagation()}>
            <h3>{open.title}</h3>
            <p className="am-act-meta">{CAPABILITIES.find(c => c.id === open.capability)?.label} · {timeAgo(open.at)}</p>
            {editing ? (
              <textarea className="am-textarea" rows={5} value={draft} onChange={e => setDraft(e.target.value)} />
            ) : (
              <p className="am-fact-v">{open.detail}</p>
            )}
            <div className="am-row-end">
              <button className="am-btn ghost" onClick={() => setOpen(null)}>Close</button>
              {editing
                ? <button className="am-btn" onClick={saveEdit}>Save</button>
                : open.can.includes("edit") && <button className="am-btn" onClick={() => setEditing(true)}>Edit</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
