import { useState } from "react";
import {
  Layers, Palette, Plus, Trash2, Copy, Eye, EyeOff, ChevronUp, ChevronDown,
  ChevronLeft, Type, Square, Image as ImageIcon, Link2,
} from "lucide-react";
import { sellBlocksForSurface, sellDefForType } from "@/lib/sell/blocks";
import type { SellBlock, SellPage, SellTheme } from "@/lib/sell/types";

const BRAND_SWATCHES = ["#F5A623", "#111827", "#2563EB", "#0EA5A4", "#DB2777", "#7C3AED", "#16A34A", "#DC2626"];

const CATEGORY_LABEL: Record<string, string> = {
  content: "Content",
  proof: "Proof",
  offer: "Offer & Conversion",
  community: "Community & Learning",
  advanced: "Advanced",
};

function Inspector({ block, onChange, onBack, onRemove }: {
  block: SellBlock;
  onChange: (p: Record<string, string | number | boolean>) => void;
  onBack: () => void;
  onRemove: () => void;
}) {
  const def = sellDefForType(block.type);
  if (!def) return null;
  return (
    <div className="cz-lp-body">
      <button className="cz-lp-back" onClick={onBack}><ChevronLeft size={13} /> All Sections</button>
      <div className="cz-lp-title"><strong>{def.label}</strong><span>{def.desc}</span></div>
      <div className="cz-fields">
        {def.fields.map(f => {
          const val = block.props[f.key];
          if (f.type === "toggle") {
            return (
              <label className="cz-field row" key={f.key}>
                <span>{f.label}</span>
                <button type="button" className={`cz-switch${val ? " on" : ""}`} onClick={() => onChange({ [f.key]: !val })}><i /></button>
              </label>
            );
          }
          if (f.type === "select") {
            return (
              <label className="cz-field" key={f.key}>
                <span>{f.label}</span>
                <select value={String(val ?? "")} onChange={e => onChange({ [f.key]: e.target.value })}>
                  {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </label>
            );
          }
          if (f.type === "textarea") {
            return (
              <label className="cz-field" key={f.key}>
                <span>{f.label}</span>
                <textarea rows={5} value={String(val ?? "")} onChange={e => onChange({ [f.key]: e.target.value })} placeholder={f.placeholder} />
              </label>
            );
          }
          if (f.type === "number") {
            return (
              <label className="cz-field" key={f.key}>
                <span>{f.label}</span>
                <input type="number" min={f.min} max={f.max} value={Number(val ?? 1)} onChange={e => onChange({ [f.key]: Number(e.target.value) })} />
              </label>
            );
          }
          return (
            <label className="cz-field" key={f.key}>
              <span>{f.label}</span>
              <input value={String(val ?? "")} onChange={e => onChange({ [f.key]: e.target.value })} placeholder={f.placeholder} />
            </label>
          );
        })}
      </div>
      <button className="cz-danger" onClick={onRemove}><Trash2 size={13} /> Remove Section</button>
    </div>
  );
}

function SectionsTab(props: {
  page: SellPage;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onAdd: (type: string) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleHidden: (id: string) => void;
  onMove: (from: number, to: number) => void;
}) {
  const [adding, setAdding] = useState(false);
  const available = sellBlocksForSurface(props.page.surface);
  const used = new Set(props.page.blocks.map(b => b.type));
  const groups = Array.from(new Set(available.map(a => a.category)));

  return (
    <div className="cz-lp-body">
      <div className="cz-lp-label"><Layers size={12} /> Sections On This Page</div>
      <div className="cz-layers">
        {props.page.blocks.map((b, i) => {
          const def = sellDefForType(b.type);
          return (
            <div
              key={b.id}
              className={`cz-layer${props.selectedId === b.id ? " on" : ""}${b.hidden ? " off" : ""}`}
              onClick={() => props.onSelect(b.id)}
            >
              <span className="cz-layer-name">{def?.label ?? b.type}</span>
              <div className="cz-layer-acts" onClick={e => e.stopPropagation()}>
                <button onClick={() => props.onMove(i, i - 1)} disabled={i === 0} aria-label="Move Up"><ChevronUp size={12} /></button>
                <button onClick={() => props.onMove(i, i + 1)} disabled={i === props.page.blocks.length - 1} aria-label="Move Down"><ChevronDown size={12} /></button>
                <button onClick={() => props.onToggleHidden(b.id)} aria-label="Toggle Visibility">{b.hidden ? <EyeOff size={12} /> : <Eye size={12} />}</button>
                {def?.duplicable ? <button onClick={() => props.onDuplicate(b.id)} aria-label="Duplicate"><Copy size={12} /></button> : null}
                <button onClick={() => props.onRemove(b.id)} aria-label="Remove"><Trash2 size={12} /></button>
              </div>
            </div>
          );
        })}
        {!props.page.blocks.length ? <p className="cz-note">This Page Is Empty. Add A Section Below.</p> : null}
      </div>

      <button className="cz-ghost" onClick={() => setAdding(v => !v)}><Plus size={13} /> Add Section</button>

      {adding ? (
        <div className="cz-catalog">
          {groups.map(g => (
            <div key={g}>
              <div className="cz-lp-label">{CATEGORY_LABEL[g] ?? g}</div>
              {available.filter(a => a.category === g).map(a => {
                const disabled = used.has(a.type) && !a.duplicable;
                return (
                  <button
                    key={a.type}
                    className="cz-cat-item"
                    disabled={disabled}
                    onClick={() => { props.onAdd(a.type); setAdding(false); }}
                  >
                    <strong>{a.label}</strong>
                    <span>{disabled ? "Already On This Page" : a.desc}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ThemeTab({ page, onTheme, onMeta }: {
  page: SellPage;
  onTheme: (p: Partial<SellTheme>) => void;
  onMeta: (p: { title?: string; slug?: string }) => void;
}) {
  const theme = page.theme;
  return (
    <div className="cz-lp-body">
      <div className="cz-lp-label"><Link2 size={12} /> Page Details</div>
      <label className="cz-field"><span>Page Title</span><input value={page.title} onChange={e => onMeta({ title: e.target.value })} /></label>
      <label className="cz-field"><span>Public URL</span><input value={page.slug} onChange={e => onMeta({ slug: e.target.value })} /></label>
      <p className="cz-note">Visitors Reach This Page At /p/{page.slug || "…"}</p>

      <div className="cz-lp-label"><ImageIcon size={12} /> Logo</div>
      <label className="cz-field"><span>Logo URL</span><input value={theme.logoUrl} onChange={e => onTheme({ logoUrl: e.target.value })} placeholder="https://…" /></label>

      <div className="cz-lp-label"><Palette size={12} /> Brand Color</div>
      <div className="cz-swatches">
        {BRAND_SWATCHES.map(c => (
          <button key={c} className={`cz-swatch${theme.brand.toLowerCase() === c.toLowerCase() ? " on" : ""}`} style={{ background: c }} onClick={() => onTheme({ brand: c })} aria-label={c} />
        ))}
        <input type="color" value={theme.brand} onChange={e => onTheme({ brand: e.target.value })} className="cz-color" aria-label="Custom Brand Color" />
      </div>

      <div className="cz-lp-label"><Type size={12} /> Typography</div>
      <div className="cz-seg">
        {(["system", "grotesk", "serif", "mono"] as const).map(f => (
          <button key={f} className={theme.font === f ? "on" : ""} onClick={() => onTheme({ font: f })}>{f === "system" ? "Sans" : f[0].toUpperCase() + f.slice(1)}</button>
        ))}
      </div>

      <div className="cz-lp-label"><Square size={12} /> Button Treatment</div>
      <div className="cz-seg">
        {(["rounded", "pill", "square"] as const).map(b => (
          <button key={b} className={theme.buttonStyle === b ? "on" : ""} onClick={() => onTheme({ buttonStyle: b })}>{b[0].toUpperCase() + b.slice(1)}</button>
        ))}
      </div>

      <div className="cz-lp-label">Background Treatment</div>
      <div className="cz-seg">
        {(["light", "soft", "warm", "dark"] as const).map(b => (
          <button key={b} className={theme.background === b ? "on" : ""} onClick={() => onTheme({ background: b })}>{b[0].toUpperCase() + b.slice(1)}</button>
        ))}
      </div>

      <div className="cz-lp-label">Density</div>
      <div className="cz-seg">
        {(["compact", "comfortable", "spacious"] as const).map(b => (
          <button key={b} className={theme.density === b ? "on" : ""} onClick={() => onTheme({ density: b })}>{b[0].toUpperCase() + b.slice(1)}</button>
        ))}
      </div>

      <label className="cz-field"><span>Corner Radius · {theme.radius}px</span>
        <input type="range" min={4} max={22} value={theme.radius} onChange={e => onTheme({ radius: Number(e.target.value) })} />
      </label>
      <p className="cz-note">Styling Uses The Same Design System As Customize, So Your Pages Always Match Your Club.</p>
    </div>
  );
}

export type SellTab = "sections" | "design";

export function SellLeftPanel(props: {
  tab: SellTab;
  setTab: (t: SellTab) => void;
  page: SellPage;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onAdd: (type: string) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleHidden: (id: string) => void;
  onMove: (from: number, to: number) => void;
  onProps: (id: string, props: Record<string, string | number | boolean>) => void;
  onTheme: (p: Partial<SellTheme>) => void;
  onMeta: (p: { title?: string; slug?: string }) => void;
}) {
  const selected = props.page.blocks.find(b => b.id === props.selectedId) ?? null;
  return (
    <aside className="cz-lp">
      <div className="cz-lp-tabs">
        <button className={props.tab === "sections" ? "on" : ""} onClick={() => props.setTab("sections")}><Layers size={13} /> Sections</button>
        <button className={props.tab === "design" ? "on" : ""} onClick={() => props.setTab("design")}><Palette size={13} /> Design</button>
      </div>
      {props.tab === "sections" && selected ? (
        <Inspector
          block={selected}
          onChange={p => props.onProps(selected.id, p)}
          onBack={() => props.onSelect(null)}
          onRemove={() => { props.onRemove(selected.id); props.onSelect(null); }}
        />
      ) : null}
      {props.tab === "sections" && !selected ? <SectionsTab {...props} /> : null}
      {props.tab === "design" ? <ThemeTab page={props.page} onTheme={props.onTheme} onMeta={props.onMeta} /> : null}
    </aside>
  );
}
