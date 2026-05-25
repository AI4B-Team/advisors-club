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
  const pathname = useRouterState({ select: s => s.location.pathname });
  const hideSidebar = pathname.startsWith("/app/account");
  return (
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
type SubLink = { label: string; to: string };
type TopLink = {
  label: string; to: string; icon: React.ReactNode;
  exact?: boolean; pill?: boolean;
  subs: SubLink[]; menu: string[];
};

const DEFAULT_MENU = ["Pin to top", "Mute notifications", "Mark all read", "Hide"];

const TOP_LINKS: TopLink[] = [
  { label: "Home", to: "/app", exact: true, pill: true, icon: <Home size={15}/>,
    subs: [{label:"Dashboard",to:"/app/dashboard"},{label:"Activity",to:"/app"},{label:"Bookmarks",to:"/app/bookmarks"}],
    menu: DEFAULT_MENU },
  { label: "Getting Started", to: "/app/dashboard", icon: <Rocket size={16}/>,
    subs: [{label:"Start Here",to:"/app/getting-started"},{label:"Say Hello",to:"/app/club/feed"},{label:"Resources",to:"/app/club/courses"}],
    menu: DEFAULT_MENU },
  { label: "Community", to: "/app/club/feed", icon: <MessageSquare size={16}/>,
    subs: [{label:"Feed",to:"/app/club/feed"},{label:"Announcements",to:"/app/club/feed"},{label:"Discussions",to:"/app/club/feed"}],
    menu: DEFAULT_MENU },
  { label: "Courses", to: "/app/club/courses", icon: <span className="cc-sb-row-emoji">📚</span>,
    subs: [{label:"All Courses",to:"/app/club/courses"},{label:"In Progress",to:"/app/club/courses"},{label:"Completed",to:"/app/club/courses"}],
    menu: DEFAULT_MENU },
  { label: "Challenges", to: "/app/club/challenges", icon: <span className="cc-sb-row-emoji">🔥</span>,
    subs: [{label:"Active",to:"/app/club/challenges"},{label:"Upcoming",to:"/app/club/challenges"},{label:"Past",to:"/app/club/challenges"}],
    menu: DEFAULT_MENU },
  { label: "Events", to: "/app/club/events", icon: <span className="cc-sb-row-emoji">📅</span>,
    subs: [{label:"Calendar",to:"/app/club/events"},{label:"Upcoming",to:"/app/club/events"},{label:"Past",to:"/app/club/events"}],
    menu: DEFAULT_MENU },
  { label: "Members", to: "/app/club/members", icon: <span className="cc-sb-row-emoji">👥</span>,
    subs: [{label:"All Members",to:"/app/club/members"},{label:"Online",to:"/app/club/members"},{label:"Admins",to:"/app/club/members"}],
    menu: DEFAULT_MENU },
  { label: "AIVA", to: "/app/aiva", icon: <span className="cc-sb-row-emoji">✨</span>,
    subs: [{label:"Console",to:"/app/aiva"},{label:"Prompts",to:"/app/aiva"},{label:"History",to:"/app/aiva"}],
    menu: DEFAULT_MENU },
];

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
  return (
    <div className="cc-sb-item">
      <div className={`cc-sb-item-row ${baseCls}-wrap`}>
        <Link
          to={link.to}
          activeOptions={link.exact ? { exact: true } : undefined}
          className={baseCls}
          activeProps={{ className: `${baseCls} on` }}
        >
          {link.pill ? <span className="cc-sb-pill-i">{link.icon}</span> : link.icon}
          <span className="cc-sb-item-l">{link.label}</span>
        </Link>
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
            <Link key={s.label} to={s.to} className="cc-sb-sub" activeProps={{ className: "cc-sb-sub on" }}>
              {s.label}
            </Link>
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

      <Link to="/app" activeOptions={{ exact: true }} className="cc-sb-pill" activeProps={{className:"cc-sb-pill on"}}>
        <span className="cc-sb-pill-i"><Home size={15}/></span>
        Home
      </Link>

      <Link to="/app/dashboard" className="cc-sb-feed" activeProps={{className:"cc-sb-feed on"}}>
        <Rocket size={16}/> Getting Started
      </Link>

      <Link to="/app/club/feed" className="cc-sb-feed" activeProps={{className:"cc-sb-feed on"}}>
        <MessageSquare size={16}/> Community
      </Link>

      {MAIN_LINKS.map(it => (
        <Link key={it.to} to={it.to} className="cc-sb-feed" activeProps={{className:"cc-sb-feed on"}}>
          <span className="cc-sb-row-emoji">{it.icon}</span> {it.label}
        </Link>
      ))}

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
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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
        <button className="cc-tb-icon" data-tip="Notifications" onClick={()=>nav({to:"/app/notifications"})}><Bell size={16}/></button>
        <button className="cc-tb-icon" data-tip="Messages" onClick={()=>nav({to:"/app/messages"})}><MessageCircle size={16}/></button>
        <button className="cc-tb-icon" data-tip="Bookmarks" onClick={()=>nav({to:"/app/bookmarks"})}><Bookmark size={16}/></button>

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
