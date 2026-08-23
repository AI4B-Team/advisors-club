import { useEffect, useMemo, useState, type ReactElement, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Calculator, ClipboardList, Target, BarChart3, Sparkles, ListChecks,
  Wand2, Gauge, Wrench, Layers, Plus, X, Trash2, Lock, LayoutGrid,
} from "lucide-react";
import { useViewMode } from "@/hooks/use-view-mode";
import { useNavLabel } from "@/hooks/use-nav-label";
import { APP_LIBRARY, LIBRARY_CATEGORIES } from "@/lib/apps/library";
import { addFromTemplate, createApp, getApps, patchApp, removeApp, subscribeApps } from "@/lib/apps/store";
import { visibleApps } from "@/lib/apps/access";
import {
  APP_KIND_LABEL, MEMBERSHIP_TIERS, accessLabel,
  type App, type AppAccess, type AppIconKey, type AppKind,
} from "@/lib/apps/types";

export const Route = createFileRoute("/app/apps")({
  component: AppsPage,
  head: () => ({
    meta: [
      { title: "Apps | Advisors Club" },
      { name: "description", content: "Interactive Tools You Can Give Your Members — Calculators, Assessments, Planners And More." },
      { property: "og:title", content: "Apps | Advisors Club" },
      { property: "og:description", content: "Interactive Tools You Can Give Your Members — Calculators, Assessments, Planners And More." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const ICONS: Record<AppIconKey, ReactElement> = {
  calculator: <Calculator size={17} />,
  clipboard: <ClipboardList size={17} />,
  target: <Target size={17} />,
  chart: <BarChart3 size={17} />,
  sparkles: <Sparkles size={17} />,
  list: <ListChecks size={17} />,
  wand: <Wand2 size={17} />,
  gauge: <Gauge size={17} />,
  wrench: <Wrench size={17} />,
  layers: <Layers size={17} />,
};

const KIND_OPTIONS = Object.keys(APP_KIND_LABEL) as AppKind[];

const ACCESS_OPTIONS: { value: string; label: string; access: AppAccess }[] = [
  { value: "all", label: "All Members", access: { type: "all" } },
  ...MEMBERSHIP_TIERS.map(m => ({
    value: `membership:${m}`, label: `${m} Membership`, access: { type: "membership", membership: m } as AppAccess,
  })),
  { value: "paid", label: "Paid Access", access: { type: "paid" } },
  { value: "admin", label: "Admin Only", access: { type: "admin" } },
];

function accessValue(a: AppAccess) {
  return a.type === "membership" ? `membership:${a.membership}` : a.type === "course" ? `course:${a.courseId}` : a.type;
}

function useApps() {
  const [apps, setApps] = useState<App[]>([]);
  useEffect(() => {
    setApps(getApps());
    return subscribeApps(setApps);
  }, []);
  return apps;
}

function AppsPage() {
  const { isAdmin, viewAs } = useViewMode();
  const label = useNavLabel("apps", "Apps");
  const apps = useApps();
  const asMember = !isAdmin || Boolean(viewAs);

  if (asMember) return <MemberApps apps={apps} label={label} />;
  return <AdminApps apps={apps} label={label} />;
}

/* ------------------------------ Member view ------------------------------ */

function MemberApps({ apps, label }: { apps: App[]; label: string }) {
  const mine = useMemo(
    () => visibleApps(apps, { isAdmin: false, membership: "Pro", paid: true }),
    [apps],
  );

  return (
    <div className="pg">
      <div className="pg-head">
        <h1 className="pg-title">{label}</h1>
        <p className="pg-sub">Tools Made Available To You In This Club.</p>
      </div>

      {mine.length === 0 ? (
        <div className="mg-empty">
          <LayoutGrid size={18} />
          <div>
            <strong>Nothing Here Yet</strong>
            <span>Your Club Host Hasn't Published Any Tools Yet.</span>
          </div>
        </div>
      ) : (
        <div className="ap-grid">
          {mine.map(a => <AppCard key={a.id} app={a} />)}
        </div>
      )}
    </div>
  );
}

function AppCard({ app, children }: { app: App; children?: ReactNode }) {
  return (
    <div className="ap-card">
      <span className="ap-card-i">{ICONS[app.icon]}</span>
      <div className="ap-card-main">
        <span className="ap-card-t">{app.name}</span>
        <span className="ap-card-d">{app.description || APP_KIND_LABEL[app.kind]}</span>
      </div>
      {children}
    </div>
  );
}

/* ------------------------------- Admin view ------------------------------ */

function AdminApps({ apps, label }: { apps: App[]; label: string }) {
  const [tab, setTab] = useState<"yours" | "library">("yours");
  const [adding, setAdding] = useState(false);

  return (
    <div className="pg">
      <div className="ap-head">
        <div>
          <h1 className="pg-title">{label}</h1>
          <p className="pg-sub">Interactive Tools You Give Your Members. Members See This Section As "{label}".</p>
        </div>
        <button className="ap-add" onClick={() => setAdding(true)}>
          <Plus size={15} /> Add App
        </button>
      </div>

      <div className="ap-tabs">
        <button className={`ap-tab${tab === "yours" ? " is-on" : ""}`} onClick={() => setTab("yours")}>
          Your Apps <span className="ap-tab-n">{apps.length}</span>
        </button>
        <button className={`ap-tab${tab === "library" ? " is-on" : ""}`} onClick={() => setTab("library")}>
          App Library
        </button>
      </div>

      {tab === "yours" ? <YourApps apps={apps} onAdd={() => setAdding(true)} /> : <Library />}

      {adding && <AddAppModal onClose={() => setAdding(false)} onDone={() => { setAdding(false); setTab("yours"); }} />}
    </div>
  );
}

function YourApps({ apps, onAdd }: { apps: App[]; onAdd: () => void }) {
  if (apps.length === 0) {
    return (
      <div className="mg-empty">
        <LayoutGrid size={18} />
        <div>
          <strong>No Apps Yet</strong>
          <span>Start From The App Library Or Create One From Scratch.</span>
        </div>
        <button className="ap-add ap-add-sm" onClick={onAdd}><Plus size={14} /> Add App</button>
      </div>
    );
  }

  return (
    <div className="ap-grid">
      {apps.map(app => (
        <AppCard key={app.id} app={app}>
          <div className="ap-card-foot">
            <select
              className="ap-select"
              value={accessValue(app.access)}
              onChange={e => {
                const opt = ACCESS_OPTIONS.find(o => o.value === e.target.value);
                if (opt) patchApp(app.id, { access: opt.access });
              }}
            >
              {ACCESS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button
              className={`ap-status${app.status === "published" ? " is-live" : ""}`}
              onClick={() => patchApp(app.id, { status: app.status === "published" ? "draft" : "published" })}
            >
              {app.status === "published" ? "Published" : "Draft"}
            </button>
            <button className="ap-icon-btn" title="Remove App" onClick={() => removeApp(app.id)}>
              <Trash2 size={14} />
            </button>
          </div>
        </AppCard>
      ))}
    </div>
  );
}

function Library() {
  return (
    <>
      <p className="ap-note">
        These Are Starting Points, Not Defaults — Nothing Is Added To Your Club Until You Add It.
      </p>
      {LIBRARY_CATEGORIES.map(cat => (
        <section key={cat} className="mg-sec">
          <h2 className="mg-sec-t">{cat}</h2>
          <div className="ap-grid">
            {APP_LIBRARY.filter(t => t.category === cat).map(t => (
              <div key={t.id} className="ap-card">
                <span className="ap-card-i">{ICONS[t.icon]}</span>
                <div className="ap-card-main">
                  <span className="ap-card-t">{t.name}</span>
                  <span className="ap-card-d">{t.description}</span>
                </div>
                <div className="ap-card-foot">
                  <span className="ap-kind">{APP_KIND_LABEL[t.kind]}</span>
                  <button className="ap-mini" onClick={() => addFromTemplate(t.id)}>Add</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

/* ------------------------------- Add modal ------------------------------- */

function AddAppModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [kind, setKind] = useState<AppKind>("calculator");
  const [access, setAccess] = useState("all");

  function submit() {
    if (!name.trim()) return;
    const opt = ACCESS_OPTIONS.find(o => o.value === access);
    createApp({ name, description: desc, kind, access: opt?.access, source: "blank" });
    onDone();
  }

  return (
    <div className="ap-modal-wrap" onClick={onClose}>
      <div className="ap-modal" onClick={e => e.stopPropagation()}>
        <div className="ap-modal-head">
          <h3>Add App</h3>
          <button className="ap-icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="ap-modal-body">
          <label className="ap-field">
            <span>App Name</span>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Deal Analyzer" autoFocus />
          </label>
          <label className="ap-field">
            <span>Short Description</span>
            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Score A Property Deal In Under A Minute." />
          </label>
          <div className="ap-field-row">
            <label className="ap-field">
              <span>Type</span>
              <select value={kind} onChange={e => setKind(e.target.value as AppKind)}>
                {KIND_OPTIONS.map(k => <option key={k} value={k}>{APP_KIND_LABEL[k]}</option>)}
              </select>
            </label>
            <label className="ap-field">
              <span>Access</span>
              <select value={access} onChange={e => setAccess(e.target.value)}>
                {ACCESS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
          </div>

          <div className="ap-ai">
            <Sparkles size={15} />
            <div>
              <strong>Build App With AI</strong>
              <span>Describe The Tool You Want And AI Will Configure It. Coming Soon.</span>
            </div>
            <Lock size={14} />
          </div>
        </div>

        <div className="ap-modal-foot">
          <button className="ap-mini" onClick={onClose}>Cancel</button>
          <button className="ap-add ap-add-sm" onClick={submit} disabled={!name.trim()}>Create App</button>
        </div>
      </div>
    </div>
  );
}

export { accessLabel };
