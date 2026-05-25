import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Search, Bell, LogOut, ChevronsUpDown, LayoutDashboard, MessageSquare, BookOpen, Flame, Calendar, Users, BarChart3, Sparkles, Settings, Plus, Compass, Zap, UserPlus, User, CreditCard, Mail, Languages, Sun, Award, Home } from "lucide-react";

export const Route = createFileRoute("/app")({
  component: AppShell,
});

function AppShell() {
  return (
    <div className="lt">
      <div className="lt-app">
        <Sidebar />
        <div className="lt-main">
          <Topbar />
          <main className="lt-content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

function Sidebar() {
  const nav = useNavigate();
  return (
    <aside className="lt-sidebar">
      <div className="lt-sb-top">
        <Link to="/landing" className="lt-sb-logo">Advisors<span>Club</span></Link>
        <button className="lt-switcher">
          <span className="lt-switcher-av">RE</span>
          <span className="lt-switcher-t">
            <span className="lt-switcher-name">Real Estate Empire</span>
            <span className="lt-switcher-meta">847 members</span>
          </span>
          <ChevronsUpDown size={14} color="#737380" />
        </button>
      </div>

      <nav className="lt-sb-nav">
        <div className="lt-sb-group">Main</div>
        <Link to="/" className="lt-sb-item"><Home size={16}/> Home</Link>
        <Link to="/app/getting-started" className="lt-sb-item"><Sparkles size={16}/> Getting started <span className="lt-sb-badge">NEW</span></Link>
        <Link to="/app/dashboard" className="lt-sb-item" activeOptions={{exact:false}}><LayoutDashboard size={16}/> Community</Link>
        <Link to="/app/club/feed" className="lt-sb-item"><MessageSquare size={16}/> Club Feed</Link>

        <div className="lt-sb-group">Learn</div>
        <Link to="/app/club/courses" className="lt-sb-item"><BookOpen size={16}/> Courses</Link>
        <Link to="/app/club/challenges" className="lt-sb-item"><Flame size={16}/> Challenges</Link>
        <Link to="/app/club/events" className="lt-sb-item"><Calendar size={16}/> Events</Link>

        <div className="lt-sb-group">People</div>
        <Link to="/app/club/members" className="lt-sb-item"><Users size={16}/> Members</Link>
        <Link to="/app/club/analytics" className="lt-sb-item"><BarChart3 size={16}/> Analytics</Link>

        <div className="lt-sb-group">Tools</div>
        <Link to="/app/aiva" className="lt-sb-item"><Sparkles size={16}/> AIVA <span className="lt-sb-badge">AI</span></Link>
        <Link to="/app/club/settings" className="lt-sb-item"><Settings size={16}/> Settings</Link>
      </nav>

    </aside>
  );
}

function Topbar() {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <header className="lt-topbar">
      <div className="lt-topbar-search">
        <Search size={14} />
        <input placeholder="Search your Club..." />
      </div>
      <div className="lt-topbar-right">
        <button className="btn-amber" style={{height:36,padding:"0 14px"}}><Plus size={15} strokeWidth={3}/> New Post</button>
        <button className="lt-bell"><Bell size={16}/><span className="lt-bell-dot"/></button>

        <div className="lt-pf-wrap" ref={ref}>
          <button className="lt-pf-btn" onClick={() => setOpen(o=>!o)} aria-label="Account menu">
            <span className="lt-pf-av">Z</span>
          </button>
          {open && (
            <div className="lt-pf-menu">
              <div className="lt-pf-head">
                <span className="lt-pf-av lg">Z</span>
                <div>
                  <div className="lt-pf-n">Zaddy</div>
                  <div className="lt-pf-e">zaddy@advisorsclub.com</div>
                </div>
              </div>
              <button className="lt-pf-cta amber"><Zap size={15} strokeWidth={3}/> Upgrade</button>
              <button className="lt-pf-cta ghost"><UserPlus size={15}/> Add Members</button>
              <div className="lt-pf-sep" />
              <MenuItem icon={<User size={15}/>} label="Account" onClick={()=>{setOpen(false);nav({to:"/app/account"})}} />
              <MenuItem icon={<CreditCard size={15}/>} label="Subscription" right="Pro" />
              <MenuItem icon={<Mail size={15}/>} label="Invites" />
              <div className="lt-pf-sep" />
              <MenuItem icon={<Languages size={15}/>} label="Language:" right="English ›" />
              <MenuItem icon={<Sun size={15}/>} label="Theme:" right="Light ›" />
              <button className="lt-pf-affil"><Award size={15}/> Join Affiliate Program</button>
              <button className="lt-pf-logout" onClick={()=>nav({to:"/"})}><LogOut size={15}/> Log Out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function MenuItem({ icon, label, right, onClick }: { icon: React.ReactNode; label: string; right?: string; onClick?: () => void }) {
  return (
    <button className="lt-pf-item" onClick={onClick}>
      <span className="lt-pf-i">{icon}</span>
      <span className="lt-pf-l">{label}</span>
      {right && <span className="lt-pf-r">{right}</span>}
    </button>
  );
}
