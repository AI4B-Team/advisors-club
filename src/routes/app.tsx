import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Search, Bell, LogOut, ChevronDown, MessageSquare, BookOpen, Flame, Calendar, Users, BarChart3, Sparkles, Settings, Plus, Zap, UserPlus, User, CreditCard, Mail, Languages, Sun, Award, Home, Rocket, Hand, Book, MessageCircle, Hash, Bookmark, MoreHorizontal, Video, ChevronRight, Compass, Activity, LayoutDashboard, Megaphone, MessagesSquare, PlayCircle, CheckCircle2, ListChecks, Clock, History, CalendarDays, CalendarClock, CalendarCheck, UserCheck, ShieldCheck, Terminal, Lightbulb, FileClock, FolderOpen, Library, FileText, Link2, Download } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ViewModeProvider, useViewMode, SAMPLE_MEMBERS } from "@/hooks/use-view-mode";
import { AISummaryDrawer } from "@/components/ai-summary-drawer";
import { GoLiveModal } from "@/components/go-live-modal";

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
  const [liveOpen, setLiveOpen] = useState(false);
  const pathname = useRouterState({ select: s => s.location.pathname });
  const hideSidebar = pathname.startsWith("/app/account");
  useEffect(() => {
    const onLive = () => setLiveOpen(true);
    window.addEventListener("cc:go-live", onLive);
    return () => window.removeEventListener("cc:go-live", onLive);
  }, []);
  return (
    <ViewModeProvider>
      <ClubCtx.Provider value={{ active, setActive }}>
        <div className={`cc${hideSidebar ? " cc-no-sidebar" : ""}`}>
          <IconRail />
          {!hideSidebar && <CommunitySidebar />}
          <div className="cc-main-wrap">
            <Topbar />
            <main className="cc-main">
              <Outlet />
            </main>
          </div>
          <GoLiveModal open={liveOpen} onClose={() => setLiveOpen(false)} />
        </div>
      </ClubCtx.Provider>
    </ViewModeProvider>
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
      <button className="cc-rail-add" data-tip="Create Club" onClick={() => nav({ to: "/discover" })}><Plus size={18}/></button>
    </aside>
  );
}

/* ============ COMMUNITY SIDEBAR ============ */
type SubLink = { label: string; to: string; icon: ReactNode };
type TopLink = {
  label: string; to: string; icon: React.ReactNode;
  exact?: boolean; pill?: boolean;
  subs: SubLink[]; menu: string[];
};

const DEFAULT_MENU = ["Pin to top", "Mute notifications", "Mark all read", "Hide"];

