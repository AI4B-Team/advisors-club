import { useMemo, useState } from "react";
import {
  Plus, Search, GripVertical, Eye, EyeOff, Copy, Trash2, ChevronLeft, Settings2,
  Layers, Palette, Globe, Type, Square, Image as ImageIcon, PanelLeft, LayoutGrid,
} from "lucide-react";
import { blocksForPage, CATEGORY_META, defForType } from "@/lib/customize/blocks";
import type { Block, BlockCategory, CustomizeDoc, PageId, Theme, WhiteLabel } from "@/lib/customize/types";

const CATS: BlockCategory[] = ["content", "community", "learning", "business"];

const BRAND_SWATCHES = ["#F5A623", "#111827", "#2563EB", "#10B981", "#6D28D9", "#E85D3A", "#0EA5E9", "#C9A84C"];

/* ============ Blocks tab ============ */
function BlocksTab({
  page, blocks, selectedId, onSelect, onAdd, onRemove, onDuplicate, onToggleHidden, onMove,
}: {
  page: PageId;
  blocks: Block[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (type: string) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleHidden: (id: string) => void;
  onMove: (from: number, to: number) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [q, setQ] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const available = useMemo(() => {
    const used = new Set(blocks.map(b => b.type));
    return blocksForPage(page).filter(d => {
      if (!d.duplicable && used.has(d.type)) return false;
      if (!q.trim()) return true;
      return `${d.label} ${d.desc}`.toLowerCase().includes(q.toLowerCase());
    });
  }, [page, blocks, q]);

  if (adding) {
    return (
      <div className="cz-lp-body">
        <button className="cz-back" onClick={() => setAdding(false)}><ChevronLeft size={14} /> Back To Layers</button>
        <div className="cz-search"><Search size={13} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search Blocks" /></div>
        {CATS.map(cat => {
          const items = available.filter(d => d.category === cat);
          if (!items.length) return null;
          const meta = CATEGORY_META[cat];
          return (
            <div className="cz-cat" key={cat}>
              <div className="cz-cat-head">{meta.label}</div>
              <div className="cz-cat-items">
                {items.map(d => (
                  <button key={d.type} className="cz-lib-item" onClick={() => { onAdd(d.type); setAdding(false); }}>
                    <span className="cz-ico" style={{ background: meta.tint, color: meta.ink }}><LayoutGrid size={14} /></span>
                    <span className="cz-lib-in"><strong>{d.label}</strong><em>{d.desc}</em></span>
                    <Plus size={14} />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        {!available.length ? <div className="cz-lp-empty">Every Available Block Is Already On This Page.</div> : null}
      </div>
    );
  }

  return (
    <div className="cz-lp-body">
      <button className="cz-add-btn" onClick={() => setAdding(true)}><Plus size={15} /> Add Block</button>
      <div className="cz-lp-label">Layers · {blocks.length}</div>
      <div className="cz-layers">
        {blocks.map((b, i) => {
          const def = defForType(b.type);
          const meta = CATEGORY_META[def?.category ?? "content"];
          return (
            <div
              key={b.id}
              className={`cz-layer${selectedId === b.id ? " is-selected" : ""}${b.hidden ? " is-hidden" : ""}${dragIndex === i ? " is-dragging" : ""}`}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragEnd={() => setDragIndex(null)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => { if (dragIndex !== null && dragIndex !== i) onMove(dragIndex, i); setDragIndex(null); }}
              onClick={() => onSelect(b.id)}
            >
              <GripVertical size={14} className="cz-grip" />
              <span className="cz-ico" style={{ background: meta.tint, color: meta.ink }}><LayoutGrid size={13} /></span>
              <span className="cz-layer-name">{def?.label ?? b.type}</span>
              <span className="cz-layer-acts">
                <button title={b.hidden ? "Show" : "Hide"} onClick={e => { e.stopPropagation(); onToggleHidden(b.id); }}>{b.hidden ? <EyeOff size={13} /> : <Eye size={13} />}</button>
                {def?.duplicable ? <button title="Duplicate" onClick={e => { e.stopPropagation(); onDuplicate(b.id); }}><Copy size={13} /></button> : null}
                <button title="Remove" onClick={e => { e.stopPropagation(); onRemove(b.id); }}><Trash2 size={13} /></button>
              </span>
            </div>
          );
        })}
        {!blocks.length ? <div className="cz-lp-empty">No Blocks Yet. Add One To Start.</div> : null}
      </div>
    </div>
  );
}

/* ============ Inspector ============ */
function Inspector({ block, onChange, onBack, onRemove }: {
  block: Block;
  onChange: (props: Record<string, string | number | boolean>) => void;
  onBack: () => void;
  onRemove: () => void;
}) {
  const def = defForType(block.type);
  if (!def) return null;
  return (
    <div className="cz-lp-body">
      <button className="cz-back" onClick={onBack}><ChevronLeft size={14} /> Back To Layers</button>
      <div className="cz-insp-head">
        <Settings2 size={14} />
        <div><strong>{def.label}</strong><span>{def.desc}</span></div>
      </div>
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
                <textarea rows={4} value={String(val ?? "")} onChange={e => onChange({ [f.key]: e.target.value })} placeholder={f.placeholder} />
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
      <button className="cz-danger" onClick={onRemove}><Trash2 size={13} /> Remove Block</button>
    </div>
  );
}

/* ============ Theme tab ============ */
function ThemeTab({ theme, onChange }: { theme: Theme; onChange: (p: Partial<Theme>) => void }) {
  return (
    <div className="cz-lp-body">
      <div className="cz-lp-label"><ImageIcon size={12} /> Club Imagery</div>
      <label className="cz-field"><span>Logo URL</span><input value={theme.logoUrl} onChange={e => onChange({ logoUrl: e.target.value })} placeholder="https://…" /></label>
      <label className="cz-field"><span>Cover Image URL</span><input value={theme.coverUrl} onChange={e => onChange({ coverUrl: e.target.value })} placeholder="https://…" /></label>

      <div className="cz-lp-label"><Palette size={12} /> Brand Color</div>
      <div className="cz-swatches">
        {BRAND_SWATCHES.map(c => (
          <button key={c} className={`cz-swatch${theme.brand.toLowerCase() === c.toLowerCase() ? " on" : ""}`} style={{ background: c }} onClick={() => onChange({ brand: c })} aria-label={c} />
        ))}
        <input type="color" value={theme.brand} onChange={e => onChange({ brand: e.target.value })} className="cz-color" aria-label="Custom Brand Color" />
      </div>

      <div className="cz-lp-label"><Type size={12} /> Typography</div>
      <div className="cz-seg">
        {(["system", "grotesk", "serif", "mono"] as const).map(f => (
          <button key={f} className={theme.font === f ? "on" : ""} onClick={() => onChange({ font: f })}>{f === "system" ? "Sans" : f[0].toUpperCase() + f.slice(1)}</button>
        ))}
      </div>

      <div className="cz-lp-label"><Square size={12} /> Button Treatment</div>
      <div className="cz-seg">
        {(["rounded", "pill", "square"] as const).map(b => (
          <button key={b} className={theme.buttonStyle === b ? "on" : ""} onClick={() => onChange({ buttonStyle: b })}>{b[0].toUpperCase() + b.slice(1)}</button>
        ))}
      </div>

      <div className="cz-lp-label">Background Treatment</div>
      <div className="cz-seg">
        {(["light", "soft", "warm", "dark"] as const).map(b => (
          <button key={b} className={theme.background === b ? "on" : ""} onClick={() => onChange({ background: b })}>{b[0].toUpperCase() + b.slice(1)}</button>
        ))}
      </div>

      <div className="cz-lp-label">Density</div>
      <div className="cz-seg">
        {(["compact", "comfortable", "spacious"] as const).map(b => (
          <button key={b} className={theme.density === b ? "on" : ""} onClick={() => onChange({ density: b })}>{b[0].toUpperCase() + b.slice(1)}</button>
        ))}
      </div>

      <label className="cz-field"><span>Corner Radius · {theme.radius}px</span>
        <input type="range" min={4} max={22} value={theme.radius} onChange={e => onChange({ radius: Number(e.target.value) })} />
      </label>

      <div className="cz-lp-label"><PanelLeft size={12} /> Navigation Visibility</div>
      <label className="cz-field row"><span>Show Club Navigation</span>
        <button type="button" className={`cz-switch${theme.showNav ? " on" : ""}`} onClick={() => onChange({ showNav: !theme.showNav })}><i /></button>
      </label>
      <label className="cz-field row"><span>Show Club Switcher Rail</span>
        <button type="button" className={`cz-switch${theme.showRail ? " on" : ""}`} onClick={() => onChange({ showRail: !theme.showRail })}><i /></button>
      </label>
      <p className="cz-note">Options Are Limited To Combinations That Stay On-Brand And Accessible.</p>
    </div>
  );
}

/* ============ Brand / White Label tab ============ */
function BrandTab({ wl, onChange }: { wl: WhiteLabel; onChange: (p: Partial<WhiteLabel>) => void }) {
  return (
    <div className="cz-lp-body">
      <div className="cz-lp-label"><Globe size={12} /> Custom Domain</div>
      <label className="cz-field"><span>Domain</span><input value={wl.customDomain} onChange={e => onChange({ customDomain: e.target.value })} placeholder="club.yourdomain.com" /></label>
      <div className={`cz-domain-state${wl.domainVerified ? " ok" : ""}`}>
        {wl.customDomain
          ? (wl.domainVerified ? "Domain Verified — Members Load Your Club At This Address." : "Pending DNS Verification. Point A CNAME To advisorsclub.app, Then Verify.")
          : "No Custom Domain Connected Yet."}
      </div>
      <button className="cz-ghost" disabled={!wl.customDomain} onClick={() => onChange({ domainVerified: !wl.domainVerified })}>
        {wl.domainVerified ? "Re-Check DNS" : "Verify Domain"}
      </button>

      <div className="cz-lp-label">White Label</div>
      <label className="cz-field row"><span>Hide Platform Branding</span>
        <button type="button" className={`cz-switch${wl.hidePlatformBranding ? " on" : ""}`} onClick={() => onChange({ hidePlatformBranding: !wl.hidePlatformBranding })}><i /></button>
      </label>
      <label className="cz-field"><span>Favicon URL</span><input value={wl.faviconUrl} onChange={e => onChange({ faviconUrl: e.target.value })} placeholder="https://…" /></label>
      <label className="cz-field"><span>Email From Name</span><input value={wl.emailFromName} onChange={e => onChange({ emailFromName: e.target.value })} placeholder="Your Club" /></label>
      <label className="cz-field"><span>Support Email</span><input value={wl.supportEmail} onChange={e => onChange({ supportEmail: e.target.value })} placeholder="support@yourdomain.com" /></label>
      <p className="cz-note">Availability Depends On Your Current Plan. Nothing Here Changes Your Plan Or Billing.</p>
    </div>
  );
}

/* ============ Panel shell ============ */
export type LeftTab = "blocks" | "theme" | "brand";

export function LeftPanel(props: {
  tab: LeftTab;
  setTab: (t: LeftTab) => void;
  page: PageId;
  doc: CustomizeDoc;
  blocks: Block[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onAdd: (type: string) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleHidden: (id: string) => void;
  onMove: (from: number, to: number) => void;
  onProps: (id: string, props: Record<string, string | number | boolean>) => void;
  onTheme: (p: Partial<Theme>) => void;
  onWhiteLabel: (p: Partial<WhiteLabel>) => void;
}) {
  const selected = props.blocks.find(b => b.id === props.selectedId) ?? null;
  return (
    <aside className="cz-lp">
      <div className="cz-lp-tabs">
        <button className={props.tab === "blocks" ? "on" : ""} onClick={() => props.setTab("blocks")}><Layers size={13} /> Blocks</button>
        <button className={props.tab === "theme" ? "on" : ""} onClick={() => props.setTab("theme")}><Palette size={13} /> Theme</button>
        <button className={props.tab === "brand" ? "on" : ""} onClick={() => props.setTab("brand")}><Globe size={13} /> Brand</button>
      </div>
      {props.tab === "blocks" && selected ? (
        <Inspector
          block={selected}
          onChange={p => props.onProps(selected.id, p)}
          onBack={() => props.onSelect(null)}
          onRemove={() => { props.onRemove(selected.id); props.onSelect(null); }}
        />
      ) : null}
      {props.tab === "blocks" && !selected ? (
        <BlocksTab
          page={props.page}
          blocks={props.blocks}
          selectedId={props.selectedId}
          onSelect={props.onSelect}
          onAdd={props.onAdd}
          onRemove={props.onRemove}
          onDuplicate={props.onDuplicate}
          onToggleHidden={props.onToggleHidden}
          onMove={props.onMove}
        />
      ) : null}
      {props.tab === "theme" ? <ThemeTab theme={props.doc.theme} onChange={props.onTheme} /> : null}
      {props.tab === "brand" ? <BrandTab wl={props.doc.whiteLabel} onChange={props.onWhiteLabel} /> : null}
    </aside>
  );
}
