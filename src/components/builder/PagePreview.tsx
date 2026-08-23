// Builder Core — the canonical page renderer.
//
// Used by the builder canvas AND by every published route (public Club page,
// sales pages, offer pages), so the editing preview can never drift from the
// published output.

import { useEffect, useState } from "react";
import { Home, MessageSquare, BookOpen, Calendar, Users, Trophy, Search, Bell, Eye, EyeOff } from "lucide-react";
import type { BuilderPage, BuilderSurface } from "@/lib/builder/types";
import { pageTypeConfig } from "@/lib/builder/page-types";
import { BlockRenderer, builderStyleVars, type SectionData } from "./BlockRenderer";
import { getGS, subscribeGS } from "@/lib/gs-store";
import { getEvents, subscribeEvents } from "@/lib/events-store";

const NAV = [
  { label: "Home", icon: Home },
  { label: "Community", icon: MessageSquare },
  { label: "Courses", icon: BookOpen },
  { label: "Events", icon: Calendar },
  { label: "Members", icon: Users },
  { label: "Leaderboard", icon: Trophy },
];

function navIndexFor(pageType: string) {
  if (pageType === "club-community") return 1;
  if (pageType === "club-course-home") return 2;
  return 0;
}

function useLiveData(): SectionData {
  const [gs, setGs] = useState(() => getGS());
  const [events, setEvents] = useState(() => getEvents());
  useEffect(() => {
    setGs(getGS());
    setEvents(getEvents());
    const a = subscribeGS(setGs);
    const b = subscribeEvents(() => setEvents(getEvents()));
    return () => { a(); b(); };
  }, []);
  return { gs, events };
}

export function PagePreview({
  page, selectedId, onSelect, interactive = false, chrome = true,
}: {
  page: BuilderPage;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** Editing mode: hidden blocks stay visible and blocks are selectable. */
  interactive?: boolean;
  chrome?: boolean;
}) {
  const cfg = pageTypeConfig(page.pageType);
  const surface: BuilderSurface = cfg.surface;
  const data = useLiveData();
  const { gs } = data;
  const visible = page.blocks.filter(b => interactive || !b.hidden);
  const showClubNav = chrome && cfg.chrome === "club" && page.theme.showNav;

  const blockList = visible.map(b => (
    <div
      key={b.id}
      className={
        surface === "marketing"
          ? `sp-block${interactive ? " is-editable" : ""}${selectedId === b.id ? " is-selected" : ""}${b.hidden ? " is-hidden" : ""}`
          : `cz-slot${selectedId === b.id ? " is-selected" : ""}${b.hidden ? " is-hidden" : ""}`
      }
      onClick={interactive && onSelect ? (e) => { e.stopPropagation(); onSelect(b.id); } : undefined}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive && onSelect ? (e) => { if (e.key === "Enter") onSelect(b.id); } : undefined}
    >
      {interactive ? (
        <span className={surface === "marketing" ? "sp-block-tag" : "cz-slot-tag"}>
          {b.hidden ? <EyeOff size={11} /> : <Eye size={11} />} {b.type.replace(/-/g, " ")}
        </span>
      ) : null}
      <BlockRenderer block={b} data={data} surface={surface} />
    </div>
  ));

  const empty = interactive
    ? <div className={surface === "marketing" ? "sp-empty" : "cz-canvas-empty"}>
        <strong>This Page Is Empty</strong>
        <span>Add A Block From The Left Panel — Or Ask AIVA To Draft It.</span>
      </div>
    : null;

  if (surface === "marketing") {
    return (
      <div className="sp-page" style={builderStyleVars(page.theme, surface)} data-theme={page.theme.background}>
        {chrome && cfg.chrome === "marketing" ? (
          <header className="sp-nav">
            <div className="sp-nav-brand">
              {page.theme.logoUrl
                ? <img src={page.theme.logoUrl} alt="" />
                : <span className="sp-logo" style={{ background: page.theme.brand }}>{(gs.clubName || "Y").slice(0, 1)}</span>}
              <strong>{gs.clubName || "Your Club"}</strong>
            </div>
            <div className="sp-nav-actions">
              <span className="sp-nav-link">Sign In</span>
              <span className="cz-btn xs">Join</span>
            </div>
          </header>
        ) : null}

        <div className="sp-body-wrap">
          {blockList}
          {!visible.length ? (empty ?? <div className="sp-empty">Coming Soon.</div>) : null}
        </div>

        <footer className="sp-foot">© {new Date().getFullYear()} {gs.clubName || "Your Club"} · Privacy · Terms</footer>
      </div>
    );
  }

  return (
    <div className="cz-preview" style={builderStyleVars(page.theme, surface)} data-theme={page.theme.background}>
      {chrome ? (
        <div className="cz-chrome-top">
          <div className="cz-brandmark">
            {page.theme.logoUrl
              ? <img src={page.theme.logoUrl} alt="" />
              : <span className="cz-logo" style={{ background: page.theme.brand }}>{(gs.clubName || "Y").slice(0, 1)}</span>}
            <strong>{gs.clubName || "Your Club"}</strong>
          </div>
          <div className="cz-chrome-actions">
            <span className="cz-chrome-search"><Search size={12} /> Search</span>
            <Bell size={14} />
            <span className="cz-chrome-av" style={{ background: page.theme.brand }}>D</span>
          </div>
        </div>
      ) : null}

      <div className={`cz-chrome-body${showClubNav ? "" : " no-nav"}`}>
        {showClubNav ? (
          <nav className="cz-chrome-nav">
            {NAV.map((n, i) => (
              <span key={n.label} className={i === navIndexFor(page.pageType) ? "on" : ""}><n.icon size={14} /> {n.label}</span>
            ))}
          </nav>
        ) : null}

        <div className="cz-canvas">
          {visible.length ? blockList : empty}
        </div>
      </div>
    </div>
  );
}
