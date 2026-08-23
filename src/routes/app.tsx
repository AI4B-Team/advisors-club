import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ViewModeProvider, useViewMode } from "@/hooks/use-view-mode";
import { RequirePermission } from "@/components/auth/RequirePermission";
import { capabilityForPath } from "@/lib/auth/permissions";
import { MemberOnboarding } from "@/components/member-onboarding/MemberOnboarding";
import { GoLiveModal } from "@/components/go-live-modal";
import { ClubCtx, useClubsFromGS, type Club } from "@/components/app-shell/club-context";
import { IconRail } from "@/components/app-shell/IconRail";
import { CommunitySidebar } from "@/components/app-shell/CommunitySidebar";
import { Topbar } from "@/components/app-shell/Topbar";
import { PathnameProvider, usePathname } from "@/components/app-shell/pathname";

export const Route = createFileRoute("/app")({
  component: AppShell,
});

function AppShell() {
  return (
    <PathnameProvider>
      <AppShellInner />
    </PathnameProvider>
  );
}

function AppShellInner() {
  const clubs = useClubsFromGS();
  const [active, setActive] = useState<Club>(clubs[0]);
  // Keep active in sync if the primary club name/color changes
  useEffect(() => {
    if (active.id === "re") setActive(clubs[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubs[0].label, clubs[0].color]);
  const [liveOpen, setLiveOpen] = useState(false);
  const [minSidebar, setMinSidebar] = useState(false);
  const pathname = usePathname();
  const hideSidebar = false;
  const fullBleed = pathname.startsWith("/app/getting-started");
  useEffect(() => {
    const onLive = () => setLiveOpen(true);
    const onMin = (e: Event) => setMinSidebar(Boolean((e as CustomEvent).detail));
    window.addEventListener("cc:go-live", onLive);
    window.addEventListener("cc:min-sidebar", onMin as EventListener);
    return () => {
      window.removeEventListener("cc:go-live", onLive);
      window.removeEventListener("cc:min-sidebar", onMin as EventListener);
    };
  }, []);
  return (
    <ViewModeProvider>
      <ClubCtx.Provider value={{ active, setActive }}>
        {fullBleed ? (
          <GuardedOutlet />
        ) : (
          <div className={`cc${hideSidebar ? " cc-no-sidebar" : ""}${minSidebar && !hideSidebar ? " cc-min-sidebar" : ""}`}>
            <IconRail />
            {!hideSidebar && <CommunitySidebar minSidebar={minSidebar} onToggleSidebar={() => setMinSidebar(m => !m)} />}
            <div className="cc-main-wrap">
              {!hideSidebar && (
                <button
                  type="button"
                  className="cc-sb-collapse"
                  aria-label={minSidebar ? "Expand Sidebar" : "Collapse Sidebar"}
                  data-tip={minSidebar ? "Expand Sidebar" : "Collapse Sidebar"}
                  onClick={() => setMinSidebar(m => !m)}
                >
                  {minSidebar ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
              )}
              <Topbar />
              <main className="cc-main">
                <GuardedOutlet />
              </main>
            </div>

            <GoLiveModal open={liveOpen} onClose={() => setLiveOpen(false)} />
            <MemberOnboardingGate />
          </div>
        )}
      </ClubCtx.Provider>
    </ViewModeProvider>
  );
}

/* ============ ADMIN ROUTE GUARD ============
   Every admin path declares the capability it needs in ROUTE_CAPABILITY, so
   the gate lives in one place instead of being re-implemented per route.
   UI-level defence in depth — RLS remains the real boundary. */
function GuardedOutlet() {
  const pathname = usePathname();
  const capability = capabilityForPath(pathname);
  if (!capability) return <Outlet />;
  return (
    <RequirePermission capability={capability}>
      <Outlet />
    </RequirePermission>
  );
}

/* ============ MEMBER ONBOARDING GATE ============ */
function MemberOnboardingGate() {
  const { isAdmin, viewAs } = useViewMode();
  if (isAdmin && !viewAs) return null;
  return <MemberOnboarding member={{ id: viewAs?.id ?? "me", name: viewAs?.name ?? "Member" }} />;
}
