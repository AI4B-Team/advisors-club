import { useNavigate } from "@tanstack/react-router";
import { usePathname } from "@/components/app-shell/pathname";
import { useEffect, useRef, useState } from "react";
import { Search, Bell, LogOut, ChevronDown, BookOpen, Calendar, Sparkles, Plus, Zap, User, CreditCard, Languages, Sun, MessageCircle, Bookmark, Video, HelpCircle, Route as RouteIcon, MessageSquarePlus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { readRecentSearches, pushRecentSearch } from "@/lib/data/recent-searches";
import { useViewMode } from "@/hooks/use-view-mode";
import { AivaCommandPalette } from "@/components/aiva/AivaCommandPalette";
import { useAivaAttention } from "@/hooks/use-aiva-attention";
import { PersonaAssistantPanel } from "@/components/persona/PersonaAssistant";
import { usePersona } from "@/hooks/use-persona";
import { personaName } from "@/lib/persona/store";
import { AISummaryDrawer } from "@/components/ai-summary-drawer";

/* ============ TOP BAR ============ */
export function Topbar() {
  const nav = useNavigate();
  const { displayName, initial, user, signOut } = useAuth();
  const { viewAs, setMode, isAdmin } = useViewMode();

  const pathname = usePathname();
  const showPostActions = pathname === "/app" || pathname === "/app/club/feed";
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const attention = useAivaAttention(isAdmin && !viewAs);
  const [briefingOn, setBriefingOn] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const persona = usePersona();
  const assistantName = personaName(persona);
  const isAdminRef = useRef(true);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const helpRef = useRef<HTMLDivElement>(null);

  isAdminRef.current = isAdmin;

  // REAL recents: this person's own searches, persisted locally. No fabricated
  // "trending" — the second list is explicitly labeled as suggestions.
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  useEffect(() => { setRecentSearches(readRecentSearches()); }, []);
  const suggested = ["Live Events", "Member Onboarding", "Challenges"];

  function runSearch(term: string) {
    const t = term.trim();
    if (!t) return;
    setQuery(t);
    setRecentSearches(pushRecentSearch(t));
    setSearchOpen(false);
  }

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
          onKeyDown={(e)=>{ if (e.key === "Enter") runSearch(query); }}
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
            {recentSearches.length === 0 && (
              <div className="cc-tb-search-item" style={{opacity:.6,cursor:"default"}}>
                <Search size={13}/> <span>No Recent Searches Yet</span>
              </div>
            )}
            {recentSearches.map(s => (
              <button key={s} className="cc-tb-search-item" onClick={()=>runSearch(s)}>
                <Search size={13}/> <span>{s}</span>
              </button>
            ))}
            <div className="cc-tb-search-sep" />
            <div className="cc-tb-search-head">Suggested</div>
            {suggested.map(s => (
              <button key={s} className="cc-tb-search-item" onClick={()=>runSearch(s)}>
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
            aria-label={attention.hasAttention ? `Ask AIVA — ${attention.headline}` : "Ask AIVA"}
            data-tip={attention.hasAttention ? attention.headline : "Ask AIVA"}
            onClick={()=>{
              if (cmdOpen) { setCmdOpen(false); return; }
              setBriefingOn(attention.hasAttention);
              setCmdOpen(true);
            }}
          >
            <Sparkles size={15}/>
            <span className="cc-tb-ask-l">Ask AIVA</span>
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
            {viewAs ? (viewAs.avatar ? <img src={viewAs.avatar} alt="" /> : viewAs.name.slice(-1)) : initial}
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
                  {viewAs ? (viewAs.avatar ? <img src={viewAs.avatar} alt="" /> : viewAs.name.slice(-1)) : initial}
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
        onSummary={()=>{ setCmdOpen(false); setAiOpen(true); }}
        open={cmdOpen}
        onClose={()=>{ if (briefingOn) attention.acknowledgeAll(); setBriefingOn(false); setCmdOpen(false); }}
        briefing={briefingOn ? { greeting: attention.greeting, headline: attention.headline, items: attention.items, overflow: attention.overflow } : null}
      />
      <PersonaAssistantPanel
        open={askOpen}
        onClose={()=>setAskOpen(false)}
        me={{ id: viewAs?.id ?? "me", name: viewAs?.name ?? (displayName || "Member") }}
      />
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
