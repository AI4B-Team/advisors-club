import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { Search, Bell, LogOut, ChevronsUpDown, LayoutDashboard, MessageSquare, BookOpen, Flame, Calendar, Users, BarChart3, Sparkles, Settings, Plus, Compass } from "lucide-react";

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
        <Link to="/app/dashboard" className="lt-sb-item" activeOptions={{exact:false}}><LayoutDashboard size={16}/> Dashboard</Link>
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

      <div className="lt-sb-foot">
        <Link to="/discover" className="lt-discover-link"><Compass size={15}/> Discover Clubs</Link>
        <div className="lt-user-row">
          <span className="lt-user-av">Z</span>
          <div className="lt-user-t">
            <div className="lt-user-name">Zaddy</div>
            <div className="lt-user-plan">Pro plan</div>
          </div>
          <button className="lt-user-out" onClick={() => nav({ to: "/" })} aria-label="Logout"><LogOut size={15}/></button>
        </div>
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <header className="lt-topbar">
      <div className="lt-topbar-search">
        <Search size={14} />
        <input placeholder="Search your Club..." />
      </div>
      <div className="lt-topbar-right">
        <button className="btn-amber" style={{height:36,padding:"0 14px"}}><Plus size={15} strokeWidth={3}/> New Post</button>
        <button className="lt-bell"><Bell size={16}/><span className="lt-bell-dot"/></button>
      </div>
    </header>
  );
}
