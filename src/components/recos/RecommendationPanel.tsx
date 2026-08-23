import { useMemo, useState } from "react";
import { Sparkles, Check, X, Pencil, Trash2, ChevronRight, Loader2 } from "lucide-react";
import { useRecommendations } from "@/hooks/use-recommendations";
import {
  RECO_PLACEMENT_LABEL, RECO_STATUS_LABEL, RECO_TYPE_LABEL, RECO_TYPE_TONE,
  type ContentRecommendation,
} from "@/lib/recos/types";
import type { NodeId } from "@/lib/graph/types";

const TYPE_COLOR: Record<"value" | "offer", { bg: string; fg: string }> = {
  value: { bg: "#ECFDF5", fg: "#047857" },
  offer: { bg: "#FEF3C7", fg: "#92400E" },
};

/**
 * Reusable AI recommendation review surface. Drop it into any admin content
 * area (courses today; community, coaching, events, apps next) by passing the
 * graph node id of the thing being edited.
 */
export function RecommendationPanel({ scope, title = "AI Recommendations", subtitle }: {
  scope: NodeId;
  title?: string;
  subtitle?: string;
}) {
  const { items, suggested, scan, setStatus, edit, remove } = useRecommendations(scope);
  const [open, setOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftCopy, setDraftCopy] = useState("");

  const grouped = useMemo(() => {
    const map = new Map<string, ContentRecommendation[]>();
    for (const r of items) {
      if (r.status === "removed") continue;
      if (!map.has(r.sourceTitle)) map.set(r.sourceTitle, []);
      map.get(r.sourceTitle)!.push(r);
    }
    return [...map.entries()];
  }, [items]);

  function runScan() {
    setScanning(true);
    setTimeout(() => {
      scan();
      setScanning(false);
      setOpen(true);
    }, 600);
  }

  return (
    <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:14,padding:16,marginBottom:24}}>
      <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        <div style={{width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#FEF3C7,#FDE68A)",display:"grid",placeItems:"center"}}>
          <Sparkles size={16} color="#92400E"/>
        </div>
        <div style={{flex:1,minWidth:180}}>
          <div style={{fontSize:14,fontWeight:800,color:"#111827"}}>{title}</div>
          <div style={{fontSize:12,color:"#6B7280"}}>
            {subtitle ?? (suggested.length
              ? `I Found ${suggested.length} Natural ${suggested.length === 1 ? "Place" : "Places"} To Recommend Your Products.`
              : "AI Reviews This Content Against Your Full Catalog — Nothing Is Added Without Your Approval.")}
          </div>
        </div>
        <button className="btn-ghost" onClick={runScan} disabled={scanning}>
          {scanning ? <><Loader2 size={14} className="spin"/> Scanning…</> : <><Sparkles size={14}/> Find Opportunities</>}
        </button>
        {grouped.length > 0 && (
          <button className="aiva-cta" onClick={() => setOpen(o => !o)}>
            Review Recommendations <ChevronRight size={14} style={{transform:open?"rotate(90deg)":"none",transition:"transform .15s"}}/>
          </button>
        )}
      </div>

      {open && grouped.length > 0 && (
        <div style={{marginTop:14,display:"grid",gap:12}}>
          {grouped.map(([source, recs]) => (
            <div key={source} style={{border:"1px solid #F3F4F6",borderRadius:12,overflow:"hidden"}}>
              <div style={{background:"#F9FAFB",padding:"8px 12px",fontSize:12,fontWeight:700,color:"#374151"}}>{source}</div>
              {recs.map(r => {
                const tone = TYPE_COLOR[RECO_TYPE_TONE[r.type]];
                return (
                  <div key={r.id} style={{padding:"12px 12px",borderTop:"1px solid #F3F4F6",display:"grid",gap:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                      <span style={{fontSize:13,fontWeight:700,color:"#111827"}}>{r.targetTitle}</span>
                      <span style={{background:tone.bg,color:tone.fg,fontSize:10,fontWeight:800,padding:"3px 8px",borderRadius:999}}>
                        {RECO_TYPE_LABEL[r.type]}
                      </span>
                      <span style={{fontSize:11,color:"#6B7280"}}>{RECO_PLACEMENT_LABEL[r.placement]}</span>
                      <span style={{fontSize:11,color:"#9CA3AF"}}>{Math.round(r.confidence * 100)}% Match</span>
                      <span style={{marginLeft:"auto",fontSize:11,fontWeight:700,color:r.status==="suggested"?"#6B7280":r.status==="rejected"?"#DC2626":"#047857"}}>
                        {RECO_STATUS_LABEL[r.status]}
                      </span>
                    </div>
                    <div style={{fontSize:12,color:"#6B7280"}}>{r.reason}</div>
                    {editingId === r.id ? (
                      <div style={{display:"grid",gap:8}}>
                        <textarea
                          value={draftCopy}
                          onChange={e => setDraftCopy(e.target.value)}
                          rows={2}
                          style={{width:"100%",border:"1px solid #E5E7EB",borderRadius:8,padding:"8px 10px",fontSize:13,color:"#111827",resize:"vertical"}}
                        />
                        <div style={{display:"flex",gap:8}}>
                          <button className="aiva-cta" onClick={() => { edit(r.id, { copy: draftCopy }); setEditingId(null); }}>
                            <Check size={14}/> Save Copy
                          </button>
                          <button className="btn-ghost" onClick={() => setEditingId(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{background:"#F9FAFB",borderRadius:8,padding:"8px 10px",fontSize:13,color:"#111827"}}>{r.copy}</div>
                    )}
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      {r.status !== "approved" && r.status !== "applied" && (
                        <button className="aiva-cta" onClick={() => setStatus(r.id, "approved")}><Check size={14}/> Approve</button>
                      )}
                      {(r.status === "approved") && (
                        <button className="btn-ghost" onClick={() => setStatus(r.id, "applied")}>Mark As Applied</button>
                      )}
                      <button className="btn-ghost" onClick={() => { setEditingId(r.id); setDraftCopy(r.copy); }}><Pencil size={14}/> Edit</button>
                      {r.status !== "rejected" && (
                        <button className="btn-ghost" onClick={() => setStatus(r.id, "rejected")}><X size={14}/> Dismiss</button>
                      )}
                      <button className="btn-ghost" onClick={() => remove(r.id)} style={{color:"#DC2626",borderColor:"#FCA5A5"}}><Trash2 size={14}/></button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
