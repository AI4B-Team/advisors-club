import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Eye, Settings2, Sparkles, Wrench, BarChart3 } from "lucide-react";
import { useViewMode } from "@/hooks/use-view-mode";
import { useNavLabel } from "@/hooks/use-nav-label";
import { getApps, patchApp, subscribeApps } from "@/lib/apps/store";
import { getUsage, statsFor, subscribeUsage, type UsageEvent } from "@/lib/apps/usage";
import { AppBuilder } from "@/components/apps/AppBuilder";
import { AppLaunchKit } from "@/components/apps/AppLaunchKit";
import { AppRunner } from "@/components/apps/AppRunner";
import { getGS, subscribeGS } from "@/lib/gs-store";
import { toAccessPolicy, type App } from "@/lib/apps/types";
import { AccessPolicyEditor } from "@/components/commerce/AccessPolicyEditor";
import { courseOptions, planOptions, programOptions } from "@/lib/commerce/catalog";
import { isPurchasable } from "@/lib/commerce";

export const Route = createFileRoute("/app/apps/$appId/edit")({
  component: AppEditPage,
  head: () => ({
    meta: [
      { title: "Edit App | Advisors Club" },
      { name: "description", content: "Configure Your App's Inputs, Formulas, Access And Pricing." },
      { property: "og:title", content: "Edit App | Advisors Club" },
      { property: "og:description", content: "Configure Your App's Inputs, Formulas, Access And Pricing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});


type Tab = "build" | "preview" | "settings" | "usage";

function AppEditPage() {
  const { appId } = useParams({ from: "/app/apps/$appId/edit" });
  const { isAdmin } = useViewMode();
  const label = useNavLabel("apps", "Apps");
  const [apps, setApps] = useState<App[]>([]);
  const [events, setEvents] = useState<UsageEvent[]>([]);
  const [accent, setAccent] = useState("#F5A623");
  const [tab, setTab] = useState<Tab>("build");

  useEffect(() => { setApps(getApps()); return subscribeApps(setApps); }, []);
  useEffect(() => { setEvents(getUsage()); return subscribeUsage(setEvents); }, []);
  useEffect(() => {
    setAccent(getGS().coverColor || "#F5A623");
    return subscribeGS(s => setAccent(s.coverColor || "#F5A623"));
  }, []);

  const app = useMemo(() => apps.find(a => a.id === appId), [apps, appId]);

  if (!isAdmin) {
    return (
      <div className="pg">
        <div className="apx-empty"><strong>Admins Only</strong><span>Switch To Admin View To Edit Apps.</span></div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="pg">
        <Link to="/app/apps" className="apx-back"><ArrowLeft size={14} /> {label}</Link>
        <div className="apx-empty"><strong>App Not Found</strong><span>It May Have Been Removed.</span></div>
      </div>
    );
  }

  const stats = statsFor(app, events);

  return (
    <div className="pg">
      <div className="apx-edit-bar">
        <Link to="/app/apps" className="apx-back"><ArrowLeft size={14} /> {label}</Link>
        <div className="apx-edit-actions">
          <Link to="/app/apps/$appId" params={{ appId: app.id }} className="apx-mini"><Eye size={13} /> Preview As Member</Link>
          <button
            className={`apx-status${app.status === "published" ? " is-live" : ""}`}
            onClick={() => patchApp(app.id, { status: app.status === "published" ? "draft" : "published" })}
          >
            {app.status === "published" ? "Published" : "Draft"}
          </button>
        </div>
      </div>

      <div className="pg-head">
        <h1 className="pg-title">{app.name}</h1>
        <p className="pg-sub">
          {app.source === "ai" ? "Drafted With AI — Every Field, Formula And Label Is Yours To Change." : "Changes Save As You Type."}
        </p>
      </div>

      <div className="apx-tabs">
        <TabBtn on={tab === "build"} onClick={() => setTab("build")}><Wrench size={13} /> Build</TabBtn>
        <TabBtn on={tab === "preview"} onClick={() => setTab("preview")}><Eye size={13} /> Preview</TabBtn>
        <TabBtn on={tab === "settings"} onClick={() => setTab("settings")}><Settings2 size={13} /> Access & Pricing</TabBtn>
        <TabBtn on={tab === "launch"} onClick={() => setTab("launch")}><Sparkles size={13} /> AI Launch Kit</TabBtn>
        <TabBtn on={tab === "usage"} onClick={() => setTab("usage")}><BarChart3 size={13} /> Usage</TabBtn>
      </div>

      {tab === "build" && <AppBuilder app={app} />}

      {tab === "preview" && (
        <div className="apx-preview-frame">
          <p className="apx-muted">This Is Exactly What A Member Sees, In Your Club's Colours.</p>
          <AppRunner app={app} accent={accent} />
        </div>
      )}

      {tab === "settings" && <SettingsTab app={app} />}

      {tab === "launch" && <AppLaunchKit app={app} />}

      {tab === "usage" && (
        <div className="apx-totals">
          <div className="apx-total"><span>Opens</span><strong>{stats.opens}</strong></div>
          <div className="apx-total"><span>Completions</span><strong>{stats.completions}</strong></div>
          <div className="apx-total"><span>Completion Rate</span><strong>{stats.completionRate}%</strong></div>
          <div className="apx-total"><span>Members Reached</span><strong>{stats.members}</strong></div>
          {isPurchasable(toAccessPolicy(app.access)) && (
            <>
              <div className="apx-total"><span>Conversions</span><strong>{stats.conversions}</strong></div>
              <div className="apx-total"><span>Revenue</span><strong>${stats.revenue.toLocaleString()}</strong></div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function TabBtn({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button className={`apx-tab${on ? " is-on" : ""}`} onClick={onClick}>{children}</button>;
}

function SettingsTab({ app }: { app: App }) {
  const appsLabel = useNavLabel("apps", "Apps");
  const plans = useMemo(() => planOptions().map(p => p.id), []);
  const courses = useMemo(() => courseOptions(), []);
  const programs = useMemo(() => programOptions(), []);

  return (
    <div className="apx-build">
      <section className="apx-build-sec">
        <h3>Access And Pricing</h3>
        <AccessPolicyEditor
          policy={toAccessPolicy(app.access)}
          onChange={next => patchApp(app.id, { access: next })}
          plans={plans}
          courses={courses}
          programs={programs}
          productNoun="App"
        />
      </section>

      <section className="apx-build-sec">
        <h3>Visibility</h3>
        <label className="apx-check-inline">
          <input
            type="checkbox"
            checked={app.listed !== false}
            onChange={e => patchApp(app.id, { listed: e.target.checked })}
          />
          Show In The {appsLabel} List
        </label>
        <p className="apx-muted">Hidden Apps Still Work For Anyone With A Direct Link — Useful For Funnels And Course Lessons.</p>
      </section>

      {app.prompt && (
        <section className="apx-build-sec">
          <h3><Sparkles size={14} /> Built From</h3>
          <p className="apx-muted">"{app.prompt}"</p>
        </section>
      )}
    </div>
  );
}

