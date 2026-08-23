// Builder Core — the block palette. Blocks are filtered by page type, so a
// Sales page only ever offers marketing blocks and a Club page only offers
// Club blocks, from ONE catalog.

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { blocksForPageType } from "@/lib/builder/catalog";
import { CATEGORY_META, CATEGORY_ORDER, type BlockCategory, type PageTypeId } from "@/lib/builder/types";

export function BlockPalette({
  pageType, used, onAdd,
}: {
  pageType: PageTypeId;
  used: string[];
  onAdd: (type: string) => void;
}) {
  const [q, setQ] = useState("");
  const defs = useMemo(() => blocksForPageType(pageType), [pageType]);

  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out: { cat: BlockCategory; items: typeof defs }[] = [];
    for (const cat of CATEGORY_ORDER) {
      const items = defs.filter(d =>
        d.category === cat &&
        (!needle || d.label.toLowerCase().includes(needle) || d.desc.toLowerCase().includes(needle)),
      );
      if (items.length) out.push({ cat, items });
    }
    return out;
  }, [defs, q]);

  return (
    <div className="cz-lp-body">
      <label className="cz-search">
        <Search size={13} />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search Blocks" aria-label="Search Blocks" />
      </label>

      {groups.map(g => (
        <section key={g.cat} className="cz-blockgroup">
          <h4 style={{ color: CATEGORY_META[g.cat].ink }}>{CATEGORY_META[g.cat].label}</h4>
          <div className="cz-blockgrid">
            {g.items.map(d => {
              const disabled = !d.duplicable && used.includes(d.type);
              return (
                <button
                  key={d.type}
                  type="button"
                  className="cz-blockcard"
                  disabled={disabled}
                  onClick={() => onAdd(d.type)}
                  title={disabled ? "Already On This Page" : d.desc}
                >
                  <span className="cz-blockcard-dot" style={{ background: CATEGORY_META[d.category].tint, color: CATEGORY_META[d.category].ink }}>
                    <Plus size={12} />
                  </span>
                  <span className="cz-blockcard-txt">
                    <strong>{d.label}</strong>
                    <em>{d.desc}</em>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}

      {!groups.length ? <p className="cz-empty-note">No Blocks Match “{q}”.</p> : null}
    </div>
  );
}
