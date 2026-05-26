import { useState } from "react";
import { Mail } from "lucide-react";

type Props = {
  on: boolean;
  onChange: (v: boolean) => void;
};

export function EmailBlastToggle({ on, onChange }: Props) {
  const [hover, setHover] = useState(false);
  return (
    <span className="email-blast">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label="Send email to all members"
        className={`email-blast-icon${on ? " on" : ""}`}
        onClick={() => onChange(!on)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
      >
        <Mail size={16} />
        {on && <span className="email-blast-dot" aria-hidden />}
      </button>
      {hover && (
        <span className="email-blast-tip" role="tooltip">
          <b>{on ? "Email blast: ON" : "Email blast: OFF"}</b>
          <span>Click to {on ? "stop emailing" : "also email"} this post to ALL members. Limit: once every 72 hours.</span>
        </span>
      )}
    </span>
  );
}
