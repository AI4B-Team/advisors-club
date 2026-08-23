import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Search, Bell, LogOut, ChevronDown, MessageSquare, BookOpen, Flame, Calendar, Users, BarChart3, Sparkles, Settings, Plus, Zap, UserPlus, User, CreditCard, Mail, Languages, Sun, Award, Home, Rocket, Hand, Book, MessageCircle, Hash, Bookmark, MoreHorizontal, Video, ChevronRight, Compass, Activity, LayoutDashboard, Megaphone, MessagesSquare, PlayCircle, CheckCircle2, ListChecks, Clock, History, CalendarDays, CalendarClock, CalendarCheck, UserCheck, ShieldCheck, Terminal, Lightbulb, FileClock, FolderOpen, Library, FileText, Link2, Download, Palette, LayoutGrid, Globe, HelpCircle, Route as RouteIcon, MessageSquarePlus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ViewModeProvider, useViewMode, SAMPLE_MEMBERS } from "@/hooks/use-view-mode";
import { AivaCommandPalette } from "@/components/aiva/AivaCommandPalette";
import { useAivaAttention } from "@/hooks/use-aiva-attention";
import { MemberAssistantPanel } from "@/components/member-ai/MemberAssistant";
import { PersonaAssistantPanel } from "@/components/persona/PersonaAssistant";
import { usePersona } from "@/hooks/use-persona";
import { MemberOnboarding } from "@/components/member-onboarding/MemberOnboarding";
import { useMemberAi } from "@/hooks/use-member-ai";
import { displayName as memberAiName } from "@/lib/member-ai";
import { AISummaryDrawer } from "@/components/ai-summary-drawer";
import { GoLiveModal } from "@/components/go-live-modal";
import { BUILD_WITH_AI_NAV, ONBOARDING_NAV, SYSTEM_NAV, type NavItem } from "@/lib/nav/config";
import { getNavConfig, groupNav, subscribeNav, visibleNav } from "@/lib/nav/store";
import { NavIcon } from "@/lib/nav/icons";

export const Route = createFileRoute("/app")({
  component: AppShell,
});

import { getGS, subscribeGS } from "@/lib/gs-store";

type Club = { id: string; label: string; color: string };
const STATIC_CLUBS: Club[] = [
  { id: "c1", label: "Coaches Circle", color: "#0EA5E9" },
  { id: "c2", label: "Creators Hub", color: "#A78BFA" },
];

const ClubCtx = createContext<{
  active: Club;
  setActive: (c: Club) => void;
}>({ active: STATIC_CLUBS[0], setActive: () => {} });

function useClubsFromGS(): Club[] {
  const [gs, setGsState] = useState(() => ({ clubName: "Your Club", coverColor: "#F5A623" }));
  useEffect(() => {
    setGsState(getGS());
    return subscribeGS(setGsState);
  }, []);
  return [
    { id: "re", label: gs.clubName || "Your Club", color: gs.coverColor || "#F5A623" },
    ...STATIC_CLUBS,
  ];
}

