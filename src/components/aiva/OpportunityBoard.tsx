import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Lightbulb, Sparkles, Users, ChevronDown, ChevronRight, X, Bookmark, FlaskConical,
} from "lucide-react";
import { useOpportunities } from "@/hooks/use-opportunities";
import {
  OPPORTUNITY_CTA, OPPORTUNITY_LABEL, type Opportunity, type OpportunityKind,
} from "@/lib/opportunities/types";
import { SIGNAL_LABEL } from "@/lib/signals/types";

const KIND_TONE: Record<OpportunityKind, { bg: string; fg: string }> = {
  app: { bg: "#EEF2FF", fg: "#3730A3" },
  course: { bg: "#ECFDF5", fg: "#047857" },
  resource: { bg: "#F0F9FF", fg: "#0369A1" },
  coaching: { bg: "#FEF3C7", fg: "#92400E" },
  event: { bg: "#FCE7F3", fg: "#9D174D" },
  content: { bg: "#F3F4F6", fg: "#374151" },
  monetization: { bg: "#FFF7ED", fg: "#9A3412" },
};

const BUILD_ROUTE: Record<OpportunityKind, string> = {
  app: "/app/apps",
  course: "/app/club/courses",
  resource: "/app/club/resources",
  coaching: "/app/club/coaching",
  event: "/app/club/events",
  content: "/app/club/courses",
  monetization: "/app/manage/sell",
};

/**
 * Product Opportunity intelligence — patterns in aggregate member behavior that
 * point at something worth building. Never raw analytics: every card states
 * what AI noticed, the evidence behind it, why it matters, and what to build.
 */
export function OpportunityBoard() {
  const { opportunities, isDemo, signalCount, setStatus } = useOpportunities();
  const [showDismissed, setShowDismissed] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  const visible = useMemo(
    () => opportunities.filter(o => (showDismissed ? true : o.status !== "dismissed")),
    [opportunities, showDismissed],
  );

  return (
    <div style={{display:"grid",gap:16}}>
      {isDemo && (
        <div style={{
          display:"flex",gap:10,alignItems:"flex-start",border:"1px dashed #C7D2FE",
          background:"#EEF2FF",borderRadius:12,padding:"10px 14px",
        }}>
          <FlaskConical size={16} color="#3730A3" style={{marginTop:2}}/>
          <div style={{fontSize:12,color:"#3730A3"}}>
            <strong>Sample Data</strong> — Your Club Hasn't Collected Enough Real Member Behavior Yet, So These
            Patterns Are Generated From {signalCount} Clearly Labeled Demo Signals. Real Numbers Replace Them
            Automatically Once Behavior Is Recorded.
          </div>
        </div>
      )}

      <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
        <Lightbulb size={16} color="#B45309"/>
        <span style={{fontSize:13,color:"#374151"}}>
          <strong>{visible.filter(o => o.status === "open").length}</strong> Open Opportunities Found In Aggregate Member Behavior.
        </span>
        <button className="am-btn" onClick={() => setShowDismissed(v => !v)} style={{marginLeft:"auto"}}>
          {showDismissed ? "Hide Dismissed" : "Show Dismissed"}
        </button>
      </div>

      {visible.length === 0 && (
        <div style={{border:"1px solid #E5E7EB",borderRadius:14,padding:24,textAlign:"center",color:"#6B7280",fontSize:13}}>
          No Patterns Yet. As Members Ask, Search, Complete And Abandon Content, Opportunities Appear Here.
        </div>
      )}

      {visible.map(o => (
        <OpportunityCard
          key={o.id}
          o={o}
          open={!!expanded[o.id]}
          onToggle={() => setExpanded(e => ({ ...e, [o.id]: !e[o.id] }))}
          onStatus={setStatus}
          onBuild={() => { setStatus(o.id, "planned"); navigate({ to: BUILD_ROUTE[o.kind] }); }}
        />
      ))}
    </div>
  );
}

