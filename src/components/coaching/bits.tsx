import type { ReactNode } from "react";
import { X } from "lucide-react";
import type { Lifecycle } from "@/lib/coaching/types";
import { LIFECYCLE_LABEL } from "@/lib/coaching/types";

export function Avatar({ src, name, size = 34 }: { src: string; name: string; size?: number }) {
  return src
    ? <img className="coach-av" src={src} alt="" width={size} height={size} style={{ width: size, height: size }} loading="lazy" />
    : <span className="coach-av coach-av-fb" style={{ width: size, height: size }}>{name.slice(0, 1)}</span>;
}

export function LifePill({ stage }: { stage: Lifecycle }) {
  return <span className={`coach-life coach-life-${stage}`}>{LIFECYCLE_LABEL[stage]}</span>;
}

export function StatCard({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="coach-stat">
      <span className="coach-stat-l">{label}</span>
      <strong className="coach-stat-v">{value}</strong>
      {hint && <span className="coach-stat-h">{hint}</span>}
    </div>
  );
}

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <div className="coach-modal-wrap" role="dialog" aria-modal="true" aria-label={title}>
      <button className="coach-modal-scrim" aria-label="Close" onClick={onClose} />
      <div className={`coach-modal${wide ? " is-wide" : ""}`}>
        <header className="coach-modal-head">
          <h3>{title}</h3>
          <button className="coach-icon-btn" onClick={onClose} aria-label="Close"><X size={15} /></button>
        </header>
        <div className="coach-modal-body">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="coach-field">
      <span className="coach-field-l">{label}</span>
      {children}
      {hint && <span className="coach-field-h">{hint}</span>}
    </label>
  );
}

export function Empty({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="coach-empty">
      <span className="coach-empty-i">{icon}</span>
      <h3>{title}</h3>
      <p>{body}</p>
      {action}
    </div>
  );
}

export function Progress({ pct, tone = "amber" }: { pct: number; tone?: "amber" | "green" | "red" }) {
  return (
    <div className="coach-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <span className={`coach-bar-fill tone-${tone}`} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </div>
  );
}
