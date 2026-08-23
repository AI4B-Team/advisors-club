// Builder Core — the shared block inspector. Fields come from the canonical
// catalog, so every block type edits the same way on every page type.

import { Copy, Eye, EyeOff, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { blockDef } from "@/lib/builder/catalog";
import type { BuilderSession } from "@/lib/builder/session";

export function BlockInspector({ session, selectedId }: { session: BuilderSession; selectedId: string | null }) {
  const blocks = session.page.blocks;
  const index = blocks.findIndex(b => b.id === selectedId);
  const block = index >= 0 ? blocks[index] : null;

  if (!block) {
    return <p className="cz-empty-note">Select A Block On The Canvas To Edit It.</p>;
  }

  const def = blockDef(block.type);

  return (
    <div className="cz-panel-body">
      <div className="cz-inspect-head">
        <div>
          <strong>{def?.label ?? block.type}</strong>
          <em>{def?.desc}</em>
        </div>
        <div className="cz-inspect-tools">
          <button type="button" onClick={() => session.moveBlock(index, index - 1)} disabled={index <= 0} aria-label="Move Up"><ArrowUp size={14} /></button>
          <button type="button" onClick={() => session.moveBlock(index, index + 1)} disabled={index >= blocks.length - 1} aria-label="Move Down"><ArrowDown size={14} /></button>
          <button type="button" onClick={() => session.toggleHidden(block.id)} aria-label={block.hidden ? "Show" : "Hide"}>
            {block.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          {def?.duplicable ? (
            <button type="button" onClick={() => session.duplicateBlock(block.id)} aria-label="Duplicate"><Copy size={14} /></button>
          ) : null}
          <button type="button" className="danger" onClick={() => session.removeBlock(block.id)} aria-label="Delete"><Trash2 size={14} /></button>
        </div>
      </div>

      {(def?.fields ?? []).map(f => {
        const value = block.props[f.key];
        const set = (v: string | number | boolean) => session.updateProps(block.id, { ...block.props, [f.key]: v });
        return (
          <label key={f.key} className="cz-field">
            <span>{f.label}</span>
            {f.type === "textarea" ? (
              <textarea rows={3} value={String(value ?? "")} placeholder={f.placeholder} onChange={e => set(e.target.value)} />
            ) : f.type === "select" ? (
              <select value={String(value ?? "")} onChange={e => set(e.target.value)}>
                {(f.options ?? []).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : f.type === "toggle" ? (
              <input type="checkbox" checked={Boolean(value)} onChange={e => set(e.target.checked)} />
            ) : f.type === "number" ? (
              <input type="number" min={f.min} max={f.max} value={Number(value ?? 0)} onChange={e => set(Number(e.target.value))} />
            ) : (
              <input value={String(value ?? "")} placeholder={f.placeholder} onChange={e => set(e.target.value)} />
            )}
          </label>
        );
      })}

      {!def ? <p className="cz-empty-note">This Block Type Is No Longer Available.</p> : null}
    </div>
  );
}
