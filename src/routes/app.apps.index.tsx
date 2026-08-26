import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Plus, Sparkles, LayoutGrid, MoreHorizontal, Copy, Trash2, Pencil, Eye, Users, DollarSign,
  Store, ArrowUpCircle,
} from "lucide-react";
import { useViewMode } from "@/hooks/use-view-mode";
import { useNavLabel } from "@/hooks/use-nav-label";
import { APP_LIBRARY, LIBRARY_CATEGORIES } from "@/lib/apps/library";
import { addFromTemplate, createApp, duplicateApp, getApps, hydrateApps, patchApp, removeApp, subscribeApps } from "@/lib/apps/store";
import { getUsage, statsFor, subscribeUsage, type UsageEvent } from "@/lib/apps/usage";
import { visibleApps } from "@/lib/apps/access";
import { appIcon } from "@/components/apps/icons";
import { AiAppBuilder } from "@/components/apps/AiAppBuilder";
import { MarketplaceTab } from "@/components/apps/MarketplaceTab";
import { PublishAppModal } from "@/components/apps/PublishAppModal";
import { canPublish, updateAvailable, type Listing } from "@/lib/apps/marketplace";
import { getListings, hydrateMarketplace, subscribeMarketplace, updateInstalledApp } from "@/lib/apps/marketplace-store";
import { takePendingAppBrief, setPendingAppBrief } from "@/lib/apps/pending";
import { APP_KIND_LABEL, toAccessPolicy, type App, type AppKind } from "@/lib/apps/types";
import { AccessChip } from "@/components/commerce/AccessGate";
import { useRevenue } from "@/hooks/use-commerce";
import { PageHeader } from "@/components/ui/page-header";