function AppShell() {
  const clubs = useClubsFromGS();
  const [active, setActive] = useState<Club>(clubs[0]);
  // Keep active in sync if the primary club name/color changes
  useEffect(() => {
    if (active.id === "re") setActive(clubs[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubs[0].label, clubs[0].color]);
  const [liveOpen, setLiveOpen] = useState(false);
  const [minSidebar, setMinSidebar] = useState(false);
  const pathname = useRouterState({ select: s => s.location.pathname });
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
          <Outlet />
        ) : (
          <div className={`cc${hideSidebar ? " cc-no-sidebar" : ""}${minSidebar && !hideSidebar ? " cc-min-sidebar" : ""}`}>
            <IconRail />
            {!hideSidebar && <CommunitySidebar />}
            <div className="cc-main-wrap">
              <Topbar />
              <main className="cc-main">
                <Outlet />
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


/* ============ MEMBER ONBOARDING GATE ============ */
function MemberOnboardingGate() {
  const { isAdmin, viewAs } = useViewMode();
  if (isAdmin && !viewAs) return null;
  return <MemberOnboarding member={{ id: viewAs?.id ?? "me", name: viewAs?.name ?? "Member" }} />;
}

/* ============ LEFT ICON RAIL ============ */
function IconRail() {
  const nav = useNavigate();
  const { active, setActive } = useContext(ClubCtx);
  const clubs = useClubsFromGS();
  return (
    <aside className="cc-rail">
      {clubs.map((it: Club) => (
        <button
          key={it.id}
          className={`cc-rail-bubble ${active.id === it.id ? "on":""}`}
          data-tip={it.label}
          style={{background: it.color}}
          onClick={() => {
            const isActive = active.id === it.id;
            setActive(it);
            // Only navigate home when clicking the already-active club icon,
            // or when switching to a different club. Stay on current page otherwise.
            if (isActive) nav({ to: "/app" });
          }}
        >
          {it.label.slice(0,1)}
        </button>
      ))}
      <button className="cc-rail-add" data-tip="Create Club" onClick={() => nav({ to: "/discover" })}><Plus size={18}/></button>
    </aside>
  );
}

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

function CommunitySidebar() {
  const { active, setActive } = useContext(ClubCtx);
  const nav = useNavigate();
  const clubs = useClubsFromGS();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

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
      <div className="cc-sb-top" ref={ref}>
        <button className="cc-sb-switcher" onClick={() => setOpen(o => !o)}>
          <span className="cc-sb-mini" style={{background: active.color}}>{active.label.slice(0,1)}</span>
          <span className="cc-sb-name">{active.label}</span>
          <ChevronDown size={16}/>
        </button>
        {open && (
          <div className="cc-sb-switch-menu">
            <div className="cc-sb-switch-search">
              <Search size={14}/>
              <input
                placeholder="Search clubs"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>
            <button className="cc-sb-switch-item" onClick={() => { setOpen(false); nav({ to: "/discover" }); }}>
              <span className="cc-sb-switch-dot ghost"><Compass size={14}/></span>
              <span className="cc-sb-switch-l">Explore Clubs</span>
            </button>
            <button className="cc-sb-switch-item" onClick={() => { setOpen(false); nav({ to: "/discover" }); }}>
              <span className="cc-sb-switch-dot ghost"><Plus size={14}/></span>
              <span className="cc-sb-switch-l">Create Club</span>
            </button>
            <div className="cc-sb-switch-sep" />
            <div className="cc-sb-switch-head">Your Clubs</div>
            {clubs.filter((c: Club) => c.label.toLowerCase().includes(query.toLowerCase())).map((c: Club) => (
              <button
                key={c.id}
                className={`cc-sb-switch-item ${active.id === c.id ? "on":""}`}
                onClick={() => { setActive(c); setOpen(false); setQuery(""); }}
              >
                <span className="cc-sb-switch-dot" style={{background: c.color}}>{c.label.slice(0,1)}</span>
                <span className="cc-sb-switch-l">{c.label}</span>
                {active.id === c.id && <span className="cc-sb-switch-check">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

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

/* ============ TOP BAR ============ */
function Topbar() {
  const nav = useNavigate();
  const { displayName, initial, user, signOut } = useAuth();
  const { viewAs, setMode, isAdmin } = useViewMode();
  const memberAi = useMemberAi();
  const assistantName = memberAiName(memberAi);
  const pathname = useRouterState({ select: s => s.location.pathname });
  const showPostActions = pathname === "/app" || pathname === "/app/club/feed";
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const attention = useAivaAttention(isAdmin && !viewAs);
  const [briefingOn, setBriefingOn] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const persona = usePersona();
  const isAdminRef = useRef(true);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const helpRef = useRef<HTMLDivElement>(null);

  isAdminRef.current = isAdmin;

  const recentSearches = ["Real Estate Funnel", "AIVA Prompts", "Stripe Connect", "Course Builder"];
  const trending = ["Live Events", "Member Onboarding", "Challenges"];

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (helpRef.current && !helpRef.current.contains(e.target as Node)) setHelpOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isAdminRef.current) setCmdOpen(o => !o); else setAskOpen(o => !o);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function handleLogout() {
    setOpen(false);
    await signOut();
    nav({ to: "/" });
  }

  return (
    <header className="cc-tb">
      <div className="cc-tb-search" ref={searchRef}>
        <Search size={14}/>
        <input
          placeholder="Search"
          value={query}
          onChange={(e)=>setQuery(e.target.value)}
          onFocus={()=>setSearchOpen(true)}
        />
        <button
          type="button"
          className="cc-tb-search-caret"
          aria-label="Show recent searches"
          onClick={()=>setSearchOpen(o=>!o)}
        >
          <ChevronDown size={14}/>
        </button>
        {searchOpen && (
          <div className="cc-tb-search-menu">
            <div className="cc-tb-search-head">Recent</div>
            {recentSearches.map(s => (
              <button key={s} className="cc-tb-search-item" onClick={()=>{setQuery(s);setSearchOpen(false);}}>
                <Search size={13}/> <span>{s}</span>
              </button>
            ))}
            <div className="cc-tb-search-sep" />
            <div className="cc-tb-search-head">Trending</div>
            {trending.map(s => (
              <button key={s} className="cc-tb-search-item" onClick={()=>{setQuery(s);setSearchOpen(false);}}>
                <Sparkles size={13}/> <span>{s}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="cc-tb-right">
        {isAdmin ? (
          <button
            className={`cc-tb-ask${cmdOpen ? " on" : ""}${attention.hasAttention ? " has-att" : ""}`}
            type="button"
            aria-label={attention.hasAttention ? `Ask AI — ${attention.headline}` : "Ask AI"}
            data-tip={attention.hasAttention ? attention.headline : "Ask AI"}
            onClick={()=>{
              if (cmdOpen) { setCmdOpen(false); return; }
              setBriefingOn(attention.hasAttention);
              setCmdOpen(true);
            }}
          >
            <Sparkles size={15}/>
            <span className="cc-tb-ask-l">Ask AI</span>
            {attention.hasAttention
              ? <span className="cc-tb-ask-att">{attention.count}</span>
              : <kbd className="cc-tb-ask-k">⌘K</kbd>}
          </button>
        ) : (
          <button
            className={`cc-tb-ask member${askOpen ? " on" : ""}`}
            type="button"
            aria-label={`Ask ${assistantName}`}
            data-tip={`Ask ${assistantName} — AI Assistant`}
            onClick={()=>setAskOpen(o=>!o)}
          >
            <Sparkles size={15}/>
            <span className="cc-tb-ask-l">Ask {assistantName}</span>
            <kbd className="cc-tb-ask-k">AI</kbd>
          </button>
        )}
        {/* Admin machinery stays out of the member top bar. */}
        {isAdmin && !viewAs && (
          <>
            <button
              className={`cc-tb-aiva${aiOpen ? " on" : ""}`}
              type="button"
              aria-label="AI Summary"
              data-tip="AI Summary"
              onClick={()=>setAiOpen(o=>!o)}
            >
              <Sparkles size={16}/>
            </button>
            <button className="cc-tb-golive quiet" type="button" data-tip="Go Live" onClick={()=>window.dispatchEvent(new CustomEvent("cc:go-live"))}>
              <Video size={14}/> Go Live
            </button>
          </>
        )}
        {showPostActions && (
          <button className="cc-tb-newpost" type="button" onClick={()=>window.dispatchEvent(new CustomEvent("cc:new-post"))}>
            <Plus size={15} strokeWidth={3}/> New Post
          </button>
        )}
        <div className="cc-tb-pf" ref={helpRef}>
          <button className="cc-tb-icon" data-tip="Help" aria-label="Help" onClick={()=>{setHelpOpen(o=>!o);setOpen(false);}}><HelpCircle size={16}/></button>
          {helpOpen && (
            <div className="cc-tb-menu" style={{minWidth:200}}>
              <MenuItem icon={<HelpCircle size={15}/>} label="Help" onClick={()=>{setHelpOpen(false);nav({to:"/app/getting-started"})}} />
              <MenuItem icon={<RouteIcon size={15}/>} label="Tour" onClick={()=>{setHelpOpen(false);window.dispatchEvent(new CustomEvent("cc:start-tour"))}} />
              <MenuItem icon={<BookOpen size={15}/>} label="Tutorials" onClick={()=>{setHelpOpen(false);nav({to:"/app/club/resources"})}} />
              <MenuItem icon={<MessageSquarePlus size={15}/>} label="Feedback" onClick={()=>{setHelpOpen(false);window.dispatchEvent(new CustomEvent("cc:feedback"))}} />
            </div>
          )}
        </div>
        <button className="cc-tb-icon" data-tip="Notifications" onClick={()=>nav({to:"/app/notifications"})}><Bell size={16}/></button>
        <button className="cc-tb-icon" data-tip="Messages" onClick={()=>nav({to:"/app/messages"})}><MessageCircle size={16}/></button>


        <div className="cc-tb-pf" ref={ref}>
          <button className="cc-tb-av" onClick={()=>setOpen(o=>!o)} aria-label="Account">
            {viewAs ? <img src={viewAs.avatar} alt="" /> : initial}
          </button>
          {open && (
            <div className="cc-tb-menu">
              {viewAs && (
                <div className="cc-tb-menu-viewbar">
                  Viewing As: <strong>{viewAs.name}</strong>
                  <button onClick={()=>{setMode("admin");}}>Exit</button>
                </div>
              )}
              <div className="cc-tb-menu-head">
                <span className="cc-tb-menu-av">
                  {viewAs ? <img src={viewAs.avatar} alt="" /> : initial}
                </span>
                <div>
                  <div className="cc-tb-menu-n">{viewAs ? viewAs.name : (displayName || "Guest")}</div>
                  <div className="cc-tb-menu-e">{viewAs ? viewAs.email : (user?.email ?? "")}</div>
                </div>
              </div>
              <button className="cc-tb-menu-cta amber" onClick={()=>{setOpen(false);nav({to:"/", hash:"pricing"})}}><Zap size={15} strokeWidth={3}/> Upgrade</button>

              <div className="cc-tb-menu-sep" />
              <MenuItem icon={<User size={15}/>} label="Account" onClick={()=>{setOpen(false);nav({to:"/app/settings/$section",params:{section:"workspace"}})}} />
              <MenuItem icon={<CreditCard size={15}/>} label="Subscription" right="Pro" onClick={()=>{setOpen(false);nav({to:"/app/settings/$section",params:{section:"billing"}})}} />
              <MenuItem icon={<Calendar size={15}/>} label="Calendar" onClick={()=>{setOpen(false);nav({to:"/app/calendar"})}} />
              <MenuItem icon={<Bookmark size={15}/>} label="Bookmarks" onClick={()=>{setOpen(false);nav({to:"/app/bookmarks"})}} />

              <div className="cc-tb-menu-sep" />
              <MenuItem icon={<Languages size={15}/>} label="Language:" right="English ›" onClick={()=>{setOpen(false);nav({to:"/app/settings/$section",params:{section:"preferences"}})}} />
              <MenuItem icon={<Sun size={15}/>} label="Theme:" right="Light ›" onClick={()=>{setOpen(false);nav({to:"/app/settings/$section",params:{section:"preferences"}})}} />
              <button className="cc-tb-menu-logout" onClick={handleLogout}><LogOut size={15}/> Log Out</button>
            </div>
          )}
        </div>
      </div>
      <AISummaryDrawer open={aiOpen} onClose={()=>setAiOpen(false)} />
      <AivaCommandPalette
        open={cmdOpen}
        onClose={()=>{ if (briefingOn) attention.acknowledgeAll(); setBriefingOn(false); setCmdOpen(false); }}
        briefing={briefingOn ? { greeting: attention.greeting, headline: attention.headline, items: attention.items, overflow: attention.overflow } : null}
      />
      {persona.enabled ? (
        <PersonaAssistantPanel
          open={askOpen}
          onClose={()=>setAskOpen(false)}
          me={{ id: viewAs?.id ?? "me", name: viewAs?.name ?? (displayName || "Member") }}
        />
      ) : (
        <MemberAssistantPanel
          open={askOpen}
          onClose={()=>setAskOpen(false)}
          me={{ id: viewAs?.id ?? "me", name: viewAs?.name ?? (displayName || "Member") }}
        />
      )}
    </header>
  );
}

function ViewModeToggle() {
  const { mode, setMode, viewAs, setViewAs } = useViewMode();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const isAdmin = mode === "admin";
  const filtered = SAMPLE_MEMBERS.filter(m =>
    m.name.toLowerCase().includes(q.toLowerCase()) ||
    m.role.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div className="cc-tb-vw" ref={ref}>
      <button
        className={`cc-tb-vw-trigger ${isAdmin ? "admin" : "member"}`}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="cc-tb-vw-label">VIEW</span>
        {isAdmin ? (
          <span className="cc-tb-vw-current admin">
            <ShieldCheck size={13}/> <span>Admin</span>
          </span>
        ) : (
          <span className="cc-tb-vw-current member">
            {viewAs ? (
              <img src={viewAs.avatar} alt="" className="cc-tb-vw-av"/>
            ) : (
              <User size={13}/>
            )}
            <span>{viewAs ? viewAs.name.split(" ")[0] : "Member"}</span>
          </span>
        )}
        <ChevronDown size={12} className="cc-tb-vw-caret"/>
      </button>
      {open && (
        <div className="cc-tb-vw-menu" role="menu">
          <button
            className={`cc-tb-vw-opt ${isAdmin ? "on" : ""}`}
            onClick={() => { setMode("admin"); setViewAs(null); setOpen(false); }}
          >
            <span className="cc-tb-vw-opt-ic admin"><ShieldCheck size={14}/></span>
            <span className="cc-tb-vw-opt-meta">
              <span className="cc-tb-vw-opt-n">Admin</span>
              <span className="cc-tb-vw-opt-r">Full Access</span>
            </span>
            {isAdmin && <span className="cc-tb-vw-opt-check">✓</span>}
          </button>
          <button
            className={`cc-tb-vw-opt ${!isAdmin && !viewAs ? "on" : ""}`}
            onClick={() => { setViewAs(null); setMode("member"); setOpen(false); }}
          >
            <span className="cc-tb-vw-opt-ic" style={{background:"#E5E7EB",color:"#374151"}}><User size={14}/></span>
            <span className="cc-tb-vw-opt-meta">
              <span className="cc-tb-vw-opt-n">Member</span>
              <span className="cc-tb-vw-opt-r">Default Member View</span>
            </span>
            {!isAdmin && !viewAs && <span className="cc-tb-vw-opt-check">✓</span>}
          </button>
          <div className="cc-tb-vw-sep"/>
          <div className="cc-tb-vw-section">View as specific member</div>
          <div className="cc-tb-vw-search">
            <Search size={13}/>
            <input
              autoFocus
              placeholder="Search Members"
              value={q}
              onChange={(e)=>setQ(e.target.value)}
            />
          </div>
          <div className="cc-tb-vw-list">
            {filtered.length === 0 && (
              <div className="cc-tb-vw-empty">No members found</div>
            )}
            {filtered.map(m => (
              <button
                key={m.id}
                className={`cc-tb-vw-item ${viewAs?.id === m.id ? "on" : ""}`}
                onClick={()=>{ setViewAs(m); setMode("member"); setOpen(false); setQ(""); }}
              >
                <img src={m.avatar} alt="" />
                <div className="cc-tb-vw-item-meta">
                  <div className="cc-tb-vw-item-n">{m.name}</div>
                  <div className="cc-tb-vw-item-r">{m.role}</div>
                </div>
                {viewAs?.id === m.id && <span className="cc-tb-vw-item-check">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}




function MenuItem({ icon, label, right, onClick }: { icon: React.ReactNode; label: string; right?: string; onClick?: () => void }) {
  return (
    <button className="cc-tb-menu-item" onClick={onClick}>
      <span className="cc-tb-menu-i">{icon}</span>
      <span className="cc-tb-menu-l">{label}</span>
      {right && <span className="cc-tb-menu-r">{right}</span>}
    </button>
  );
}
