import { useEffect, useState } from "react";
import { Home, MessageSquare, BookOpen, Calendar, Users, Trophy, Search, Bell, Eye, EyeOff } from "lucide-react";
import type { Block, CustomizeDoc, PageId } from "@/lib/customize/types";
import { BlockPreview, type PreviewData } from "./BlockRenderer";
import { getGS, subscribeGS } from "@/lib/gs-store";
import { getEvents, subscribeEvents } from "@/lib/events-store";

const FONT_STACK: Record<string, string> = {
  system: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  grotesk: '"Space Grotesk", "Inter", ui-sans-serif, system-ui, sans-serif',
  serif: '"Instrument Serif", Georgia, "Times New Roman", serif',
  mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
};

const BG: Record<string, { page: string; surface: string; ink: string; line: string }> = {
  light: { page: "#FFFFFF", surface: "#FFFFFF", ink: "#111827", line: "#E8EAEE" },
  soft: { page: "#F7F8FA", surface: "#FFFFFF", ink: "#111827", line: "#E8EAEE" },
  warm: { page: "#FBF8F3", surface: "#FFFFFF", ink: "#1B1710", line: "#EDE4D6" },
  dark: { page: "#101216", surface: "#171A20", ink: "#F4F5F7", line: "#262A33" },
};

const RADIUS_BTN: Record<string, string> = { rounded: "10px", pill: "999px", square: "4px" };
const PAD: Record<string, string> = { comfortable: "18px", compact: "12px", spacious: "26px" };

const NAV = [
  { label: "Home", icon: Home },
  { label: "Community", icon: MessageSquare },
  { label: "Courses", icon: BookOpen },
  { label: "Events", icon: Calendar },
  { label: "Members", icon: Users },
  { label: "Leaderboard", icon: Trophy },
];

export function previewStyle(doc: CustomizeDoc): React.CSSProperties {
  const bg = BG[doc.theme.background] ?? BG.light;
  return {
    ["--cz-brand" as string]: doc.theme.brand,
    ["--cz-page" as string]: bg.page,
    ["--cz-surface" as string]: bg.surface,
    ["--cz-ink" as string]: bg.ink,
    ["--cz-line" as string]: bg.line,
    ["--cz-radius" as string]: `${doc.theme.radius}px`,
    ["--cz-btn-radius" as string]: RADIUS_BTN[doc.theme.buttonStyle] ?? "10px",
    ["--cz-pad" as string]: PAD[doc.theme.density] ?? "18px",
    fontFamily: FONT_STACK[doc.theme.font] ?? FONT_STACK.system,
  };
}

export function ClubPreview({
  doc, page, blocks, selectedId, onSelect, interactive = true, chrome = true,
}: {
  doc: CustomizeDoc;
  page: PageId;
  blocks: Block[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  interactive?: boolean;
  chrome?: boolean;
}) {
  const [gs, setGs] = useState(() => getGS());
  const [events, setEvents] = useState(() => getEvents());
  useEffect(() => {
    setGs(getGS());
    setEvents(getEvents());
    const a = subscribeGS(setGs);
    const b = subscribeEvents(() => setEvents(getEvents()));
    return () => { a(); b(); };
  }, []);
  const data: PreviewData = { gs, events };
  const visible = blocks.filter(b => interactive || !b.hidden);
  const isPublic = page === "public-club";
  const showNav = chrome && doc.theme.showNav && !isPublic;

  return (
    <div className="cz-preview" style={previewStyle(doc)} data-theme={doc.theme.background}>
      {chrome ? (
        <div className="cz-chrome-top">
          <div className="cz-brandmark">
            {doc.theme.logoUrl
              ? <img src={doc.theme.logoUrl} alt="" />
              : <span className="cz-logo" style={{ background: doc.theme.brand }}>{(gs.clubName || "Y").slice(0, 1)}</span>}
            <strong>{gs.clubName || "Your Club"}</strong>
          </div>
          {isPublic ? (
            <div className="cz-chrome-actions"><span className="cz-btn xs soft">Sign In</span><span className="cz-btn xs">Join The Club</span></div>
          ) : (
            <div className="cz-chrome-actions">
              <span className="cz-chrome-search"><Search size={12} /> Search</span>
              <Bell size={14} />
              <span className="cz-chrome-av" style={{ background: doc.theme.brand }}>D</span>
            </div>
          )}
        </div>
      ) : null}

      <div className={`cz-chrome-body${showNav ? "" : " no-nav"}`}>
        {showNav ? (
          <nav className="cz-chrome-nav">
            {NAV.map((n, i) => (
              <span key={n.label} className={i === navIndexFor(page) ? "on" : ""}><n.icon size={14} /> {n.label}</span>
            ))}
          </nav>
        ) : null}

        <div className="cz-canvas">
          {visible.length === 0 ? (
            <div className="cz-canvas-empty">
              <strong>This Page Is Empty</strong>
              <span>Add Blocks From The Left Panel To Build The Member Experience.</span>
            </div>
          ) : visible.map(b => (
            <div
              key={b.id}
              className={`cz-slot${selectedId === b.id ? " is-selected" : ""}${b.hidden ? " is-hidden" : ""}`}
              onClick={interactive ? () => onSelect?.(b.id) : undefined}
              role={interactive ? "button" : undefined}
              tabIndex={interactive ? 0 : undefined}
              onKeyDown={interactive ? (e) => { if (e.key === "Enter") onSelect?.(b.id); } : undefined}
            >
              {interactive ? (
                <span className="cz-slot-tag">
                  {b.hidden ? <EyeOff size={11} /> : <Eye size={11} />} {b.type.replace(/-/g, " ")}
                </span>
              ) : null}
              <BlockPreview block={b} data={data} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function navIndexFor(page: PageId) {
  if (page === "community") return 1;
  if (page === "course-home") return 2;
  return 0;
}
