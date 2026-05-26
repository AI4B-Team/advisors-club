import { useState } from "react";
import { Info } from "lucide-react";

type Props = {
  on: boolean;
  onChange: (v: boolean) => void;
};

export function EmailBlastToggle({ on, onChange }: Props) {
  const [hover, setHover] = useState(false);
  return (
    <div className="email-blast">
      <span
        className="email-blast-info"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        tabIndex={0}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        aria-label="Email blast info"
      >
        <Info size={14}/>
        {hover && (
          <span className="email-blast-tip" role="tooltip">
            Turning this on will also send this post to ALL members of your group via email. You can only do this once every 72 hours.
          </span>
        )}
      </span>
      <span className="email-blast-label">Send email to all members</span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        className={`email-blast-switch${on ? " on" : ""}`}
        onClick={() => onChange(!on)}
      >
        <span className="email-blast-knob" />
      </button>
    </div>
  );
}
