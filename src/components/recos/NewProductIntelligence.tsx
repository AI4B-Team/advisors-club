import { useEffect, useMemo, useState } from "react";
import {
  Sparkles, Loader2, Check, X, Pencil, ChevronDown, ChevronRight, Wand2,
} from "lucide-react";
import { useRecommendations } from "@/hooks/use-recommendations";
import { analyzableProducts, SOURCE_GROUP_LABEL } from "@/lib/recos/retro";
import {
  dismissNewProduct, getRecoSettings, setRecoSettings, subscribeRecoSettings,
} from "@/lib/recos/settings";
import { RECO_PLACEMENT_LABEL, RECO_TYPE_LABEL, type ContentRecommendation } from "@/lib/recos/types";
import type { NodeId } from "@/lib/graph/types";

const GROUP_ORDER = [
  "Course", "Resource", "Community", "Coaching", "Event",
  "AI Persona", "Onboarding & Pages", "Offers", "Other",
];

/**
 * Retroactive Content Intelligence.
 *
 * Pick any product — new App, Course, Resource, Coaching Program, Event or
 * Offer — and AIVA looks BACKWARD across everything that already exists to find
 * where it would improve the member experience. Product-type agnostic by design.
 */
export function NewProductIntelligence() {
  const { graph, forTarget, scanNewProduct, setStatus, setStatusMany, edit, remove } = useRecommendations();
  const products = useMemo(() => analyzableProducts(graph), [graph]);
  const [productId, setProductId] = useState<NodeId | "">("");
  const [scanning, setScanning] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [settings, setSettings] = useState(getRecoSettings());

  useEffect(() => subscribeRecoSettings(() => setSettings(getRecoSettings())), []);
  useEffect(() => {
    if (!productId && products.length) setProductId(products[0].id);
  }, [products, productId]);

  /** Products created since AIVA last looked — these get the "ready" prompt. */
  const unanalyzed = products.filter(
    p => !settings.analyzed.includes(p.id) && !settings.dismissed.includes(p.id),
  );
  const spotlight = unanalyzed[0];

  const items = productId ? forTarget(productId) : [];
  const product = products.find(p => p.id === productId);

  const grouped = useMemo(() => {
    const map = new Map<string, ContentRecommendation[]>();
    for (const r of items) {
      const n = graph.nodes.find(x => x.id === r.sourceId);
      const g = (n && SOURCE_GROUP_LABEL[n.type]) || "Other";
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(r);
    }
    return [...map.entries()].sort(
      (a, b) => GROUP_ORDER.indexOf(a[0]) - GROUP_ORDER.indexOf(b[0]),
    );
  }, [items, graph]);

  function analyze(id: NodeId) {
    setProductId(id);
    setScanning(true);
    setTimeout(() => {
      scanNewProduct(id);
      setScanning(false);
      setOpen(Object.fromEntries(GROUP_ORDER.map(g => [g, true])));
    }, 700);
  }

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const suggested = items.filter(r => r.status === "suggested");
  const selectedIds = [...selected].filter(id => suggested.some(r => r.id === id));

  return (
    <div style={{display:"grid",gap:16}}>
      {spotlight && (
        <div style={{
          border:"1px solid #FDE68A",background:"linear-gradient(135deg,#FFFBEB,#FFF7ED)",
          borderRadius:14,padding:16,display:"flex",gap:12,alignItems:"flex-start",flexWrap:"wrap",
        }}>
          <Sparkles size={18} color="#B45309" style={{marginTop:2}}/>
          <div style={{flex:"1 1 260px",minWidth:0}}>
            <div style={{fontWeight:800,color:"#111827"}}>Your {spotlight.title} Is Ready.</div>
            <p style={{fontSize:13,color:"#6B7280",margin:"4px 0 0"}}>
              I Can Analyze Your Existing Courses, Resources, Community, Coaching, Events, AI Persona And
              Onboarding To Find Where It Would Naturally Help Your Members.
            </p>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button className="am-btn" onClick={() => dismissNewProduct(spotlight.id)}>Not Now</button>
            <button className="am-btn primary" onClick={() => analyze(spotlight.id)}>
              Review All Recommendations
            </button>
          </div>
        </div>
      )}

      <div style={{border:"1px solid #E5E7EB",borderRadius:14,padding:16,background:"#fff"}}>
        <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
          <Wand2 size={16} color="#6B7280"/>
          <span style={{fontSize:13,color:"#374151",fontWeight:600}}>Analyze Existing Content For</span>
          <select
            value={productId}
            onChange={e => { setProductId(e.target.value); setSelected(new Set()); }}
            style={{border:"1px solid #E5E7EB",borderRadius:8,padding:"8px 10px",fontSize:13}}
          >
            {products.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
          <button
            className="am-btn primary"
            disabled={!productId || scanning}
            onClick={() => productId && analyze(productId)}
          >
            {scanning ? <Loader2 size={14} className="spin"/> : <Sparkles size={14}/>}
            {scanning ? "Analyzing…" : "Find Opportunities"}
          </button>
        </div>

        {product && !scanning && (
          <p style={{fontSize:13,color:"#374151",margin:"12px 0 0"}}>
            {items.length
              ? <>I Found <strong>{items.length}</strong> Place{items.length === 1 ? "" : "s"} Where <strong>{product.title}</strong> Could Help Your Members.</>
              : <>No Suggestions Yet — Run An Analysis To See Where <strong>{product.title}</strong> Fits.</>}
          </p>
        )}

        {selectedIds.length > 0 && (
          <div style={{display:"flex",gap:8,marginTop:12,alignItems:"center"}}>
            <span style={{fontSize:12,color:"#6B7280"}}>{selectedIds.length} Selected</span>
            <button className="am-btn primary" onClick={() => { setStatusMany(selectedIds, "approved"); setSelected(new Set()); }}>
              <Check size={14}/> Approve Selected
            </button>
            <button className="am-btn" onClick={() => { setStatusMany(selectedIds, "rejected"); setSelected(new Set()); }}>
              Dismiss Selected
            </button>
          </div>
        )}
      </div>

      {grouped.map(([group, rows]) => {
        const isOpen = open[group] !== false;
        return (
          <div key={group} style={{border:"1px solid #E5E7EB",borderRadius:14,background:"#fff"}}>
            <button
              onClick={() => setOpen(o => ({ ...o, [group]: !isOpen }))}
              style={{
                width:"100%",display:"flex",alignItems:"center",gap:8,padding:"12px 14px",
                background:"none",border:"none",cursor:"pointer",textAlign:"left",
              }}
            >
              {isOpen ? <ChevronDown size={15} color="#6B7280"/> : <ChevronRight size={15} color="#6B7280"/>}
              <span style={{fontSize:12,fontWeight:800,letterSpacing:".06em",color:"#6B7280",textTransform:"uppercase"}}>
                {group}
              </span>
              <span style={{fontSize:12,color:"#9CA3AF"}}>({rows.length})</span>
            </button>

            {isOpen && (
              <div style={{borderTop:"1px solid #F3F4F6"}}>
                {rows.map(r => (
                  <div key={r.id} style={{padding:"12px 14px",borderBottom:"1px solid #F3F4F6",display:"flex",gap:10}}>
                    <input
                      type="checkbox"
                      checked={selected.has(r.id)}
                      disabled={r.status !== "suggested"}
                      onChange={() => toggle(r.id)}
                      style={{marginTop:4}}
                      aria-label={`Select Recommendation For ${r.sourceTitle}`}
                    />
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:700,color:"#111827"}}>{r.sourceTitle}</div>
                      {editingId === r.id ? (
                        <div style={{display:"flex",gap:8,marginTop:6}}>
                          <input
                            value={draft}
                            onChange={e => setDraft(e.target.value)}
                            style={{flex:1,border:"1px solid #E5E7EB",borderRadius:8,padding:"6px 8px",fontSize:13}}
                          />
                          <button className="am-btn primary" onClick={() => { edit(r.id, { copy: draft }); setEditingId(null); }}>
                            Save
                          </button>
                          <button className="am-btn" onClick={() => setEditingId(null)}>Cancel</button>
                        </div>
                      ) : (
                        <p style={{fontSize:13,color:"#374151",margin:"4px 0 0"}}>{r.copy}</p>
                      )}
                      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:6,fontSize:11,color:"#6B7280"}}>
                        <span>{RECO_TYPE_LABEL[r.type]}</span>
                        <span>• {RECO_PLACEMENT_LABEL[r.placement]}</span>
                        <span>• {r.reason}</span>
                        {r.status !== "suggested" && (
                          <span style={{fontWeight:700,color:r.status === "approved" ? "#047857" : "#B91C1C"}}>
                            • {r.status === "approved" ? "Approved" : "Dismissed"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:6,alignItems:"flex-start"}}>
                      <button className="am-btn" title="Approve" onClick={() => setStatus(r.id, "approved")}><Check size={14}/></button>
                      <button className="am-btn" title="Edit" onClick={() => { setEditingId(r.id); setDraft(r.copy); }}><Pencil size={14}/></button>
                      <button className="am-btn" title="Dismiss" onClick={() => remove(r.id)}><X size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <label style={{
        display:"flex",gap:10,alignItems:"flex-start",border:"1px solid #E5E7EB",
        borderRadius:14,padding:14,background:"#fff",cursor:"pointer",
      }}>
        <input
          type="checkbox"
          checked={settings.autoOptimize}
          onChange={e => setRecoSettings({ autoOptimize: e.target.checked })}
          style={{marginTop:3}}
        />
        <span>
          <span style={{fontSize:13,fontWeight:700,color:"#111827"}}>Allow Auto-Optimization</span>
          <span style={{display:"block",fontSize:12,color:"#6B7280",marginTop:2}}>
            Off By Default. When Off, Nothing Is Ever Added To Published Content Until You Approve It.
          </span>
        </span>
      </label>
    </div>
  );
}
