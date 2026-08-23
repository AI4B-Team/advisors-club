import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { SETTINGS_SECTIONS } from "@/lib/settings/config";

export const Route = createFileRoute("/app/settings")({
  component: SettingsLayout,
});

function SettingsLayout() {
  const pathname = useRouterState({ select: s => s.location.pathname });
  return (
    <div className="st">
      <div className="st-head">
        <h1 className="st-title">Settings</h1>
        <p className="st-sub">One Place To Configure Your Club And Your Personal Account.</p>
      </div>
      <nav className="st-nav" aria-label="Settings Sections">
        {SETTINGS_SECTIONS.map(s => {
          const to = `/app/settings/${s.key}`;
          const on = pathname === to || (pathname === "/app/settings" && s.key === "workspace");
          return (
            <Link key={s.key} to={to} className={`st-nav-item${on ? " on" : ""}`}>
              {s.label}
            </Link>
          );
        })}
      </nav>
      <Outlet />
    </div>
  );
}
