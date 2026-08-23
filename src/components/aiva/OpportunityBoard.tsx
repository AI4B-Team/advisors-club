import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Sparkles, X, Bookmark, FlaskConical, ChevronDown, ChevronRight, Users } from "lucide-react";
import { useOpportunities } from "@/hooks/use-opportunities";
import { OPPORTUNITY_LABEL, type Opportunity, type OpportunityKind } from "@/lib/opportunities/types";
import { SIGNAL_LABEL } from "@/lib/signals/types";

const KIND_TONE: Record<OpportunityKind, { bg: string; fg: string }> = {
  app: { bg: "#EEF2FF", fg: "#3730A3" },
  course: { bg: "#ECFDF5", fg: "#047857" },
  resource: { bg: "#F0F9FF", fg: "#0369A1" },
  coaching: { bg: "#FEF3C7", fg: "#92400E" },
  event: { bg: "#FCE7F3", fg: "#9D174D" },
  content: { bg: "#F3F4F6", fg: "#374151" },
  monetization: { bg: "#FFF7ED", fg: "#9A3412" },
  engagement: { bg: "#FEF2F2", fg: "#B91C1C" },
};

const FALLBACK_HREF: Record<OpportunityKind, string> = {
  app: "/app/apps",
  course: "/app/club/courses",
  resource: "/app/club/resources",
  coaching: "/app/club/coaching",
  event: "/app/club/events",
  content: "/app/club/courses",
  monetization: "/app/sell",
  engagement: "/app/club/courses",
};

/**
 * Opportunities — "Here's What I Noticed. Here's What I Recommend. Want Me To
 * Handle It?" Deliberately not an analytics dashboard: one quiet line per
 * insight, the signal behind it, the recommended action, and four choices.
 */
export function OpportunityBoard() {
  const { opportunities, isDemo, signalCount, setStatus } = useOpportunities();
  const [showHidden, setShowHidden] = useState(false);
  const navigate = useNavigate();

  const visible = useMemo(
    () => opportunities.filter(o => (showHidden ? true : o.status !== "dismissed")),
    [opportunities, showHidden],
  );
  const openCount = visible.filter(o => o.status === "open").length;

  return (
    <div style={{ display: "grid", gap: 14, maxWidth: 880 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <p style={{ margin: 0, fontSize: 14, color: "#374151" }}>
          Here's What I Noticed In Your Business This Month.
          {openCount > 0 && <strong> {openCount} Opportunities.</strong>}
        </p>
        <button className="am-btn" onClick={() => setShowHidden(v => !v)} style={{ marginLeft: "auto" }}>
          {showHidden ? "Hide Dismissed" : "Show Dismissed"}
        </button>
      </div>

      {isDemo && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: "#6B7280" }}>
          <FlaskConical size={14} />
          Sample Data — Built From {signalCount} Labeled Demo Signals Until Real Member Behavior Is Recorded.
        </div>
      )}

      {visible.length === 0 && (
        <div style={{ border: "1px solid #E5E7EB", borderRadius: 14, padding: 28, textAlign: "center", color: "#6B7280", fontSize: 13 }}>
          Nothing To Flag Right Now. I'll Surface Opportunities As Member Behavior Builds Up.
        </div>
      )}

      {visible.map(o => (
        <OpportunityCard
          key={o.id}
          o={o}
          onStatus={setStatus}
          onBuild={() => { setStatus(o.id, "planned"); navigate({ to: o.buildHref ?? FALLBACK_HREF[o.kind] }); }}
        />
      ))}
    </div>
  );
}

function OpportunityCard({ o, onStatus, onBuild }: {
  o: Opportunity;
  onStatus: (id: string, s: Opportunity["status"]) => void;
  onBuild: () => void;
}) {
  const [open, setOpen] = useState(false);
  const tone = KIND_TONE[o.kind];
  const dim = o.status === "dismissed";

  return (
    <div style={{
      border: "1px solid #E5E7EB", borderRadius: 14, background: "#fff",
      padding: "16px 18px", opacity: dim ? 0.5 : 1,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{
          background: tone.bg, color: tone.fg, fontSize: 10.5, fontWeight: 800, letterSpacing: ".07em",
          textTransform: "uppercase", padding: "3px 8px", borderRadius: 999,
        }}>{OPPORTUNITY_LABEL[o.kind]}</span>
        {o.status !== "open" && (
          <span style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "capitalize" }}>
            {o.status === "planned" ? "Saved" : o.status}
          </span>
        )}
      </div>

      <p style={{ margin: "10px 0 0", fontSize: 16, fontWeight: 700, color: "#111827", lineHeight: 1.4 }}>
        {o.insight}
      </p>
      <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6B7280" }}>
        {o.signal}
        {o.audience > 0 && ` · ${o.audience} Members · Last ${o.windowDays} Days`}
      </p>
      <p style={{ margin: "8px 0 0", fontSize: 14, color: "#111827" }}>{o.action}</p>

      <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
        <button className="am-btn primary" onClick={onBuild}><Sparkles size={14} /> Build It</button>
        <button className="am-btn" onClick={() => setOpen(v => !v)}>
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />} Review
        </button>
        <button className="am-btn" onClick={() => onStatus(o.id, o.status === "planned" ? "open" : "planned")}>
          <Bookmark size={14} /> {o.status === "planned" ? "Unsave" : "Save For Later"}
        </button>
        <button className="am-btn" onClick={() => onStatus(o.id, o.status === "dismissed" ? "open" : "dismissed")}>
          <X size={14} /> {o.status === "dismissed" ? "Restore" : "Dismiss"}
        </button>
      </div>

      {open && (
        <div style={{ marginTop: 14, borderTop: "1px solid #F3F4F6", paddingTop: 14, display: "grid", gap: 12 }}>
          <div>
            <SubLabel>What I Noticed</SubLabel>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#374151", lineHeight: 1.5 }}>{o.noticed}</p>
          </div>
          <div>
            <SubLabel>Why It Matters</SubLabel>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#374151", lineHeight: 1.5 }}>{o.why}</p>
          </div>
          <div>
            <SubLabel>Recommended</SubLabel>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginTop: 3 }}>{o.suggestedTitle}</div>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: "#374151" }}>{o.suggestedSummary}</p>
          </div>
          {o.buildFrom.length > 0 && (
            <div>
              <SubLabel>Use Existing Content From</SubLabel>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                {o.buildFrom.map(b => (
                  <span key={b.id} style={{ fontSize: 12, border: "1px solid #E5E7EB", borderRadius: 999, padding: "3px 9px" }}>
                    {b.title}
                  </span>
                ))}
              </div>
            </div>
          )}
          {o.evidence.length > 0 && (
            <div>
              <SubLabel>Signals</SubLabel>
              <div style={{ display: "grid", gap: 5, marginTop: 6 }}>
                {o.evidence.map(e => (
                  <div key={e.kind} style={{ fontSize: 13, color: "#374151" }}>
                    <strong>{e.count}</strong> {SIGNAL_LABEL[e.kind]}
                    {e.samples[0] && <span style={{ color: "#6B7280" }}> — “{e.samples[0]}”</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {o.audience > 0 && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6B7280" }}>
              <Users size={13} /> {o.audience} Members Affected
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: ".07em", color: "#9CA3AF", textTransform: "uppercase" }}>
      {children}
    </div>
  );
}
