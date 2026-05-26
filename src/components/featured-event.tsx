import { useEffect, useState } from "react";
import { CalendarClock, Video } from "lucide-react";

type Props = {
  title: string;
  subtitle?: string;
  whenISO: string; // target datetime
  whenLabel: string; // human label e.g. "Thu, May 28 · 3:00 PM EDT"
  host?: string;
};

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return { d, h, m, s, done: ms === 0 };
}

export function FeaturedEvent({ title, subtitle, whenISO, whenLabel, host }: Props) {
  const target = new Date(whenISO).getTime();
  const [t, setT] = useState(() => diff(target));
  useEffect(() => {
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="hm-card hm-featured">
      <div className="hm-featured-head">
        <span className="hm-featured-pill"><CalendarClock size={12}/> Featured event</span>
      </div>
      <h3 className="hm-featured-title">{title}</h3>
      {subtitle && <p className="hm-featured-sub">{subtitle}</p>}
      <div className="hm-featured-when">{whenLabel}</div>

      <div className="hm-countdown" aria-label="Time until event">
        <div className="hm-count-cell"><span className="hm-count-num">{pad(t.d)}</span><span className="hm-count-lbl">Days</span></div>
        <div className="hm-count-cell"><span className="hm-count-num">{pad(t.h)}</span><span className="hm-count-lbl">Hrs</span></div>
        <div className="hm-count-cell"><span className="hm-count-num">{pad(t.m)}</span><span className="hm-count-lbl">Min</span></div>
        <div className="hm-count-cell"><span className="hm-count-num">{pad(t.s)}</span><span className="hm-count-lbl">Sec</span></div>
      </div>

      <div className="hm-featured-foot">
        {host && <span className="hm-featured-host">Hosted by {host}</span>}
        <button className="hm-featured-cta"><Video size={14}/> RSVP</button>
      </div>
    </div>
  );
}
