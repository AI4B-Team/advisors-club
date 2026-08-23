// Builder Core — the shared design panel. Page-type config decides whether
// page meta (title/slug) and Club navigation toggles appear.

import { Image as ImageIcon, Palette, Type, Square, PanelLeft, Link2 } from "lucide-react";
import type { BuilderSession } from "@/lib/builder/session";
import { pageTypeConfig } from "@/lib/builder/page-types";

const BRAND_SWATCHES = ["#F5A623", "#2563EB", "#0F766E", "#BE123C", "#6D28D9", "#111827"];
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

export function ThemePanel({ session }: { session: BuilderSession }) {
  const { theme } = session.page;
  const cfg = pageTypeConfig(session.page.pageType);
  const set = session.setTheme;

  return (
    <div className="cz-panel-body">
      {cfg.settings.meta ? (
        <>
          <div className="cz-lp-label"><Link2 size={12} /> Page</div>
          <label className="cz-field"><span>Title</span>
            <input value={session.page.title} onChange={e => session.setMeta({ title: e.target.value })} />
          </label>
          <label className="cz-field"><span>Public URL · /p/{session.page.slug}</span>
            <input value={session.page.slug} onChange={e => session.setMeta({ slug: e.target.value })} />
          </label>
        </>
      ) : null}

      <div className="cz-lp-label"><ImageIcon size={12} /> Imagery</div>
      <label className="cz-field"><span>Logo URL</span>
        <input value={theme.logoUrl} onChange={e => set({ logoUrl: e.target.value })} placeholder="https://…" />
      </label>
      <label className="cz-field"><span>Cover Image URL</span>
        <input value={theme.coverUrl} onChange={e => set({ coverUrl: e.target.value })} placeholder="https://…" />
      </label>

      <div className="cz-lp-label"><Palette size={12} /> Brand Color</div>
      <div className="cz-swatches">
        {BRAND_SWATCHES.map(c => (
          <button key={c} type="button" className={`cz-swatch${theme.brand.toLowerCase() === c.toLowerCase() ? " on" : ""}`}
            style={{ background: c }} onClick={() => set({ brand: c })} aria-label={c} />
        ))}
        <input type="color" className="cz-color" value={theme.brand} onChange={e => set({ brand: e.target.value })} aria-label="Custom Brand Color" />
      </div>

      <div className="cz-lp-label"><Type size={12} /> Typography</div>
      <div className="cz-seg">
        {(["system", "grotesk", "serif", "mono"] as const).map(f => (
          <button key={f} type="button" className={theme.font === f ? "on" : ""} onClick={() => set({ font: f })}>
            {f === "system" ? "Sans" : cap(f)}
          </button>
        ))}
      </div>

      <div className="cz-lp-label"><Square size={12} /> Button Treatment</div>
      <div className="cz-seg">
        {(["rounded", "pill", "square"] as const).map(b => (
          <button key={b} type="button" className={theme.buttonStyle === b ? "on" : ""} onClick={() => set({ buttonStyle: b })}>{cap(b)}</button>
        ))}
      </div>

      <div className="cz-lp-label">Background Treatment</div>
      <div className="cz-seg">
        {(["light", "soft", "warm", "dark"] as const).map(b => (
          <button key={b} type="button" className={theme.background === b ? "on" : ""} onClick={() => set({ background: b })}>{cap(b)}</button>
        ))}
      </div>

      <div className="cz-lp-label">Density</div>
      <div className="cz-seg">
        {(["compact", "comfortable", "spacious"] as const).map(b => (
          <button key={b} type="button" className={theme.density === b ? "on" : ""} onClick={() => set({ density: b })}>{cap(b)}</button>
        ))}
      </div>

      <label className="cz-field"><span>Corner Radius · {theme.radius}px</span>
        <input type="range" min={4} max={22} value={theme.radius} onChange={e => set({ radius: Number(e.target.value) })} />
      </label>

      {cfg.settings.navigation ? (
        <>
          <div className="cz-lp-label"><PanelLeft size={12} /> Navigation Visibility</div>
          <label className="cz-field row"><span>Show Club Navigation</span>
            <button type="button" className={`cz-switch${theme.showNav ? " on" : ""}`} onClick={() => set({ showNav: !theme.showNav })}><i /></button>
          </label>
          <label className="cz-field row"><span>Show Club Switcher Rail</span>
            <button type="button" className={`cz-switch${theme.showRail ? " on" : ""}`} onClick={() => set({ showRail: !theme.showRail })}><i /></button>
          </label>
        </>
      ) : null}

      <p className="cz-note">Options Are Limited To Combinations That Stay On-Brand And Accessible.</p>
    </div>
  );
}
