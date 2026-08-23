import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Plus, Sparkles, LayoutGrid, MoreHorizontal, Copy, Trash2, Pencil, Eye, Users, DollarSign,
} from "lucide-react";
import { useViewMode } from "@/hooks/use-view-mode";
import { useNavLabel } from "@/hooks/use-nav-label";
import { APP_LIBRARY, LIBRARY_CATEGORIES } from "@/lib/apps/library";
import { addFromTemplate, createApp, duplicateApp, getApps, patchApp, removeApp, subscribeApps } from "@/lib/apps/store";
import { getUsage, statsFor, subscribeUsage, type UsageEvent } from "@/lib/apps/usage";
import { visibleApps } from "@/lib/apps/access";
import { appIcon } from "@/components/apps/icons";
import { AiAppBuilder } from "@/components/apps/AiAppBuilder";
import { APP_KIND_LABEL, toAccessPolicy, type App, type AppKind } from "@/lib/apps/types";
import { AccessChip } from "@/components/commerce/AccessGate";

export const Route = createFileRoute("/app/apps/")({
  component: AppsPage,
  head: () => ({
    meta: [
      { title: "Apps | Advisors Club" },
      { name: "description", content: "Turn Your Methodology Into Interactive Tools Your Members Can Use — Calculators, Assessments, Planners And Trackers." },
      { property: "og:title", content: "Apps | Advisors Club" },
      { property: "og:description", content: "Turn Your Methodology Into Interactive Tools Your Members Can Use." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function useApps(): App[] {
  const [apps, setApps] = useState<App[]>([]);
  useEffect(() => { setApps(getApps()); return subscribeApps(setApps); }, []);
  return apps;
}

function useUsage(): UsageEvent[] {
  const [events, setEvents] = useState<UsageEvent[]>([]);
  useEffect(() => { setEvents(getUsage()); return subscribeUsage(setEvents); }, []);
  return events;
}

function AppsPage() {
  const { isAdmin, viewAs } = useViewMode();
  const label = useNavLabel("apps", "Apps");
  const apps = useApps();
  const asMember = !isAdmin || Boolean(viewAs);

  return asMember
    ? <MemberApps apps={apps} label={label} />
    : <AdminApps apps={apps} label={label} />;
}

/* ------------------------------ Member view ------------------------------ */

function MemberApps({ apps, label }: { apps: App[]; label: string }) {
  const mine = useMemo(
    () => visibleApps(apps, { isAdmin: false, membership: "Pro", paid: true }).filter(a => a.listed !== false),
    [apps],
  );

  return (
    <div className="pg">
      <div className="pg-head">
        <h1 className="pg-title">{label}</h1>
        <p className="pg-sub">Tools Made For You By Your Club Host.</p>
      </div>

      {mine.length === 0 ? (
        <EmptyState title="Nothing Here Yet" body="Your Club Host Hasn't Published Any Tools Yet." />
      ) : (
        <div className="apx-grid">
          {mine.map(a => (
            <Link key={a.id} to="/app/apps/$appId" params={{ appId: a.id }} className="apx-card is-link">
              <span className="apx-card-i">{appIcon(a.icon)}</span>
              <span className="apx-card-t">{a.name}</span>
              <span className="apx-card-d">{a.description || APP_KIND_LABEL[a.kind]}</span>
              <span className="apx-card-kind">{APP_KIND_LABEL[a.kind]}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------- Admin view ------------------------------ */

function AdminApps({ apps, label }: { apps: App[]; label: string }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"yours" | "library">("yours");
  const [ai, setAi] = useState(false);
  const [manual, setManual] = useState(false);
  const events = useUsage();

  const totals = useMemo(() => {
    const all = apps.map(a => statsFor(a, events));
    return {
      published: apps.filter(a => a.status === "published").length,
      opens: all.reduce((s, x) => s + x.opens, 0),
      members: new Set(events.map(e => e.memberId)).size,
      revenue: all.reduce((s, x) => s + x.revenue, 0),
    };
  }, [apps, events]);

  return (
    <div className="pg">
      <div className="apx-head">
        <div>
          <h1 className="pg-title">{label}</h1>
          <p className="pg-sub">Turn Your Methodology Into Tools Your Members Can Use. Members See This Section As "{label}".</p>
        </div>
        <div className="apx-head-actions">
          <button className="apx-ai-btn" onClick={() => setAi(true)}><Sparkles size={15} /> Build App With AI</button>
          <button className="apx-primary-btn" onClick={() => setManual(true)}><Plus size={15} /> New App</button>
        </div>
      </div>

      {apps.length > 0 && (
        <div className="apx-totals">
          <Stat label="Published" value={String(totals.published)} />
          <Stat label="Opens" value={totals.opens.toLocaleString()} icon={<Eye size={13} />} />
          <Stat label="Members Reached" value={String(totals.members)} icon={<Users size={13} />} />
          <Stat label="Revenue" value={`$${totals.revenue.toLocaleString()}`} icon={<DollarSign size={13} />} />
        </div>
      )}

      <div className="apx-tabs">
        <button className={`apx-tab${tab === "yours" ? " is-on" : ""}`} onClick={() => setTab("yours")}>
          Your Apps <span>{apps.length}</span>
        </button>
        <button className={`apx-tab${tab === "library" ? " is-on" : ""}`} onClick={() => setTab("library")}>App Library</button>
      </div>

      {tab === "yours" ? (
        apps.length === 0 ? (
          <EmptyState
            title="No Apps Yet"
            body="Describe What You Teach And AI Will Draft The Tool, Or Start From The App Library."
            action={<button className="apx-ai-btn" onClick={() => setAi(true)}><Sparkles size={14} /> Build App With AI</button>}
          />
        ) : (
          <div className="apx-grid">
            {apps.map(a => <AdminAppCard key={a.id} app={a} events={events} />)}
          </div>
        )
      ) : (
        <LibraryTab onAdded={id => void navigate({ to: "/app/apps/$appId/edit", params: { appId: id } })} />
      )}

      {ai && <AiAppBuilder onClose={() => setAi(false)} />}
      {manual && <NewAppModal onClose={() => setManual(false)} onAi={() => { setManual(false); setAi(true); }} />}
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="apx-total">
      <span>{icon}{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function AdminAppCard({ app, events }: { app: App; events: UsageEvent[] }) {
  const [menu, setMenu] = useState(false);
  const stats = statsFor(app, events);

  return (
    <div className="apx-card">
      <div className="apx-card-top">
        <span className="apx-card-i">{appIcon(app.icon)}</span>
        <button className="apx-kebab" onClick={() => setMenu(m => !m)} aria-label="App Actions">
          <MoreHorizontal size={16} />
        </button>
        {menu && (
          <>
            <div className="apx-menu-scrim" onClick={() => setMenu(false)} />
            <div className="apx-menu">
              <Link to="/app/apps/$appId/edit" params={{ appId: app.id }}><Pencil size={13} /> Edit</Link>
              <Link to="/app/apps/$appId" params={{ appId: app.id }}><Eye size={13} /> Preview As Member</Link>
              <button onClick={() => { duplicateApp(app.id); setMenu(false); }}><Copy size={13} /> Duplicate</button>
              <button onClick={() => { patchApp(app.id, { listed: app.listed === false }); setMenu(false); }}>
                <LayoutGrid size={13} /> {app.listed === false ? "Show In List" : "Hide From List"}
              </button>
              <button className="is-danger" onClick={() => { removeApp(app.id); setMenu(false); }}><Trash2 size={13} /> Delete</button>
            </div>
          </>
        )}
      </div>

      <Link to="/app/apps/$appId/edit" params={{ appId: app.id }} className="apx-card-body">
        <span className="apx-card-t">{app.name}</span>
        <span className="apx-card-d">{app.description || APP_KIND_LABEL[app.kind]}</span>
      </Link>

      <div className="apx-card-meta">
        <span className="apx-card-kind">{APP_KIND_LABEL[app.kind]}</span>
        <AccessChip policy={toAccessPolicy(app.access)} />
        {app.source === "ai" && <span className="apx-card-kind is-ai"><Sparkles size={11} /> AI</span>}
      </div>

      <div className="apx-card-foot">
        <button
          className={`apx-status${app.status === "published" ? " is-live" : ""}`}
          onClick={() => patchApp(app.id, { status: app.status === "published" ? "draft" : "published" })}
        >
          {app.status === "published" ? "Published" : "Draft"}
        </button>
        <span className="apx-usage">{stats.opens} Opens · {stats.completionRate}% Completed</span>
      </div>
    </div>
  );
}

function LibraryTab({ onAdded }: { onAdded: (id: string) => void }) {
  return (
    <>
      <p className="apx-muted">These Are Starting Points — Nothing Is Added To Your Club Until You Add It.</p>
      {LIBRARY_CATEGORIES.map(cat => (
        <section key={cat} className="apx-lib-sec">
          <h2 className="apx-lib-t">{cat}</h2>
          <div className="apx-grid">
            {APP_LIBRARY.filter(t => t.category === cat).map(t => (
              <div key={t.id} className="apx-card">
                <span className="apx-card-i">{appIcon(t.icon)}</span>
                <span className="apx-card-t">{t.name}</span>
                <span className="apx-card-d">{t.description}</span>
                <div className="apx-card-foot">
                  <span className="apx-card-kind">{APP_KIND_LABEL[t.kind]}</span>
                  <button
                    className="apx-mini"
                    onClick={() => { const app = addFromTemplate(t.id); if (app) onAdded(app.id); }}
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

function NewAppModal({ onClose, onAi }: { onClose: () => void; onAi: () => void }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [kind, setKind] = useState<AppKind>("calculator");

  function submit() {
    if (!name.trim()) return;
    const app = createApp({ name, description: desc, kind, source: "blank" });
    onClose();
    void navigate({ to: "/app/apps/$appId/edit", params: { appId: app.id } });
  }

  return (
    <div className="apx-modal-wrap" onClick={onClose}>
      <div className="apx-modal" onClick={e => e.stopPropagation()}>
        <div className="apx-modal-head">
          <h3>New App</h3>
          <button className="apx-x" onClick={onClose}>×</button>
        </div>
        <div className="apx-modal-body">
          <button className="apx-path" onClick={onAi}>
            <Sparkles size={16} />
            <span>
              <strong>Build With AI</strong>
              <em>Describe What You Teach And Get A Working Tool In Seconds.</em>
            </span>
          </button>

          <div className="apx-or"><span>Or Start Manually</span></div>

          <label className="apx-field">
            <span className="apx-field-l">App Name</span>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Deal Analyzer" autoFocus />
          </label>
          <label className="apx-field">
            <span className="apx-field-l">Short Description</span>
            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Score A Property Deal In Under A Minute." />
          </label>
          <label className="apx-field">
            <span className="apx-field-l">Type</span>
            <select value={kind} onChange={e => setKind(e.target.value as AppKind)}>
              {(Object.keys(APP_KIND_LABEL) as AppKind[]).map(k => <option key={k} value={k}>{APP_KIND_LABEL[k]}</option>)}
            </select>
          </label>
        </div>
        <div className="apx-modal-foot">
          <button className="apx-mini" onClick={onClose}>Cancel</button>
          <button className="apx-primary-btn" disabled={!name.trim()} onClick={submit}>Create App</button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="apx-empty">
      <LayoutGrid size={18} />
      <strong>{title}</strong>
      <span>{body}</span>
      {action}
    </div>
  );
}
