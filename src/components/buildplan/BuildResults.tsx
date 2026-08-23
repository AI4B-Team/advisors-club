import { Check, ArrowRight, Sparkles } from "lucide-react";
import aivaAvatar from "@/assets/aiva-avatar.jpg";
import { CATEGORY_LABEL, type BuildResult } from "@/lib/buildplan/types";

export function BuildResults({
  accent, title, results, primaryLabel, onPrimary, secondaryLabel, onSecondary,
}: {
  accent: string;
  title: string;
  results: BuildResult[];
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}) {
  const built = results.filter(r => r.status === "built");
  const skipped = results.filter(r => r.status !== "built");

  return (
    <div className="abf-plan">
      <div className="abf-head">
        <img src={aivaAvatar} alt="AIVA" className="abf-avatar" />
        <div>
          <div className="abf-aiva-name">AIVA <Sparkles size={13} /></div>
          <div className="abf-aiva-bubble">
            {built.length} of {results.length} items are live. Everything's editable.
          </div>
        </div>
      </div>

      <div className="bp-title">{title}</div>

      <div className="bp-result-block">
        <div className="abf-pillar-h">Created</div>
        <ul className="abf-lines">
          {built.map(r => (
            <li key={r.itemId} className="abf-line done">
              <span className="abf-line-dot" style={{ background: accent, color: "#fff", borderColor: accent }}>
                <Check size={11} strokeWidth={3} />
              </span>
              <span className="abf-line-label">{r.label}</span>
              <span className="abf-line-pillar">{CATEGORY_LABEL[r.category]}</span>
            </li>
          ))}
        </ul>
      </div>

      {skipped.length > 0 && (
        <div className="bp-result-block">
          <div className="abf-pillar-h">Needs Your Setup</div>
          <ul className="abf-lines">
            {skipped.map(r => (
              <li key={r.itemId} className="abf-line">
                <span className="abf-line-dot" />
                <span className="abf-line-label">{r.label}</span>
                <span className="abf-line-pillar">{CATEGORY_LABEL[r.category]}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button className="abf-cta" style={{ background: accent }} onClick={onPrimary}>
        {primaryLabel} <ArrowRight size={15} />
      </button>
      {secondaryLabel && onSecondary && (
        <button className="bp-secondary" onClick={onSecondary}>{secondaryLabel}</button>
      )}
    </div>
  );
}
