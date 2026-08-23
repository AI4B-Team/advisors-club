import { useMemo, useState } from "react";
import { Sparkles, Check, RefreshCw, DollarSign, Users, Link2, TrendingUp, BookOpen, HelpCircle } from "lucide-react";
import { useBusinessGraph } from "@/hooks/use-business-graph";
import { buildLaunchKit, type LaunchKit } from "@/lib/apps/launch";
import { patchApp } from "@/lib/apps/store";
import { addRelationships } from "@/lib/relationships/store";
import { accessLabel } from "@/lib/commerce/types";
import type { App } from "@/lib/apps/types";
import type { RelationshipDraft } from "@/lib/relationships/types";

/**
 * Everything AIVA can do *around* an app once it exists. Each block is a
 * suggestion the creator applies on purpose — AIVA never publishes copy,
 * pricing or member-facing connections on its own.
 */
export function AppLaunchKit({ app }: { app: App }) {
  const { graph } = useBusinessGraph();
  const [nonce, setNonce] = useState(0);
  const kit: LaunchKit = useMemo(() => buildLaunchKit(app, graph), [app, graph, nonce]); // eslint-disable-line react-hooks/exhaustive-deps
  const [done, setDone] = useState<Record<string, boolean>>({});
  const mark = (k: string) => setDone(d => ({ ...d, [k]: true }));

  function applyDescription() {
    patchApp(app.id, { description: kit.description });
    mark("description");
  }

  function applyOnboarding() {
    patchApp(app.id, {
      config: { ...app.config, onboarding: kit.onboarding, help: kit.help },
    });
    mark("onboarding");
  }

  function applyPricing(access = kit.pricing.access, pricing = kit.pricing.pricing) {
    patchApp(app.id, { access, pricing });
    mark("pricing");
  }

  function applyPlacements(drafts: RelationshipDraft[]) {
    addRelationships(drafts);
    mark("placements");
  }

  return (
    <div className="apx-kit">
      <div className="apx-kit-head">
        <div>
          <h3><Sparkles size={15} /> AI Launch Kit</h3>
          <p className="apx-muted">
            I Looked At This Tool, Your Content And What Members Have Been Asking For. Here's
            Everything I'd Do Next — Nothing Goes Live Until You Say So.
          </p>
        </div>
        <button className="apx-mini" onClick={() => setNonce(n => n + 1)}><RefreshCw size={13} /> Rethink</button>
      </div>

      {/* Description ------------------------------------------------- */}
      <Block icon={<BookOpen size={14} />} title="How I'd Describe It" done={done.description}>
        <p className="apx-kit-copy">{kit.description}</p>
        <button className="apx-mini" onClick={applyDescription} disabled={done.description}>
          {done.description ? <><Check size={13} /> Applied</> : "Use This Description"}
        </button>
      </Block>

      {/* Onboarding + help ------------------------------------------- */}
      <Block icon={<HelpCircle size={14} />} title="Member Onboarding And Help" done={done.onboarding}>
        <ol className="apx-kit-steps">
          {kit.onboarding.map(s => <li key={s}>{s}</li>)}
        </ol>
        <div className="apx-kit-faq">
          {kit.help.map(h => (
            <details key={h.q}><summary>{h.q}</summary><p>{h.a}</p></details>
          ))}
        </div>
        <button className="apx-mini" onClick={applyOnboarding} disabled={done.onboarding}>
          {done.onboarding ? <><Check size={13} /> Added To The App</> : "Add To The App"}
        </button>
      </Block>

      {/* Pricing ------------------------------------------------------ */}
      <Block icon={<DollarSign size={14} />} title="Free Or Paid" done={done.pricing}>
        <p className="apx-kit-lead">{kit.pricing.headline}</p>
        <p className="apx-kit-copy">{kit.pricing.rationale}</p>
        <div className="apx-kit-opts">
          <button className="apx-primary-btn" onClick={() => applyPricing()} disabled={done.pricing}>
            {done.pricing ? "Applied" : `Set To ${accessLabel(kit.pricing.access)}`}
          </button>
          {kit.pricing.alternatives.map(alt => (
            <button
              key={alt.label}
              className="apx-mini"
              disabled={done.pricing}
              onClick={() => applyPricing(alt.access, alt.pricing)}
            >
              {alt.label}
            </button>
          ))}
        </div>
        <p className="apx-muted">You Can Change This Any Time Under Access And Pricing.</p>
      </Block>

      {/* Audience ----------------------------------------------------- */}
      <Block icon={<Users size={14} />} title="Who It's For">
        <p className="apx-kit-lead">{kit.audience.label}</p>
        <p className="apx-kit-copy">{kit.audience.reason}</p>
        {kit.audience.quotes.map((q, i) => <p key={i} className="apx-kit-quote">“{q}”</p>)}
      </Block>

      {/* Placements --------------------------------------------------- */}
      <Block icon={<Link2 size={14} />} title="Where It Belongs" done={done.placements}>
        {kit.placements.length === 0 ? (
          <p className="apx-muted">Nothing To Connect It To Yet. Add A Course Or Resource And I'll Find The Spots.</p>
        ) : (
          <>
            <p className="apx-kit-copy">
              I Found {kit.placements.length} Places Where This Tool Would Make Existing Content Better.
            </p>
            <ul className="apx-kit-places">
              {kit.placements.map((p, i) => (
                <li key={i}>
                  <strong>{p.sourceTitle}</strong>
                  <span>{p.reason}</span>
                </li>
              ))}
            </ul>
            <button className="apx-mini" onClick={() => applyPlacements(kit.placements)} disabled={done.placements}>
              {done.placements ? <><Check size={13} /> Sent For Review</> : "Add These Connections"}
            </button>
            <p className="apx-muted">Connections Land In AIVA → Settings → Connections For Approval Before Members See Them.</p>
          </>
        )}
      </Block>

      {/* Upsell ------------------------------------------------------- */}
      <Block icon={<TrendingUp size={14} />} title="How I'd Grow Revenue Around It">
        <ul className="apx-kit-places">
          {kit.upsell.map(u => <li key={u}><span>{u}</span></li>)}
        </ul>
      </Block>
    </div>
  );
}

function Block({ icon, title, done, children }: {
  icon: React.ReactNode;
  title: string;
  done?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={`apx-kit-sec${done ? " is-done" : ""}`}>
      <h4>{icon} {title}{done && <em><Check size={12} /> Done</em>}</h4>
      {children}
    </section>
  );
}
