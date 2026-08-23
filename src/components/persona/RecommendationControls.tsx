import { useEffect, useState } from "react";
import { Target, BarChart3 } from "lucide-react";
import { AmCard, AmField, AmToggle } from "@/components/aiva/ui";
import {
  getRecoPolicy, setRecoPolicy, subscribeRecoPolicy,
  MODE_FREQUENCY, RECO_CATEGORIES, RECO_MODES,
  type RecoPolicy,
} from "@/lib/persona/reco-policy";
import { recoStats, subscribeRecoEvents } from "@/lib/persona/reco-events";

/**
 * Creator controls for member-facing recommendations. Nothing aggressive is
 * on by default: the shipped mode is Conservative and paid recommendations
 * are off until the expert turns them on.
 */
export function RecommendationControls() {
  const [policy, setPolicy] = useState<RecoPolicy>(getRecoPolicy);
  const [stats, setStats] = useState(() => recoStats());

  useEffect(() => {
    setPolicy(getRecoPolicy());
    setStats(recoStats());
    const a = subscribeRecoPolicy(() => setPolicy(getRecoPolicy()));
    const b = subscribeRecoEvents(() => setStats(recoStats()));
    return () => { a(); b(); };
  }, []);

  const save = (patch: Partial<RecoPolicy>) => setPolicy(setRecoPolicy(patch));
  const freq = policy.frequency;
  const base = MODE_FREQUENCY[policy.mode];
  const custom =
    freq.maxPerConversation !== base.maxPerConversation ||
    freq.minTurnsBetween !== base.minTurnsBetween ||
    freq.cooldownDays !== base.cooldownDays ||
    freq.maxPaidPerConversation !== base.maxPaidPerConversation;

  return (
    <>
      <AmCard
        title="Member Recommendations"
        desc="When Your AI May Point A Member To A Resource, App, Course, Program Or Event. Help Always Comes First."
        icon={<Target size={16} />}
      >
        <div className="am-mode-grid">
          {RECO_MODES.map(m => (
            <button
              key={m.id}
              className={`am-mode${policy.mode === m.id ? " on" : ""}`}
              onClick={() => save({ mode: m.id })}
            >
              <b>{m.label}</b><span>{m.hint}</span>
            </button>
          ))}
        </div>

        <div className="am-toggle-list">
          {RECO_CATEGORIES.map(c => (
            <div key={c.id} className="am-toggle-row">
              <div><b>{c.label}</b><span>{c.hint}</span></div>
              <AmToggle
                label={c.label}
                on={policy.categories[c.id]}
                onChange={v => save({ categories: { ...policy.categories, [c.id]: v } })}
              />
            </div>
          ))}
        </div>

        <div className="am-grid-2">
          <AmField label="Max Per Conversation" hint="Hard Cap, Whatever The Mode.">
            <input
              className="am-input" type="number" min={0} max={6} value={freq.maxPerConversation}
              onChange={e => save({ frequency: { ...freq, maxPerConversation: Number(e.target.value) } })}
            />
          </AmField>
          <AmField label="Max Paid Per Conversation" hint="Keeps Paid Suggestions Rare.">
            <input
              className="am-input" type="number" min={0} max={4} value={freq.maxPaidPerConversation}
              onChange={e => save({ frequency: { ...freq, maxPaidPerConversation: Number(e.target.value) } })}
            />
          </AmField>
          <AmField label="Messages Between Recommendations" hint="Prevents Back-To-Back Promotion.">
            <input
              className="am-input" type="number" min={0} max={20} value={freq.minTurnsBetween}
              onChange={e => save({ frequency: { ...freq, minTurnsBetween: Number(e.target.value) } })}
            />
          </AmField>
          <AmField label="Cooldown Per Product (Days)" hint="The Same Product Is Never Repeated Inside This Window.">
            <input
              className="am-input" type="number" min={0} max={120} value={freq.cooldownDays}
              onChange={e => save({ frequency: { ...freq, cooldownDays: Number(e.target.value) } })}
            />
          </AmField>
        </div>

        {custom && (
          <button className="am-btn" onClick={() => save({ frequency: { ...base } })}>
            Reset To {RECO_MODES.find(m => m.id === policy.mode)?.label} Defaults
          </button>
        )}
      </AmCard>

      <AmCard title="Recommendation Performance" desc="What Members Actually Found Useful. Last 30 Days." icon={<BarChart3 size={16} />}>
        <div className="ai-stats-grid">
          <div className="ai-stat"><b>{stats.shown}</b><span>Shown</span></div>
          <div className="ai-stat"><b>{stats.clicked}</b><span>Clicked</span></div>
          <div className="ai-stat"><b>{stats.purchased}</b><span>Purchased</span></div>
          <div className="ai-stat"><b>{stats.dismissed}</b><span>Dismissed</span></div>
        </div>
        {stats.top.length > 0 ? (
          <div className="am-toggle-list">
            {stats.top.map(t => (
              <div key={t.nodeId} className="am-toggle-row">
                <div><b>{t.title}</b><span>{t.shown} Shown · {t.clicked} Clicked · {t.purchased} Purchased</span></div>
              </div>
            ))}
          </div>
        ) : (
          <p className="am-hint">No Recommendations Have Been Shown Yet. This Fills In As Members Chat.</p>
        )}
      </AmCard>
    </>
  );
}
