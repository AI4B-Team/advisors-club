import { useMemo, useState } from "react";
import { Search, Users, AlertTriangle } from "lucide-react";
import type { useCoaching } from "@/hooks/use-coaching";
import type { Client, Lifecycle } from "@/lib/coaching/types";
import { LIFECYCLE_LABEL, LIFECYCLE_ORDER } from "@/lib/coaching/types";
import { attentionSignals, daysAgo } from "@/lib/coaching/store";
import { bookSnapshot } from "@/lib/coaching/snapshot";
import { Avatar, Empty, LifePill, Progress, StatCard } from "./bits";
import { AivaCoachPanel } from "./AivaCoachPanel";

type Api = ReturnType<typeof useCoaching>;

export function CoachingClients({ api, onOpen }: { api: Api; onOpen: (c: Client) => void }) {
  const { doc } = api;
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Lifecycle | "all">("all");

  const signals = useMemo(() => attentionSignals(doc), [doc]);
  const signalMap = useMemo(() => new Map(signals.map(s => [s.clientId, s])), [signals]);

  const rows = useMemo(() => doc.clients.filter(c => {
    if (c.archived) return false;
    if (filter !== "all" && c.lifecycle !== filter) return false;
    if (!q.trim()) return true;
    const s = q.toLowerCase();
    return c.name.toLowerCase().includes(s) || c.email.toLowerCase().includes(s) || c.tags.some(t => t.toLowerCase().includes(s));
  }), [doc.clients, filter, q]);

  const active = doc.clients.filter(c => !c.archived);
  const paying = active.filter(c => c.value > 0);
  const mrr = paying.reduce((a, c) => a + c.value, 0);

  return (
    <>
      <div className="coach-stats">
        <StatCard label="Active People" value={active.length} hint={`${paying.length} Paying`} />
        <StatCard label="Monthly Value" value={`$${mrr.toLocaleString()}`} hint="Across All Programs" />
        <StatCard label="Needs Attention" value={signals.length} hint="Based On Real Signals" />
        <StatCard label="Avg Engagement" value={`${Math.round(active.reduce((a, c) => a + c.engagement, 0) / Math.max(1, active.length))}%`} hint="Last 30 Days" />
      </div>

      <AivaCoachPanel
        snapshot={() => bookSnapshot(doc)}
        defaultKind="attention"
        presets={[
          { label: "Who Needs Attention This Week?", prompt: "Who needs attention this week and what should I do about each one?", kind: "attention" },
          { label: "Who Is Ready To Upgrade?", prompt: "Based on engagement and progress, who is ready for a higher-tier offer?", kind: "ask" },
          { label: "Where Is My Time Best Spent?", prompt: "If I only have 3 hours of coaching time this week, where do I spend it?", kind: "ask" },
        ]}
      />

      <div className="coach-toolbar">
        <div className="coach-search">
          <Search size={14} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search Clients…" aria-label="Search clients" />
        </div>
        <div className="coach-filters">
          <button className={filter === "all" ? "is-on" : ""} onClick={() => setFilter("all")}>All</button>
          {LIFECYCLE_ORDER.map(l => (
            <button key={l} className={filter === l ? "is-on" : ""} onClick={() => setFilter(l)}>{LIFECYCLE_LABEL[l]}</button>
          ))}
        </div>
      </div>

      {rows.length ? (
        <div className="coach-table">
          <div className="coach-tr coach-th">
            <span>Client</span><span>Stage</span><span>Engagement</span><span>Course</span><span>Last Active</span><span>Value</span>
          </div>
          {rows.map(c => {
            const sig = signalMap.get(c.id);
            return (
              <button key={c.id} className="coach-tr coach-row" onClick={() => onOpen(c)}>
                <span className="coach-cell-name">
                  <Avatar src={c.photo} name={c.name} />
                  <span>
                    <strong>{c.name}</strong>
                    <small>{c.email}</small>
                  </span>
                  {sig && <span className="coach-flag" title={sig.reasons.join(" · ")}><AlertTriangle size={12} /></span>}
                </span>
                <span><LifePill stage={c.lifecycle} /></span>
                <span className="coach-cell-bar">
                  <Progress pct={c.engagement} tone={c.engagement >= 65 ? "green" : c.engagement >= 40 ? "amber" : "red"} />
                  <small>{c.engagement}%</small>
                </span>
                <span className="coach-mono">{c.courseProgress}%</span>
                <span className="coach-mono">{daysAgo(c.lastActiveAt)}d Ago</span>
                <span className="coach-mono">{c.value ? `$${c.value}` : "—"}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <Empty icon={<Users size={24} />} title="No Clients Match" body="Try A Different Search Or Filter." />
      )}
    </>
  );
}
