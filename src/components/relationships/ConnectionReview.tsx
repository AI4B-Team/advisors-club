import { useEffect, useMemo, useState } from "react";
import { Loader2, Check, X, Pencil, Sparkles, Lock, Ban } from "lucide-react";
import { useRelationships } from "@/hooks/use-relationships";
import {
  COMMERCE_LABEL, INTENT_HINT, INTENT_LABEL, KIND_LABEL, PLACEMENT_LABEL,
  dismissScan, requiresApproval, toggleMutedIntent, toggleMutedKind,
  type ConnectionIntent, type Relationship,
} from "@/lib/relationships";
import type { NodeId } from "@/lib/graph/types";

const INTENTS: ConnectionIntent[] = ["educational", "helpful", "navigational", "promotional"];

/**
 * Connections — the creator's review surface for the whole relationship layer.
 *
 * AIVA discovers; the creator decides. Every suggestion states what it is, why
 * it exists, whether it is free or paid, and exactly what members would see.
 * Nothing reaches a member until it is approved here.
 */
export function ConnectionReview() {
  const {
    graph, items, unscanned, all, forTarget, report,
    scanItem, setStatus, setStatusMany, edit, remove, mutes,
  } = useRelationships();

  const [targetId, setTargetId] = useState<NodeId | "">("");
  const [scanning, setScanning] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!targetId && items.length) setTargetId(unscanned[0]?.id ?? items[0].id);
  }, [items, unscanned, targetId]);

  const target = items.find(i => i.id === targetId);
  const connections = targetId ? forTarget(targetId) : [];
  const summary = useMemo(() => (targetId ? report(targetId) : null), [targetId, report, all]);
  const pendingIds = connections.filter(c => c.status === "suggested").map(c => c.id);
  const spotlight = unscanned[0];

  async function runScan(id: NodeId) {
    setScanning(true);
    await new Promise(r => setTimeout(r, 550));
    scanItem(id);
    setTargetId(id);
    setScanning(false);
  }

  return (
    <div className="rel-review">
      <header className="rel-head">
        <h2>Connections</h2>
        <p>
          AIVA Understands How Everything In Your Club Relates. It Finds The Connections;
          You Decide Which Ones Members Ever See.
        </p>
      </header>

      {spotlight && (
        <div className="rel-spotlight">
          <Sparkles size={16} />
          <div>
            <strong>Your {spotlight.title} Is Live.</strong>
            <p>Want Me To Look Back Across Everything You've Already Built And Find Where It Would Help?</p>
          </div>
          <div className="rel-spotlight-actions">
            <button className="opp-primary" onClick={() => runScan(spotlight.id)} disabled={scanning}>
              {scanning ? <Loader2 size={14} className="rel-spin" /> : "Find Connections"}
            </button>
            <button className="opp-quiet" onClick={() => dismissScan(spotlight.id)}>Not Now</button>
          </div>
        </div>
      )}

      <div className="rel-picker">
        <label htmlFor="rel-target">Analyze</label>
        <select id="rel-target" value={targetId} onChange={e => setTargetId(e.target.value)}>
          {items.map(i => (
            <option key={i.id} value={i.id}>{i.title}</option>
          ))}
        </select>
        <button className="opp-quiet" onClick={() => targetId && runScan(targetId)} disabled={scanning || !targetId}>
          {scanning ? "Looking…" : "Re-Scan"}
        </button>
      </div>

      {summary && summary.total > 0 && target && (
        <p className="rel-summary">
          I Found <strong>{summary.total} Places</strong> Where Your {target.title} Could Help Members.
          {summary.promotional > 0 && (
            <span className="rel-paidnote">
              <Lock size={12} /> {summary.promotional} Involve A Paid Product And Need Your Approval.
            </span>
          )}
        </p>
      )}

      {summary && summary.total === 0 && (
        <p className="rel-empty">No Connections On Record Yet. Run A Scan And I'll Look Across Everything You've Built.</p>
      )}

      {pendingIds.length > 1 && (
        <div className="rel-bulk">
          <button className="opp-quiet" onClick={() => setStatusMany(pendingIds, "active")}>Approve All Suggested</button>
          <button className="opp-quiet" onClick={() => setStatusMany(pendingIds, "rejected")}>Reject All</button>
        </div>
      )}

      {summary?.groups.map(g => (
        <section key={g.group} className="rel-group">
          <h3>{g.group}</h3>
          <p className="rel-group-summary">{g.summary}</p>

          {g.items.map(r => (
            <article key={r.id} className="rel-row">
              <div className="rel-meta">
                <span className={`rel-intent is-${r.intent}`}>{INTENT_LABEL[r.intent]}</span>
                <span>{KIND_LABEL[r.kind]}</span>
                <span>{COMMERCE_LABEL[r.commerce]}</span>
                <span>{PLACEMENT_LABEL[r.placement]}</span>
                {r.status !== "suggested" && <span className="rel-status">{r.status === "rejected" ? "Rejected" : "Live"}</span>}
              </div>

              <h4>{r.sourceTitle}</h4>
              <p className="rel-reason">{r.reason}</p>

              {editing === r.id ? (
                <div className="rel-edit">
                  <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={3} />
                  <div className="rel-edit-actions">
                    <button className="opp-primary" onClick={() => { edit(r.id, { memberCopy: draft }); setEditing(null); }}>Save</button>
                    <button className="opp-quiet" onClick={() => setEditing(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <p className="rel-copy">“{r.memberCopy}”</p>
              )}

              {requiresApproval(r) && (
                <p className="rel-guard"><Lock size={12} /> Paid Recommendation — Members Only See This After You Approve It.</p>
              )}

              <div className="rel-actions">
                {r.status !== "active" && r.status !== "approved" && (
                  <button className="opp-primary" onClick={() => setStatus(r.id, "active")}>
                    <Check size={14} /> Approve
                  </button>
                )}
                <button className="opp-quiet" onClick={() => { setEditing(r.id); setDraft(r.memberCopy); }}>
                  <Pencil size={14} /> Edit Copy
                </button>
                {r.status !== "rejected" && (
                  <button className="opp-quiet" onClick={() => setStatus(r.id, "rejected")}>
                    <X size={14} /> Reject
                  </button>
                )}
                <button className="opp-quiet" onClick={() => remove(r.id)}>Remove</button>
                <button className="opp-quiet" onClick={() => toggleMutedKind(r.kind)}>
                  <Ban size={14} /> Stop Suggesting {KIND_LABEL[r.kind]}
                </button>
              </div>
            </article>
          ))}
        </section>
      ))}

      <section className="rel-group">
        <h3>What AIVA May Suggest</h3>
        <p className="rel-group-summary">Turn Off Any Type Of Connection And AIVA Will Stop Proposing It.</p>
        <div className="rel-mutes">
          {INTENTS.map(i => {
            const off = mutes.intents.includes(i);
            return (
              <button key={i} className={`rel-mute${off ? " is-off" : ""}`} onClick={() => toggleMutedIntent(i)}>
                <span>{INTENT_LABEL[i]}</span>
                <em>{off ? "Off" : INTENT_HINT[i]}</em>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export type { Relationship };