export const Route = createFileRoute("/app/apps/")({
  component: AppsPage,
  // Pull the club's apps from the backend before the route renders, so the
  // list doesn't paint empty and then pop in after an effect resolves.
  // (No-op while the apps domain is still local-only.)
  loader: async () => { await Promise.all([hydrateApps(), hydrateMarketplace()]); },
  errorComponent: ({ error }) => <div className="pg" role="alert">Couldn't load your apps: {error.message}</div>,
  head: () => ({
    meta: [
      { title: "Apps | Advisors Club" },
      { name: "description", content: "Turn Your Methodology Into Interactive Apps Your Members Can Use — Calculators, Assessments, Planners And Trackers." },
      { property: "og:title", content: "Apps | Advisors Club" },
      { property: "og:description", content: "Turn Your Methodology Into Interactive Apps Your Members Can Use." },
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

function useListings(): Listing[] {
  const [listings, setListings] = useState<Listing[]>([]);
  useEffect(() => {
    const sync = () => setListings(getListings());
    sync();
    return subscribeMarketplace(sync);
  }, []);
  return listings;
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
    () => visibleApps(apps, { canManage: false, membership: "Pro", paid: true }).filter(a => a.listed !== false),
    [apps],
  );

  return (
    <div className="pg">
      <PageHeader title={label} description="Apps Made For You By Your Club Host." />

      {mine.length === 0 ? (
        <EmptyState title="Nothing Here Yet" body="Your Club Host Hasn't Published Any Apps Yet." />
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
  const [tab, setTab] = useState<"yours" | "library" | "marketplace">("yours");
  const [ai, setAi] = useState(false);
  const [manual, setManual] = useState(false);
  const [publishing, setPublishing] = useState<App | null>(null);
  const events = useUsage();
  const listings = useListings();

  // "Build It" from an AIVA Opportunity lands here with the brief already written.
  useEffect(() => {
    const brief = takePendingAppBrief();
    if (brief) { setPendingAppBrief(brief); setAi(true); }
  }, []);

  // Revenue comes from paid orders on the server whenever a real club is
  // active; local usage events are only a prototype stand-in.
  const { summary: revenueSummary } = useRevenue();
  const totals = useMemo(() => {
    const all = apps.map(a => statsFor(a, events));
    const serverAppRevenue = revenueSummary
      ? revenueSummary.byProduct.filter(p => p.productKind === "app").reduce((s, p) => s + p.grossCents, 0) / 100
      : null;
    return {
      published: apps.filter(a => a.status === "published").length,
      opens: all.reduce((s, x) => s + x.opens, 0),
      members: new Set(events.map(e => e.memberId)).size,
      revenue: serverAppRevenue ?? all.reduce((s, x) => s + x.revenue, 0),
      liveRevenue: Boolean(revenueSummary?.live),
    };
  }, [apps, events, revenueSummary]);

  return (
    <div className="pg">
      <PageHeader
        title={label}
        description={`Turn Your Methodology Into Apps Your Members Can Use. Members See This Section As "${label}".`}
        actions={<button className="apx-primary-btn" onClick={() => setManual(true)}><Plus size={15} /> New App</button>}
      />

      {apps.length > 0 && (
        <div className="apx-totals">
          <Stat label="Published" value={String(totals.published)} />
          <Stat label="Opens" value={totals.opens.toLocaleString()} icon={<Eye size={13} />} />
          <Stat label="Members Reached" value={String(totals.members)} icon={<Users size={13} />} />
          <Stat
            label={totals.liveRevenue ? "Revenue" : "Demo Revenue"}
            value={totals.liveRevenue
              ? `$${totals.revenue.toLocaleString()}`
              : (totals.revenue ? `$${totals.revenue.toLocaleString()}` : "No Revenue Yet")}
            icon={<DollarSign size={13} />}
          />
        </div>
      )}

      <div className="apx-tabs">
        <button className={`apx-tab${tab === "yours" ? " is-on" : ""}`} onClick={() => setTab("yours")}>
          Your Apps <span>{apps.length}</span>
        </button>
        <button className={`apx-tab${tab === "library" ? " is-on" : ""}`} onClick={() => setTab("library")}>App Library</button>
        <button className={`apx-tab${tab === "marketplace" ? " is-on" : ""}`} onClick={() => setTab("marketplace")}>
          <Store size={14} /> Marketplace
        </button>
      </div>

      {tab === "yours" && (
        apps.length === 0 ? (
          <EmptyState
            title="No Apps Yet"
            body="Describe What You Teach, Start From The App Library, Or Install One Another Creator Already Built."
            action={<button className="apx-ai-btn" onClick={() => setAi(true)}><Sparkles size={14} /> Build App With AI</button>}
          />
        ) : (
          <div className="apx-grid">
            {apps.map(a => (
              <AdminAppCard
                key={a.id}
                app={a}
                events={events}
                listings={listings}
                onPublish={() => setPublishing(a)}
              />
            ))}
          </div>
        )
      )}

      {tab === "library" && (
        <LibraryTab onAdded={id => void navigate({ to: "/app/apps/$appId/edit", params: { appId: id } })} />
      )}

      {tab === "marketplace" && (
        <MarketplaceTab onInstalled={id => void navigate({ to: "/app/apps/$appId/edit", params: { appId: id } })} />
      )}

      {ai && <AiAppBuilder onClose={() => setAi(false)} />}
      {publishing && (
        <PublishAppModal
          app={publishing}
          onClose={() => setPublishing(null)}
          onPublished={() => setTab("marketplace")}
        />
      )}
      {manual && (
        <NewAppModal
          onClose={() => setManual(false)}
          onAi={() => { setManual(false); setAi(true); }}
          onTemplate={() => { setManual(false); setTab("library"); }}
          onMarketplace={() => { setManual(false); setTab("marketplace"); }}
        />
      )}
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

function AdminAppCard({ app, events, listings, onPublish }: {
  app: App;
  events: UsageEvent[];
  listings: Listing[];
  onPublish: () => void;
}) {
  const [menu, setMenu] = useState(false);
  const stats = statsFor(app, events);

  // Two different relationships to the marketplace: an app this club LISTED,
  // and an app this club INSTALLED from someone else's listing. Sample supply
  // carries no `sourceAppId`, so it can never match as something this club listed.
  const listed = useMemo(
    () => listings.find(l => l.sourceAppId === app.id && l.status !== "removed"),
    [listings, app.id],
  );
  const source = useMemo(
    () => listings.find(l => l.id === app.listingId),
    [listings, app.listingId],
  );
  const hasUpdate = updateAvailable(app, source);

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
              {canPublish(app) && (
                <button onClick={() => { onPublish(); setMenu(false); }}>
                  <Store size={13} /> {listed ? "Publish An Update" : "Publish To Marketplace"}
                </button>
              )}
              {hasUpdate && (
                <button onClick={() => { updateInstalledApp(app.id); setMenu(false); }}>
                  <ArrowUpCircle size={13} /> Take Version {source?.version}
                </button>
              )}
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
        {app.source === "marketplace" && source && (
          <span className="apx-card-kind"><Store size={11} /> {source.author.name}</span>
        )}
        {listed && (
          <span className="apx-card-kind is-listed">
            <Store size={11} /> {listed.status === "live" ? `Listed · v${listed.version}` : "Unlisted"}
          </span>
        )}
      </div>

      {hasUpdate && (
        <button className="apx-update" onClick={() => updateInstalledApp(app.id)}>
          <ArrowUpCircle size={13} />
          <span>
            <strong>Version {source?.version} Is Available</strong>
            <em>{source?.changelog ?? `${source?.author.name} Published An Update.`} Your Own Edits Stay Until You Take It.</em>
          </span>
        </button>
      )}

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

function NewAppModal({ onClose, onAi, onTemplate, onMarketplace }: {
  onClose: () => void;
  onAi: () => void;
  onTemplate: () => void;
  onMarketplace: () => void;
}) {
  const navigate = useNavigate();
  const [path, setPath] = useState<"choose" | "manual">("choose");
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
          {path === "choose" ? (
            <>
              <button className="apx-path" onClick={onAi}>
                <Sparkles size={16} />
                <span>
                  <strong>Build With AI</strong>
                  <em>Describe What You Teach And Get A Working Tool In Seconds.</em>
                </span>
              </button>

              <button className="apx-path is-plain" onClick={onTemplate}>
                <LayoutGrid size={16} />
                <span>
                  <strong>Start From Template</strong>
                  <em>Proven Apps For Your Niche — Edit Anything Before You Publish.</em>
                </span>
              </button>

              <button className="apx-path is-plain" onClick={onMarketplace}>
                <Store size={16} />
                <span>
                  <strong>Install From The Marketplace</strong>
                  <em>Tools Other Creators Built And Listed. Free Or Paid, Yours To Adapt.</em>
                </span>
              </button>

              <button className="apx-path is-plain" onClick={() => setPath("manual")}>
                <Pencil size={16} />
                <span>
                  <strong>Build Manually</strong>
                  <em>Start With A Blank Tool And Add Your Own Fields And Formulas.</em>
                </span>
              </button>
            </>
          ) : (
          <>
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
          </>
          )}
        </div>
        <div className="apx-modal-foot">
          {path === "manual" ? (
            <>
              <button className="apx-mini" onClick={() => setPath("choose")}>Back</button>
              <button className="apx-primary-btn" disabled={!name.trim()} onClick={submit}>Create App</button>
            </>
          ) : (
            <button className="apx-mini" onClick={onClose}>Cancel</button>
          )}
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
