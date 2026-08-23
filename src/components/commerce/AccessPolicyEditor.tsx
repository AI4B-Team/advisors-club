import { useMemo } from "react";
import {
  ACCESS_MODE_HINT, ACCESS_MODE_LABEL, accessLabel, isPurchasable,
  type AccessMode, type AccessPolicy, type Offer,
} from "@/lib/commerce";

const MODES: AccessMode[] = ["free", "membership", "plan", "course", "coaching", "purchase", "upgrade", "admin", "custom"];

export type PolicyOption = { id: string; label: string };

/**
 * The one place a creator configures how anything in the club is accessed.
 * Apps use it today; courses, resources and events can mount the same editor
 * because it only speaks the shared policy model.
 */
export function AccessPolicyEditor({
  policy,
  onChange,
  plans,
  courses,
  programs,
  productNoun = "App",
}: {
  policy: AccessPolicy;
  onChange: (next: AccessPolicy) => void;
  plans: string[];
  courses: PolicyOption[];
  programs: PolicyOption[];
  productNoun?: string;
}) {
  const offer: Offer = policy.offer ?? { price: 29 };
  const showOffer = policy.mode === "purchase" || policy.mode === "upgrade" || policy.mode === "custom";
  const showPlans = policy.mode === "plan" || policy.mode === "upgrade" || policy.mode === "custom";
  const showCourses = policy.mode === "course" || policy.mode === "upgrade" || policy.mode === "custom";
  const showPrograms = policy.mode === "coaching" || policy.mode === "upgrade" || policy.mode === "custom";

  const preview = useMemo(() => accessLabel(policy), [policy]);

  const set = (patch: Partial<AccessPolicy>) => onChange({ ...policy, ...patch });
  const setOffer = (patch: Partial<Offer>) => set({ offer: { ...offer, ...patch } });
  const toggle = (list: string[] | undefined, id: string) =>
    (list ?? []).includes(id) ? (list ?? []).filter(x => x !== id) : [...(list ?? []), id];

  return (
    <div className="cmx-editor">
      <div className="cmx-modes">
        {MODES.map(m => (
          <button
            key={m}
            className={`cmx-mode${policy.mode === m ? " is-on" : ""}`}
            onClick={() => onChange(nextPolicy(policy, m))}
          >
            <strong>{ACCESS_MODE_LABEL[m]}</strong>
            <em>{ACCESS_MODE_HINT[m]}</em>
          </button>
        ))}
      </div>

      {showPlans && (
        <PickList
          title="Eligible Plans"
          hint={policy.mode === "upgrade" ? "Members On These Plans Get It Free." : "Only These Plans Get Access."}
          options={plans.map(p => ({ id: p, label: `${p} Plan` }))}
          selected={policy.plans ?? []}
          onToggle={id => set({ plans: toggle(policy.plans, id) })}
        />
      )}

      {showCourses && (
        <PickList
          title="Included With Courses"
          hint="Enrolling In Any Of These Unlocks It."
          options={courses}
          selected={policy.courseIds ?? []}
          onToggle={id => set({
            courseIds: toggle(policy.courseIds, id),
            courseLabels: { ...policy.courseLabels, [id]: courses.find(c => c.id === id)?.label ?? id },
          })}
        />
      )}

      {showPrograms && (
        <PickList
          title="Included With Coaching Programs"
          hint="Joining Any Of These Unlocks It."
          options={programs}
          selected={policy.programIds ?? []}
          onToggle={id => set({
            programIds: toggle(policy.programIds, id),
            programLabels: { ...policy.programLabels, [id]: programs.find(p => p.id === id)?.label ?? id },
          })}
        />
      )}

      {policy.mode === "custom" && (
        <label className="apx-check-inline">
          <input
            type="checkbox"
            checked={(policy.rules ?? []).some(r => r.kind === "purchase")}
            onChange={e => set({
              rules: e.target.checked
                ? [...(policy.rules ?? []), { kind: "purchase" }]
                : (policy.rules ?? []).filter(r => r.kind !== "purchase"),
            })}
          />
          Also Allow A One-Time Purchase
        </label>
      )}

      {showOffer && isPurchasable({ ...policy, offer }) && (
        <div className="cmx-offer">
          <h4>Purchase Details</h4>
          <div className="apx-build-grid">
            <label className="apx-field">
              <span className="apx-field-l">Price</span>
              <input type="number" min={0} value={offer.price} onChange={e => setOffer({ price: Number(e.target.value) })} />
            </label>
            <label className="apx-field">
              <span className="apx-field-l">Billing</span>
              <select
                value={offer.interval ?? "one-time"}
                onChange={e => setOffer({ interval: e.target.value === "one-time" ? undefined : e.target.value as "month" | "year" })}
              >
                <option value="one-time">One-Time</option>
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
            </label>
          </div>
          <label className="apx-field">
            <span className="apx-field-l">Short Benefit</span>
            <input
              value={offer.benefit ?? ""}
              placeholder={`What This ${productNoun} Helps Them Do`}
              onChange={e => setOffer({ benefit: e.target.value })}
            />
          </label>
          <label className="apx-field">
            <span className="apx-field-l">Purchase Description</span>
            <textarea
              rows={3}
              value={offer.purchaseDescription ?? ""}
              placeholder="What They Get, And Why It's Worth It."
              onChange={e => setOffer({ purchaseDescription: e.target.value })}
            />
          </label>
          <label className="apx-field">
            <span className="apx-field-l">Upgrade Button</span>
            <input
              value={offer.ctaLabel ?? ""}
              placeholder={`Unlock ${productNoun}`}
              onChange={e => setOffer({ ctaLabel: e.target.value })}
            />
          </label>
        </div>
      )}

      <p className="cmx-preview">Members See: <strong>{preview}</strong></p>
    </div>
  );
}

function PickList({
  title, hint, options, selected, onToggle,
}: {
  title: string; hint: string; options: PolicyOption[]; selected: string[]; onToggle: (id: string) => void;
}) {
  return (
    <div className="cmx-pick">
      <span className="cmx-pick-t">{title}</span>
      <span className="cmx-pick-h">{hint}</span>
      {options.length === 0
        ? <p className="apx-muted">Nothing To Choose From Yet.</p>
        : (
          <div className="cmx-pick-list">
            {options.map(o => (
              <label key={o.id} className={`cmx-pick-item${selected.includes(o.id) ? " is-on" : ""}`}>
                <input type="checkbox" checked={selected.includes(o.id)} onChange={() => onToggle(o.id)} />
                {o.label}
              </label>
            ))}
          </div>
        )}
    </div>
  );
}

function nextPolicy(current: AccessPolicy, mode: AccessMode): AccessPolicy {
  const base: AccessPolicy = { ...current, mode };
  if (mode === "purchase" || mode === "upgrade") base.offer = current.offer ?? { price: 29, ctaLabel: "Unlock App" };
  if (mode === "free" || mode === "admin" || mode === "membership") delete base.offer;
  return base;
}
