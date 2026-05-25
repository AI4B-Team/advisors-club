import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Search, Bell, LogOut, ChevronDown, MessageSquare, BookOpen, Flame, Calendar, Users, BarChart3, Sparkles, Settings, Plus, Zap, UserPlus, User, CreditCard, Mail, Languages, Sun, Award, Home, Rocket, Hand, Book, MessageCircle, Hash, Bookmark, MoreHorizontal, Video, ChevronRight, Compass } from "lucide-react";

export const Route = createFileRoute("/app")({
  component: AppShell,
});

type Club = { id: string; label: string; color: string };
const CLUBS: Club[] = [
  { id: "re", label: "Real Estate Empire", color: "#F5A623" },
  { id: "c1", label: "Coaches Circle", color: "#0EA5E9" },
  { id: "c2", label: "Creators Hub", color: "#A78BFA" },
];

const ClubCtx = createContext<{
  active: Club;
  setActive: (c: Club) => void;
}>({ active: CLUBS[0], setActive: () => {} });

function AppShell() {
  const [active, setActive] = useState<Club>(CLUBS[0]);
  return (
    <ClubCtx.Provider value={{ active, setActive }}>
      <div className="cc">
        <IconRail />
        <CommunitySidebar />
        <div className="cc-main-wrap">
          <Topbar />
          <main className="cc-main">
            <Outlet />
          </main>
        </div>
      </div>
    </ClubCtx.Provider>
  );
}

/* ============ LEFT ICON RAIL ============ */
function IconRail() {
  const nav = useNavigate();
  const { active, setActive } = useContext(ClubCtx);
  return (
    <aside className="cc-rail">
      {CLUBS.map(it => (
        <button
          key={it.id}
          className={`cc-rail-bubble ${active.id === it.id ? "on":""}`}
          data-tip={it.label}
          style={{background: it.color}}
          onClick={() => setActive(it)}
        >
          {it.label.slice(0,1)}
        </button>
      ))}
      <button className="cc-rail-add" data-tip="Create Community" onClick={() => nav({ to: "/discover" })}><Plus size={18}/></button>
    </aside>
  );
}

/* ============ COMMUNITY SIDEBAR ============ */
type SpaceLink = { label: string; icon: string; to: string; count?: number };
type SpaceGroup = { title: string; items: SpaceLink[] };

const SPACES: SpaceGroup[] = [
  {
    title: "Get Started",
    items: [
      { label: "Start Here", icon: "🏠", to: "/app/getting-started", count: 1 },
      { label: "Say Hello", icon: "👋", to: "/app/club/feed", count: 1 },
      { label: "Resources", icon: "📖", to: "/app/club/courses", count: 1 },
    ],
  },
  {
    title: "Learn",
    items: [
      { label: "Courses", icon: "📚", to: "/app/club/courses" },
      { label: "Challenges", icon: "🔥", to: "/app/club/challenges" },
      { label: "Events", icon: "📅", to: "/app/club/events" },
    ],
  },
  {
    title: "Community",
    items: [
      { label: "Members", icon: "👥", to: "/app/club/members" },
      { label: "Analytics", icon: "📊", to: "/app/club/analytics" },
      { label: "AIVA", icon: "✨", to: "/app/aiva" },
    ],
  },
];

function CommunitySidebar() {
  const { active, setActive } = useContext(ClubCtx);
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  return (
    <aside className="cc-sb">
      <div className="cc-sb-top" ref={ref}>
        <button className="cc-sb-switcher" onClick={() => setOpen(o => !o)}>
          <span className="cc-sb-name">{active.label}</span>
          <ChevronDown size={16}/>
        </button>
        {open && (
          <div className="cc-sb-switch-menu">
            <div className="cc-sb-switch-head">Your Communities</div>
            {CLUBS.map(c => (
              <button
                key={c.id}
                className={`cc-sb-switch-item ${active.id === c.id ? "on":""}`}
                onClick={() => { setActive(c); setOpen(false); }}
              >
                <span className="cc-sb-switch-dot" style={{background: c.color}}>{c.label.slice(0,1)}</span>
                <span className="cc-sb-switch-l">{c.label}</span>
                {active.id === c.id && <span className="cc-sb-switch-check">✓</span>}
              </button>
            ))}
            <div className="cc-sb-switch-sep" />
            <button className="cc-sb-switch-item" onClick={() => { setOpen(false); nav({ to: "/discover" }); }}>
              <span className="cc-sb-switch-dot ghost"><Compass size={14}/></span>
              <span className="cc-sb-switch-l">Explore Clubs</span>
            </button>
            <button className="cc-sb-switch-item" onClick={() => { setOpen(false); nav({ to: "/discover" }); }}>
              <span className="cc-sb-switch-dot ghost"><Plus size={14}/></span>
              <span className="cc-sb-switch-l">Create Club</span>
            </button>
          </div>
        )}
      </div>

      <Link to="/app/dashboard" className="cc-sb-pill" activeProps={{className:"cc-sb-pill on"}}>
        <span className="cc-sb-pill-i"><Rocket size={15}/></span>
        Getting Started
      </Link>

      <Link to="/app" activeOptions={{ exact: true }} className="cc-sb-feed" activeProps={{className:"cc-sb-feed on"}}>
        <Home size={16}/> Home
      </Link>

      <Link to="/app/club/feed" className="cc-sb-feed" activeProps={{className:"cc-sb-feed on"}}>
        <MessageSquare size={16}/> Community
      </Link>

      {SPACES.map(group => (
        <div key={group.title} className="cc-sb-group">
          <div className="cc-sb-group-t">{group.title}</div>
          {group.items.map(it => (
            <Link key={it.label+it.to} to={it.to} className="cc-sb-row" activeProps={{className:"cc-sb-row on"}}>
              <span className="cc-sb-row-emoji">{it.icon}</span>
              <span className="cc-sb-row-l">{it.label}</span>
              {it.count != null && <span className="cc-sb-row-c">{it.count}</span>}
            </Link>
          ))}
        </div>
      ))}

      <div className="cc-sb-foot">
        <button className="cc-sb-live"><Video size={15}/> Go Live</button>
        <div className="cc-sb-powered">Powered by AdvisorsClub</div>
      </div>
    </aside>
  );
}