const TOP_LINKS: TopLink[] = [
  { label: "Getting Started", to: "/app/dashboard", icon: <Rocket size={16}/>,
    subs: [
      {label:"Start Here",to:"/app/getting-started", icon:<PlayCircle size={14}/>},
      {label:"Say Hello",to:"/app/club/feed", icon:<Hand size={14}/>},
      {label:"Resources",to:"/app/club/courses", icon:<Book size={14}/>},
    ],
    menu: DEFAULT_MENU },
  { label: "Home", to: "/app", exact: true, pill: true, icon: <Home size={15}/>,
    subs: [
      {label:"Dashboard",to:"/app/dashboard", icon:<LayoutDashboard size={14}/>},
      {label:"Activity",to:"/app", icon:<Activity size={14}/>},
      {label:"Bookmarks",to:"/app/bookmarks", icon:<Bookmark size={14}/>},
    ],
    menu: DEFAULT_MENU },
  { label: "Community", to: "/app/club/feed", icon: <MessageSquare size={16}/>,
    subs: [
      {label:"Feed",to:"/app/club/feed", icon:<Hash size={14}/>},
      {label:"Announcements",to:"/app/club/feed", icon:<Megaphone size={14}/>},
      {label:"Discussions",to:"/app/club/feed", icon:<MessagesSquare size={14}/>},
    ],
    menu: DEFAULT_MENU },
  { label: "Courses", to: "/app/club/courses", icon: <BookOpen size={16}/>,
    subs: [
      {label:"All Courses",to:"/app/club/courses", icon:<BookOpen size={14}/>},
      {label:"In Progress",to:"/app/club/courses", icon:<Clock size={14}/>},
      {label:"Completed",to:"/app/club/courses", icon:<CheckCircle2 size={14}/>},
    ],
    menu: DEFAULT_MENU },
  { label: "Coaching", to: "/app/club/coaching", icon: <UserCheck size={16}/>,
    subs: [
      {label:"All Programs",to:"/app/club/coaching", icon:<Users size={14}/>},
      {label:"1:1 Sessions",to:"/app/club/coaching", icon:<User size={14}/>},
      {label:"Bookings",to:"/app/calendar", icon:<CalendarDays size={14}/>},
    ],
    menu: DEFAULT_MENU },
  { label: "Challenges", to: "/app/club/challenges", icon: <Flame size={16}/>,
    subs: [
      {label:"Active",to:"/app/club/challenges", icon:<Flame size={14}/>},
      {label:"Upcoming",to:"/app/club/challenges", icon:<CalendarClock size={14}/>},
      {label:"Past",to:"/app/club/challenges", icon:<History size={14}/>},
    ],
    menu: DEFAULT_MENU },
  { label: "Events", to: "/app/club/events", icon: <Calendar size={16}/>,
    subs: [
      {label:"Calendar",to:"/app/club/events", icon:<CalendarDays size={14}/>},
      {label:"Upcoming",to:"/app/club/events", icon:<CalendarClock size={14}/>},
      {label:"Past",to:"/app/club/events", icon:<CalendarCheck size={14}/>},
    ],
    menu: DEFAULT_MENU },
  { label: "Resources", to: "/app/club/resources", icon: <FolderOpen size={16}/>,
    subs: [
      {label:"Library",to:"/app/club/resources", icon:<Library size={14}/>},
      {label:"Templates",to:"/app/club/resources", icon:<FileText size={14}/>},
      {label:"Links",to:"/app/club/resources", icon:<Link2 size={14}/>},
      {label:"Downloads",to:"/app/club/resources", icon:<Download size={14}/>},
    ],
    menu: DEFAULT_MENU },

  { label: "Members", to: "/app/club/members", icon: <Users size={16}/>,
    subs: [
      {label:"All Members",to:"/app/club/members", icon:<Users size={14}/>},
      {label:"Online",to:"/app/club/members", icon:<UserCheck size={14}/>},
      {label:"Admins",to:"/app/club/members", icon:<ShieldCheck size={14}/>},
    ],
    menu: DEFAULT_MENU },
  { label: "AIVA", to: "/app/aiva", icon: <Sparkles size={16}/>, pill: false,
    subs: [
      {label:"Console",to:"/app/aiva", icon:<Terminal size={14}/>},
      {label:"Prompts",to:"/app/aiva", icon:<Lightbulb size={14}/>},
      {label:"History",to:"/app/aiva", icon:<FileClock size={14}/>},
    ],
    menu: DEFAULT_MENU },
];

