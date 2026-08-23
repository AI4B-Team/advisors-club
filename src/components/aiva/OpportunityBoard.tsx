import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { X, Bookmark, FlaskConical, ChevronDown, ChevronRight, Check } from "lucide-react";
import { useOpportunities } from "@/hooks/use-opportunities";
import {
  FAMILY_LABEL, MONETIZATION_LABEL, OPPORTUNITY_CTA, OPPORTUNITY_FAMILY, OPPORTUNITY_LABEL,
  STATUS_LABEL, type Opportunity, type OpportunityFamily, type OpportunityStatus,
} from "@/lib/opportunities/types";
import { SIGNAL_LABEL } from "@/lib/signals/types";
import { setPendingAppBrief } from "@/lib/apps/pending";

type Filter = "all" | OpportunityFamily;
const FILTERS: Filter[] = ["all", "build", "revenue", "members"];

/**
 * Opportunities — AIVA thinking out loud like a business strategist:
 * "Here's What I Noticed. Here's Why It Matters. Here's What I Recommend.
 * Want Me To Handle It?" Not a dashboard, not a report: an editorial feed
 * where the insight is the loudest thing on the row.
 */
export function OpportunityBoard() {
  const { opportunities, isDemo, signalCount, setStatus, decide } = useOpportunities();
  const [filter, setFilter] = useState<Filter>("all");
  const [showHidden, setShowHidden] = useState(false);
  const navigate = useNavigate();

  const scoped = useMemo(
    () =>
      opportunities.filter(
        o =>
          (showHidden ? true : o.status !== "dismissed") &&
          (filter === "all" ? true : OPPORTUNITY_FAMILY[o.kind] === filter),
      ),
    [opportunities, filter, showHidden],
  );

  const active = scoped.filter(o => o.status === "new" || o.status === "reviewing");
  const inMotion = scoped.filter(o => o.status === "approved" || o.status === "building");
  const done = scoped.filter(o => o.status === "completed");
  const hidden = scoped.filter(o => o.status === "dismissed");

  const approve = (o: Opportunity) => {
    decide(o, "approved");
    if (o.kind === "app") {
      // Hand the brief straight to the AI app builder so "Build It" builds it.
      setPendingAppBrief(
        `${o.suggestedTitle} — ${o.suggestedSummary} Build This For Members Who Asked About ${o.topic}.`,
      );
    }
    navigate({ to: o.buildHref ?? "/app/aiva" });
  };

  return (
    <div className="opp-feed">
      <div className="opp-lede">
        <p>
          Here's What I Noticed In Your Business Over The Last 90 Days.
          {active.length > 0 && <strong> {active.length} Worth Your Attention.</strong>}
        </p>
        <div className="opp-filters">
          {FILTERS.map(f => (
            <button
              key={f}
              className={`opp-filter${filter === f ? " is-active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "Everything" : FAMILY_LABEL[f]}
            </button>
          ))}
        </div>
      </div>

      {isDemo && (
        <p className="opp-demo">
          <FlaskConical size={13} />
          Sample Data — Built From {signalCount} Labeled Demo Signals Until Real Member Behavior Is Recorded.
        </p>
      )}

      {scoped.length === 0 && (
        <p className="opp-empty">
          Nothing To Flag Right Now. I'll Surface Opportunities As Member Behavior Builds Up.
        </p>
      )}

      {active.map(o => (
        <OpportunityRow key={o.id} o={o} onStatus={setStatus} onDecide={decide} onApprove={() => approve(o)} />
      ))}

      {inMotion.length > 0 && (
        <>
          <h3 className="opp-section">In Motion</h3>
          {inMotion.map(o => (
            <OpportunityRow key={o.id} o={o} onStatus={setStatus} onDecide={decide} onApprove={() => approve(o)} />
          ))}
        </>
      )}

      {done.length > 0 && (
        <>
          <h3 className="opp-section">Completed</h3>
          {done.map(o => (
            <OpportunityRow key={o.id} o={o} onStatus={setStatus} onDecide={decide} onApprove={() => approve(o)} />
          ))}
        </>
      )}

      <button className="opp-hidden-toggle" onClick={() => setShowHidden(v => !v)}>
        {showHidden ? "Hide Dismissed" : `Show Dismissed${hidden.length ? ` (${hidden.length})` : ""}`}
      </button>
    </div>
  );
}

function OpportunityRow({ o, onStatus, onDecide, onApprove }: {
  o: Opportunity;
  onStatus: (id: string, s: OpportunityStatus) => void;
  onDecide: (o: Opportunity, s: OpportunityStatus) => void;
  onApprove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [money, setMoney] = useState(o.monetization?.[0]);

  return (
    <article className={`opp-row${o.status === "dismissed" ? " is-dismissed" : ""}`}>
      <div className="opp-kind">
        {OPPORTUNITY_LABEL[o.kind]}
        {o.status !== "new" && <span className="opp-state">{STATUS_LABEL[o.status]}</span>}
      </div>

      <h4 className="opp-insight">{o.insight}</h4>
      <p className="opp-signal">{o.signal || `${o.audience} Members · Last ${o.windowDays} Days`}</p>
      <p className="opp-action">{o.action}</p>

      <button className="opp-more" onClick={() => setOpen(v => !v)}>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {open ? "Less" : "Why I'm Telling You This"}
      </button>

      {open && (
        <div className="opp-detail">
          <div>
            <span className="opp-label">What I Noticed</span>
            <p>{o.noticed}</p>
          </div>
          <div>
            <span className="opp-label">Why It Matters</span>
            <p>{o.why}</p>
          </div>
          <div>
            <span className="opp-label">What I Recommend</span>
            <p>
              <strong>{o.suggestedTitle}</strong> — {o.suggestedSummary}
            </p>
          </div>

          {o.buildFrom.length > 0 && (
            <div>
              <span className="opp-label">I'd Build It From</span>
              <p>{o.buildFrom.map(b => b.title).join(" · ")}</p>
            </div>
          )}

          {o.connections && o.connections.length > 0 && (
            <div>
              <span className="opp-label">Where It Would Connect</span>
              <p>{o.connections.map(c => `${c.count} ${c.group}`).join(" · ")}</p>
            </div>
          )}

          {o.evidence.length > 0 && (
            <div>
              <span className="opp-label">The Evidence</span>
              <p>
                {o.evidence.map(e => `${e.count} ${SIGNAL_LABEL[e.kind]}`).join(" · ")} · {o.audience} Members
              </p>
              {o.evidence.flatMap(e => e.samples).slice(0, 2).map((s, i) => (
                <p key={i} className="opp-quote">“{s}”</p>
              ))}
            </div>
          )}

          <div>
            <span className="opp-label">What I Can Do</span>
            <ul className="opp-cando">
              {o.canDo.map(c => (
                <li key={c.label}>
                  <Check size={13} />
                  {c.label}
                  {c.needsApproval && <em> — With Your Approval</em>}
                </li>
              ))}
            </ul>
          </div>

          {o.monetization && (
            <div>
              <span className="opp-label">How You'd Offer It</span>
              <div className="opp-money">
                {o.monetization.map(m => (
                  <button
                    key={m}
                    className={`opp-money-opt${money === m ? " is-active" : ""}`}
                    onClick={() => setMoney(m)}
                  >
                    {MONETIZATION_LABEL[m]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="opp-actions">
        {o.status !== "completed" && (
          <button className="opp-primary" onClick={onApprove}>
            {OPPORTUNITY_CTA[o.kind]}
          </button>
        )}
        <button
          className="opp-quiet"
          onClick={() => onStatus(o.id, o.status === "reviewing" ? "new" : "reviewing")}
        >
          <Bookmark size={14} /> {o.status === "reviewing" ? "Unsave" : "Save For Later"}
        </button>
        <button
          className="opp-quiet"
          onClick={() => (o.status === "dismissed" ? onStatus(o.id, "new") : onDecide(o, "dismissed"))}
        >
          <X size={14} /> {o.status === "dismissed" ? "Restore" : "Not Relevant"}
        </button>
      </div>
    </article>
  );
}
