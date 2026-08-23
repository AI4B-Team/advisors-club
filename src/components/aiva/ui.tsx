import type { ReactNode } from "react";

export function AmCard({ title, desc, icon, actions, children, tone }: {
  title?: string; desc?: string; icon?: ReactNode; actions?: ReactNode; children?: ReactNode; tone?: "plain" | "accent";
}) {
  return (
    <section className={`am-card${tone === "accent" ? " am-card-accent" : ""}`}>
      {(title || actions) && (
        <header className="am-card-h">
          {icon && <span className="am-card-i">{icon}</span>}
          <div className="am-card-t">
            {title && <h3>{title}</h3>}
            {desc && <p>{desc}</p>}
          </div>
          {actions && <div className="am-card-a">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export function AmField({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="am-field">
      <span className="am-field-l">{label}</span>
      {hint && <span className="am-field-h">{hint}</span>}
      {children}
    </label>
  );
}

export function AmToggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={`am-switch${on ? " on" : ""}`}
      onClick={() => onChange(!on)}
    >
      <span />
    </button>
  );
}

export function AmStatus({ kind, children }: { kind: "ready" | "processing" | "needs-review" | "error" | "on" | "off"; children: ReactNode }) {
  return <span className={`am-status am-status-${kind}`}>{children}</span>;
}

export function AmSectionLabel({ children }: { children: ReactNode }) {
  return <h4 className="am-section-l">{children}</h4>;
}