const AIVA_LABEL = "AIVA";

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
  const isAiva = link.label === AIVA_LABEL;
  return (
    <div className={`cc-sb-item${isAiva ? " cc-sb-item-aiva" : ""}${expanded ? " expanded" : ""}`}>
      <div className={`cc-sb-item-row ${baseCls}-wrap`}>
        <Link
          to={link.to}
          activeOptions={link.exact ? { exact: true } : undefined}
          className={baseCls}
          activeProps={{ className: `${baseCls} on` }}
        >
          {link.pill ? <span className="cc-sb-pill-i">{link.icon}</span> : link.icon}
          <span className="cc-sb-item-l">{link.label}</span>
          {isAiva && <span className="cc-sb-badge-new">NEW</span>}
        </Link>
        <button
          className="cc-sb-add"
          aria-label={`Add to ${link.label}`}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          <Plus size={13}/>
        </button>
        <button
          className="cc-sb-caret"
          aria-label="Toggle sub-links"
          onClick={() => setExpanded(e => !e)}
        >
          <ChevronDown size={14} style={{ transform: expanded ? "rotate(180deg)" : undefined, transition: "transform .15s" }}/>
        </button>
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
      </div>
      {expanded && (
        <div className="cc-sb-subs">
          {link.subs.map(s => (
            <div key={s.label} className="cc-sb-sub-row">
              <Link to={s.to} className="cc-sb-sub" activeProps={{ className: "cc-sb-sub on" }}>
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
  return (
    <aside className="cc-sb">
      <div className="cc-sb-top" ref={ref}>
        <button className="cc-sb-switcher" onClick={() => setOpen(o => !o)}>
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
            {CLUBS.filter(c => c.label.toLowerCase().includes(query.toLowerCase())).map(c => (
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

      {TOP_LINKS.map(link => (
        <SidebarTopLink key={link.label} link={link} />
      ))}

      <div className="cc-sb-foot">
        <button className="cc-sb-live"><span className="cc-sb-live-dot"/><Video size={15}/> Start Live Session</button>
        
      </div>
    </aside>
  );
}

/* ============ TOP BAR ============ */
function Topbar() {
  const nav = useNavigate();
  const { displayName, initial, user, signOut } = useAuth();
  const { viewAs, setMode } = useViewMode();
  const pathname = useRouterState({ select: s => s.location.pathname });
  const showPostActions = pathname === "/app" || pathname === "/app/club/feed";
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const recentSearches = ["Real Estate funnel", "AIVA prompts", "Stripe Connect", "Course builder"];
  const trending = ["Live events", "Member onboarding", "Challenges"];

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
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
        <button
          className={`cc-tb-aiva${aiOpen ? " on" : ""}`}
          type="button"
          aria-label="AI Summary"
          data-tip="AI Summary"
          onClick={()=>setAiOpen(o=>!o)}
        >
          <Sparkles size={16}/>
        </button>
        {showPostActions && (
          <>
            <button className="cc-tb-golive" type="button" onClick={()=>window.dispatchEvent(new CustomEvent("cc:go-live"))}>
              <span className="cc-tb-golive-dot"/>
              <Video size={14}/> Go Live
            </button>
            <button className="cc-tb-newpost" type="button" onClick={()=>window.dispatchEvent(new CustomEvent("cc:new-post"))}>
              <Plus size={15} strokeWidth={3}/> New Post
            </button>
          </>
        )}
        <button className="cc-tb-icon" data-tip="Calendar" onClick={()=>nav({to:"/app/calendar"})}><Calendar size={16}/></button>
        <button className="cc-tb-icon" data-tip="Notifications" onClick={()=>nav({to:"/app/notifications"})}><Bell size={16}/></button>
        <button className="cc-tb-icon" data-tip="Messages" onClick={()=>nav({to:"/app/messages"})}><MessageCircle size={16}/></button>
        <button className="cc-tb-icon" data-tip="Bookmarks" onClick={()=>nav({to:"/app/bookmarks"})}><Bookmark size={16}/></button>

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
              <button className="cc-tb-menu-cta amber" onClick={()=>{setOpen(false);nav({to:"/pricing"})}}><Zap size={15} strokeWidth={3}/> Upgrade</button>
              <button className="cc-tb-menu-cta ghost" onClick={()=>{setOpen(false);nav({to:"/app/club/members"})}}><UserPlus size={15}/> Add Members</button>
              <div className="cc-tb-menu-sep" />
              <MenuItem icon={<User size={15}/>} label="Account" onClick={()=>{setOpen(false);nav({to:"/app/account"})}} />
              <MenuItem icon={<CreditCard size={15}/>} label="Subscription" right="Pro" onClick={()=>{setOpen(false);nav({to:"/app/account"})}} />

              <div className="cc-tb-menu-sep" />
              <MenuItem icon={<Languages size={15}/>} label="Language:" right="English ›" onClick={()=>{setOpen(false);nav({to:"/app/account"})}} />
              <MenuItem icon={<Sun size={15}/>} label="Theme:" right="Light ›" onClick={()=>{setOpen(false);nav({to:"/app/account"})}} />
              <button className="cc-tb-menu-logout" onClick={handleLogout}><LogOut size={15}/> Log Out</button>
            </div>
          )}
        </div>
      </div>
      <AISummaryDrawer open={aiOpen} onClose={()=>setAiOpen(false)} />
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
            <ShieldCheck size={13}/> Admin
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
