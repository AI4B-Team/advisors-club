import { useState } from "react";
import { GitBranch, Plus, ChevronRight, Trash2, Rocket } from "lucide-react";
import { FUNNEL_STEP_KINDS, FUNNEL_TEMPLATES, type Funnel, type SellDoc } from "@/lib/sell/types";
import { makeFunnel } from "@/lib/sell/store";

/** Optional layer. Nothing here is required to publish a simple Club page. */
export function FunnelsPanel({ doc, update }: { doc: SellDoc; update: (fn: (d: SellDoc) => SellDoc) => void }) {
  const [adding, setAdding] = useState(false);

  if (!doc.funnelsEnabled) {
    return (
      <section className="sl-card sl-funnel-off">
        <div>
          <strong><GitBranch size={14} /> Funnels</strong>
          <p>Connect Pages Into A Sequence — Landing Page To Checkout To Club. Only Turn This On If You Need It. A Single Club Page Works Perfectly Without It.</p>
        </div>
        <button className="sl-btn" onClick={() => update(d => ({ ...d, funnelsEnabled: true }))}>Turn On Funnels</button>
      </section>
    );
  }

  function addFunnel(templateId: string) {
    const tpl = FUNNEL_TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return;
    update(d => ({ ...d, funnels: [...d.funnels, makeFunnel(tpl.name, tpl.steps)] }));
    setAdding(false);
  }

  function patchFunnel(id: string, fn: (f: Funnel) => Funnel) {
    update(d => ({ ...d, funnels: d.funnels.map(f => f.id === id ? { ...fn(f), updatedAt: Date.now() } : f) }));
  }

  const pageOptions = [{ id: doc.clubPage.id, title: `${doc.clubPage.title} (Club)` }, ...doc.pages.map(p => ({ id: p.id, title: p.title }))];

  return (
    <section className="sl-section">
      <header className="sl-sec-head">
        <div><h2>Funnels</h2><p>Optional. Sequence Your Pages When An Offer Needs More Than One Step.</p></div>
        <div className="sl-sec-acts">
          <button className="sl-btn" onClick={() => setAdding(v => !v)}><Plus size={13} /> New Funnel</button>
          <button className="sl-btn ghost" onClick={() => update(d => ({ ...d, funnelsEnabled: false }))}>Hide Funnels</button>
        </div>
      </header>

      {adding ? (
        <div className="sl-tpl-row">
          {FUNNEL_TEMPLATES.map(t => (
            <button key={t.id} className="sl-tpl" onClick={() => addFunnel(t.id)}>
              <strong>{t.name}</strong><span>{t.desc}</span>
            </button>
          ))}
        </div>
      ) : null}

      {!doc.funnels.length ? <div className="sl-empty">No Funnels Yet.</div> : null}

      {doc.funnels.map(f => (
        <div className="sl-card sl-funnel" key={f.id}>
          <div className="sl-funnel-top">
            <input value={f.name} onChange={e => patchFunnel(f.id, x => ({ ...x, name: e.target.value }))} />
            <div className="sl-funnel-acts">
              <button className={`sl-btn${f.live ? " on" : ""}`} onClick={() => patchFunnel(f.id, x => ({ ...x, live: !x.live }))}>
                <Rocket size={12} /> {f.live ? "Live" : "Draft"}
              </button>
              <button className="sl-btn ghost" onClick={() => update(d => ({ ...d, funnels: d.funnels.filter(x => x.id !== f.id) }))}><Trash2 size={12} /></button>
            </div>
          </div>
          <div className="sl-steps">
            {f.steps.map((s, i) => (
              <div className="sl-step" key={s.id}>
                <span className="sl-step-kind">{FUNNEL_STEP_KINDS.find(k => k.kind === s.kind)?.label ?? s.kind}</span>
                <select
                  value={s.pageId ?? ""}
                  onChange={e => patchFunnel(f.id, x => ({ ...x, steps: x.steps.map(st => st.id === s.id ? { ...st, pageId: e.target.value || null } : st) }))}
                >
                  <option value="">Not Connected</option>
                  {pageOptions.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
                {i < f.steps.length - 1 ? <ChevronRight size={14} className="sl-step-arrow" /> : null}
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
