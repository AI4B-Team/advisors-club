import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronDown, MoreHorizontal, Plus } from "lucide-react";
import { useViewMode } from "@/hooks/use-view-mode";
import { BUILD_WITH_AI_NAV, ONBOARDING_NAV, SYSTEM_NAV, type NavItem } from "@/lib/nav/config";
import { getNavConfig, groupNav, subscribeNav, visibleNav } from "@/lib/nav/store";
import { NavIcon } from "@/lib/nav/icons";
import { getGS, subscribeGS } from "@/lib/gs-store";
import { ClubSwitcher } from "./ClubSwitcher";
import { ViewModeToggle } from "./ViewModeToggle";

/* ============ COMMUNITY SIDEBAR ============ */
type SubLink = { label: string; to: string; icon: ReactNode; hash?: string };
type TopLink = {
  id: string;
  label: string; to: string; icon: React.ReactNode;
  exact?: boolean; pill?: boolean; system?: boolean; external?: boolean;
  subs: SubLink[]; menu: string[];
};

function toTopLink(item: NavItem): TopLink {
  return {
    id: item.id,
    label: item.label,
    to: item.to,
    icon: <NavIcon name={item.icon} size={item.pill ? 15 : 16} />,
    exact: item.exact,
    pill: item.pill,
    system: item.section === "system",
    external: item.type === "link",
    subs: item.subs.map(s => ({ label: s.label, to: s.to, hash: s.hash, icon: <NavIcon name={s.icon} size={14} /> })),
    menu: item.menu,
  };
}

function SidebarTopLink({ link }: { link: TopLink }) {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const baseCls = link.pill ? "cc-sb-pill" : "cc-sb-feed";
  const isSystem = Boolean(link.system);
  const hasSubs = link.subs.length > 0;
  return (
    <div className={`cc-sb-item${isSystem ? " cc-sb-item-sys" : ""}${expanded ? " expanded" : ""}`}>
      <div className={`cc-sb-item-row ${baseCls}-wrap`}>
        {link.external ? (
          <a href={link.to} target="_blank" rel="noreferrer" className={baseCls} data-tip={link.label}>
            {link.pill ? <span className="cc-sb-pill-i">{link.icon}</span> : link.icon}
            <span className="cc-sb-item-l">{link.label}</span>
          </a>
        ) : (
        <Link
          to={link.to}
          activeOptions={link.exact ? { exact: true } : undefined}
          className={baseCls}
          activeProps={{ className: `${baseCls} on` }}
          data-tip={link.label}
          onClick={() => {
            if (link.to === "/app/club/courses" && typeof window !== "undefined") {
              window.sessionStorage.removeItem("admin-course-sel");
              window.sessionStorage.removeItem("admin-course-lesson");
              window.sessionStorage.removeItem("member-course-sel");
              window.dispatchEvent(new Event("courses:home"));
            }
          }}
        >
          {link.pill ? <span className="cc-sb-pill-i">{link.icon}</span> : link.icon}
          <span className="cc-sb-item-l">{link.label}</span>
        </Link>
        )}

        {hasSubs && (
          <button
            className="cc-sb-caret"
            aria-label="Toggle sub-links"
            onClick={() => setExpanded(e => !e)}
          >
            <ChevronDown size={14} style={{ transform: expanded ? "rotate(180deg)" : undefined, transition: "transform .15s" }}/>
          </button>
        )}
        {!isSystem && link.menu.length > 0 && (
          <div className="cc-sb-more-wrap" ref={menuRef}>
            <button
              className="cc-sb-more"
              aria-label="More options"
              onClick={() => setMenuOpen(o => !o)}
            >
              <MoreHorizontal size={14}/>
            </button>
            {menuOpen && (
              <div className="cc-sb-more-menu">
                {link.menu.map(m => (
                  <button key={m} className="cc-sb-more-item" onClick={() => setMenuOpen(false)}>{m}</button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {expanded && (

        <div className="cc-sb-subs">
          {link.subs.map(s => (
            <div key={s.label} className="cc-sb-sub-row">
              <Link to={s.to} hash={s.hash} className="cc-sb-sub" activeProps={{ className: "cc-sb-sub on" }}>
                <span className="cc-sb-sub-i">{s.icon}</span>
                <span className="cc-sb-sub-l">{s.label}</span>
              </Link>
              <button className="cc-sb-sub-add" aria-label={`Add to ${s.label}`} onClick={(e)=>e.preventDefault()}>
                <Plus size={13}/>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CommunitySidebar({ minSidebar, onToggleSidebar }: { minSidebar: boolean; onToggleSidebar: () => void }) {
  void minSidebar; void onToggleSidebar;
  // Navigation is fully data-driven from the admin-editable community nav config.
  const { isAdmin } = useViewMode();
  const [navItems, setNavItems] = useState<NavItem[]>(() => getNavConfig().items);
  useEffect(() => {
    const read = () => setNavItems(getNavConfig().items);
    read();
    return subscribeNav(read);
  }, []);
  const memberGroups = useMemo(
    () => groupNav(visibleNav(navItems).filter(i => i.visibility !== "admins" || isAdmin)),
    [navItems, isAdmin],
  );
  const systemNav = useMemo(() => SYSTEM_NAV.map(toTopLink), []);

  const [setupComplete, setSetupComplete] = useState(true);
  useEffect(() => {
    const read = () => setSetupComplete(Boolean(getGS().quickstartCompleted));
    read();
    return subscribeGS(read);
  }, []);

  return (
    <aside className="cc-sb">
      <ClubSwitcher />

      <ViewModeToggle />

      <div className="cc-sb-onboarding">
        <SidebarTopLink link={toTopLink(setupComplete ? BUILD_WITH_AI_NAV : ONBOARDING_NAV)} />
      </div>

      {memberGroups.map((g, gi) => (
        <div key={gi} className="cc-sb-group">
          {g.group && <div className="cc-sb-group-label">{g.group}</div>}
          {g.items.map(item => (
            <SidebarTopLink key={item.id} link={toTopLink(item)} />
          ))}
        </div>
      ))}


      <div className="cc-sb-sys">
        <div className="cc-sb-sys-label">Admin</div>
        {systemNav.map(link => (
          <SidebarTopLink key={link.id} link={link} />
        ))}
      </div>

    </aside>
  );
}
