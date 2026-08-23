import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Lock, Pencil } from "lucide-react";
import { useViewMode } from "@/hooks/use-view-mode";
import { useNavLabel } from "@/hooks/use-nav-label";
import { getApps, subscribeApps } from "@/lib/apps/store";
import { canAccess } from "@/lib/apps/access";
import { recordUsage } from "@/lib/apps/usage";
import { AppRunner } from "@/components/apps/AppRunner";
import { getGS, subscribeGS } from "@/lib/gs-store";
import { accessLabel, type App } from "@/lib/apps/types";

export const Route = createFileRoute("/app/apps/$appId/")({
  component: AppRunPage,
  head: () => ({
    meta: [
      { title: "Open App | Advisors Club" },
      { name: "description", content: "Use An Interactive Tool Built By Your Club Host." },
      { property: "og:title", content: "Open App | Advisors Club" },
      { property: "og:description", content: "Use An Interactive Tool Built By Your Club Host." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

/**
 * The member experience for a single app. It renders inside the community
 * shell with the club's own accent colour and typography, so a tool never
 * reads as embedded third-party software.
 */
function AppRunPage() {
  const { appId } = useParams({ from: "/app/apps/$appId/" });
  const { isAdmin, viewAs } = useViewMode();
  const label = useNavLabel("apps", "Apps");
  const [apps, setApps] = useState<App[]>([]);
  const [accent, setAccent] = useState("#F5A623");

  useEffect(() => { setApps(getApps()); return subscribeApps(setApps); }, []);
  useEffect(() => {
    setAccent(getGS().coverColor || "#F5A623");
    return subscribeGS(s => setAccent(s.coverColor || "#F5A623"));
  }, []);

  const app = useMemo(() => apps.find(a => a.id === appId), [apps, appId]);
  const previewing = isAdmin && !viewAs;
  const memberId = viewAs?.id ?? "me";
  const memberName = viewAs?.name ?? "You";

  useEffect(() => {
    if (app && !previewing) recordUsage({ appId: app.id, memberId, memberName, kind: "opened" });
  }, [app?.id, previewing]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!app) {
    return (
      <div className="pg">
        <BackLink label={label} />
        <div className="apx-empty"><strong>App Not Found</strong><span>It May Have Been Removed.</span></div>
      </div>
    );
  }

  const allowed = canAccess(app.access, {
    isAdmin: previewing,
    membership: viewAs?.role.includes("Founding") ? "Founding" : "Pro",
    paid: true,
  });

  if (!allowed) {
    return (
      <div className="pg">
        <BackLink label={label} />
        <div className="apx-empty">
          <Lock size={18} />
          <strong>{app.name} Is Locked</strong>
          <span>This Tool Is Available To {accessLabel(app.access)}.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="pg">
      <div className="apx-run-bar">
        <BackLink label={label} />
        {previewing && (
          <div className="apx-preview-note">
            <span>Previewing As A Member</span>
            <Link to="/app/apps/$appId/edit" params={{ appId: app.id }} className="apx-mini"><Pencil size={13} /> Edit</Link>
          </div>
        )}
      </div>

      <AppRunner
        app={app}
        accent={accent}
        onComplete={() => { if (!previewing) recordUsage({ appId: app.id, memberId, memberName, kind: "completed" }); }}
      />
    </div>
  );
}

function BackLink({ label }: { label: string }) {
  return <Link to="/app/apps" className="apx-back"><ArrowLeft size={14} /> {label}</Link>;
}