function OpportunityCard({ o, open, onToggle, onStatus, onBuild }: {
  o: Opportunity;
  open: boolean;
  onToggle: () => void;
  onStatus: (id: string, s: Opportunity["status"]) => void;
  onBuild: () => void;
}) {
  const tone = KIND_TONE[o.kind];
  const dim = o.status === "dismissed";

  return (
    <div style={{
      border:"1px solid #E5E7EB",borderRadius:14,background:"#fff",padding:16,
      opacity:dim ? 0.55 : 1,
    }}>
      <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
        <span style={{
          background:tone.bg,color:tone.fg,fontSize:11,fontWeight:800,letterSpacing:".05em",
          textTransform:"uppercase",padding:"4px 8px",borderRadius:999,
        }}>{OPPORTUNITY_LABEL[o.kind]}</span>
        {o.audience > 0 && (
          <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:12,color:"#6B7280"}}>
            <Users size={13}/> {o.audience} Members Affected · Last {o.windowDays} Days
          </span>
        )}
        {o.isDemo && (
          <span style={{fontSize:11,color:"#3730A3",background:"#EEF2FF",padding:"3px 7px",borderRadius:999}}>
            Sample Data
          </span>
        )}
        {o.status !== "open" && (
          <span style={{fontSize:11,fontWeight:700,color:"#6B7280",textTransform:"capitalize"}}>{o.status}</span>
        )}
      </div>

      <p style={{fontSize:14,color:"#111827",margin:"10px 0 0",lineHeight:1.5}}>{o.noticed}</p>

      <div style={{marginTop:12,border:"1px solid #F3F4F6",background:"#FAFAFA",borderRadius:12,padding:12}}>
        <div style={{fontSize:11,fontWeight:800,letterSpacing:".05em",color:"#6B7280",textTransform:"uppercase"}}>
          Suggested
        </div>
        <div style={{fontSize:15,fontWeight:800,color:"#111827",marginTop:3}}>{o.suggestedTitle}</div>
        <p style={{fontSize:13,color:"#374151",margin:"4px 0 0"}}>{o.suggestedSummary}</p>
        {o.buildFrom.length > 0 && (
          <div style={{marginTop:8}}>
            <div style={{fontSize:12,color:"#6B7280",marginBottom:4}}>Use Existing Content From:</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {o.buildFrom.map(b => (
                <span key={b.id} style={{
                  fontSize:12,border:"1px solid #E5E7EB",background:"#fff",borderRadius:999,padding:"3px 9px",
                }}>{b.title}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}>
        <button className="am-btn primary" onClick={onBuild}>
          <Sparkles size={14}/> {OPPORTUNITY_CTA[o.kind]}
        </button>
        <button className="am-btn" onClick={() => onStatus(o.id, o.status === "planned" ? "open" : "planned")}>
          <Bookmark size={14}/> {o.status === "planned" ? "Unsave" : "Save For Later"}
        </button>
        <button className="am-btn" onClick={() => onStatus(o.id, o.status === "dismissed" ? "open" : "dismissed")}>
          <X size={14}/> {o.status === "dismissed" ? "Restore" : "Dismiss"}
        </button>
        <button className="am-btn" onClick={onToggle} style={{marginLeft:"auto"}}>
          {open ? <ChevronDown size={14}/> : <ChevronRight size={14}/>} Evidence
        </button>
      </div>

      {open && (
        <div style={{marginTop:12,borderTop:"1px solid #F3F4F6",paddingTop:12,display:"grid",gap:10}}>
          <div>
            <div style={{fontSize:11,fontWeight:800,letterSpacing:".05em",color:"#6B7280",textTransform:"uppercase"}}>
              Signals
            </div>
            <div style={{display:"grid",gap:6,marginTop:6}}>
              {o.evidence.map(e => (
                <div key={e.kind} style={{display:"flex",gap:8,alignItems:"baseline",flexWrap:"wrap"}}>
                  <span style={{fontSize:13,fontWeight:700,color:"#111827",minWidth:180}}>
                    {e.count} {SIGNAL_LABEL[e.kind]}
                  </span>
                  {e.samples.map(s => (
                    <span key={s} style={{fontSize:12,color:"#6B7280",fontStyle:"italic"}}>“{s}”</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{fontSize:11,fontWeight:800,letterSpacing:".05em",color:"#6B7280",textTransform:"uppercase"}}>
              Why It Matters
            </div>
            <p style={{fontSize:13,color:"#374151",margin:"4px 0 0"}}>{o.why}</p>
          </div>
        </div>
      )}
    </div>
  );
}
