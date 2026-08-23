import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { SellPage } from "@/lib/sell/types";
import { SellBlockView, sellStyle, type SellData } from "./SellBlockRenderer";
import { getGS, subscribeGS } from "@/lib/gs-store";
import { getEvents, subscribeEvents } from "@/lib/events-store";

export function SellPreview({
  page, selectedId, onSelect, interactive = true, chrome = true,
}: {
  page: SellPage;
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

  const data: SellData = { gs, events };
  const visible = page.blocks.filter(b => interactive || !b.hidden);

  return (
    <div className="sp-page" style={sellStyle(page.theme)} data-theme={page.theme.background}>
      {chrome ? (
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
        {visible.map(b => (
          <div
            key={b.id}
            className={`sp-block${interactive ? " is-editable" : ""}${selectedId === b.id ? " is-selected" : ""}${b.hidden ? " is-hidden" : ""}`}
            onClick={interactive && onSelect ? (e) => { e.stopPropagation(); onSelect(b.id); } : undefined}
          >
            {interactive ? (
              <span className="sp-block-tag">{b.type}{b.hidden ? <EyeOff size={10} /> : <Eye size={10} />}</span>
            ) : null}
            <SellBlockView block={b} data={data} />
          </div>
        ))}
        {!visible.length ? <div className="sp-empty">No Sections Yet — Add One Or Ask AIVA To Draft The Page.</div> : null}
      </div>

      <footer className="sp-foot">© {new Date().getFullYear()} {gs.clubName || "Your Club"} · Privacy · Terms</footer>
    </div>
  );
}