/* ============ TOP BAR ============ */
function Topbar() {
  const nav = useNavigate();
  const pathname = useRouterState({ select: s => s.location.pathname });
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const isHome = pathname === "/app/dashboard" || pathname === "/app/club/feed";
  const isCourses = pathname.startsWith("/app/club/courses");

  return (
    <header className="cc-tb">

      <nav className="cc-tb-tabs">
        <button className={`cc-tb-tab ${isHome ? "on":""}`} onClick={()=>nav({to:"/app/dashboard"})}>Home</button>
        <button className={`cc-tb-tab ${isCourses ? "on":""}`} onClick={()=>nav({to:"/app/club/courses"})}>Courses</button>
        <div className="cc-tb-more-wrap" ref={moreRef}>
          <button className="cc-tb-tab" onClick={()=>setMoreOpen(o=>!o)}>More <ChevronDown size={13}/></button>
          {moreOpen && (
            <div className="cc-tb-more-menu">
              <button onClick={()=>{setMoreOpen(false);nav({to:"/app/club/events"})}}><Calendar size={14}/> Events</button>
              <button onClick={()=>{setMoreOpen(false);nav({to:"/app/club/challenges"})}}><Flame size={14}/> Challenges</button>
              <button onClick={()=>{setMoreOpen(false);nav({to:"/app/club/members"})}}><Users size={14}/> Members</button>
              <button onClick={()=>{setMoreOpen(false);nav({to:"/app/club/analytics"})}}><BarChart3 size={14}/> Analytics</button>
              <button onClick={()=>{setMoreOpen(false);nav({to:"/app/club/settings"})}}><Settings size={14}/> Settings</button>
            </div>
          )}
        </div>
      </nav>

      <div className="cc-tb-search">
        <Search size={14}/>
        <input placeholder="Search" />
      </div>

      <div className="cc-tb-right">
        <button className="cc-tb-icon" title="Notifications"><Bell size={16}/></button>
        <button className="cc-tb-icon" title="Messages"><MessageCircle size={16}/></button>
        <button className="cc-tb-icon" title="Bookmarks"><Bookmark size={16}/></button>

        <div className="cc-tb-pf" ref={ref}>
          <button className="cc-tb-av" onClick={()=>setOpen(o=>!o)} aria-label="Account">Z</button>
          {open && (
            <div className="cc-tb-menu">
              <div className="cc-tb-menu-head">
                <span className="cc-tb-menu-av">Z</span>
                <div>
                  <div className="cc-tb-menu-n">Zaddy</div>
                  <div className="cc-tb-menu-e">zaddy@advisorsclub.com</div>
                </div>
              </div>
              <button className="cc-tb-menu-cta amber" onClick={()=>{setOpen(false);nav({to:"/pricing"})}}><Zap size={15} strokeWidth={3}/> Upgrade</button>
              <button className="cc-tb-menu-cta ghost" onClick={()=>{setOpen(false);nav({to:"/app/club/members"})}}><UserPlus size={15}/> Add Members</button>
              <div className="cc-tb-menu-sep" />
              <MenuItem icon={<User size={15}/>} label="Account" onClick={()=>{setOpen(false);nav({to:"/app/account"})}} />
              <MenuItem icon={<CreditCard size={15}/>} label="Subscription" right="Pro" onClick={()=>{setOpen(false);nav({to:"/app/account"})}} />
              <MenuItem icon={<Mail size={15}/>} label="Invites" onClick={()=>{setOpen(false);nav({to:"/app/club/members"})}} />
              <div className="cc-tb-menu-sep" />
              <MenuItem icon={<Languages size={15}/>} label="Language:" right="English ›" onClick={()=>{setOpen(false);nav({to:"/app/account"})}} />
              <MenuItem icon={<Sun size={15}/>} label="Theme:" right="Light ›" onClick={()=>{setOpen(false);nav({to:"/app/account"})}} />
              <button className="cc-tb-menu-logout" onClick={()=>{setOpen(false);nav({to:"/"})}}><LogOut size={15}/> Log Out</button>
            </div>
          )}
        </div>
      </div>
    </header>
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
