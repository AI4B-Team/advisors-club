import { useEffect, useRef } from "react";

const BARS = 40;

/**
 * Audio-level waveform.
 *
 * This used to be React state updated by a 110ms interval inside the Go Live
 * hook, which re-rendered the entire studio (video tiles, chat, transcript)
 * ~9x per second. Now the bars are mutated directly through refs on an
 * animation frame loop, so the React tree never re-renders for the animation.
 */
export function GoLiveWaveform({ active, micOn }: { active: boolean; micOn: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const bars = Array.from(el.children) as HTMLElement[];

    if (!active) {
      bars.forEach(b => { b.style.height = "8%"; });
      return;
    }

    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      if (t - last >= 110) {
        last = t;
        const amp = micOn ? 0.95 : 0.15;
        for (const b of bars) {
          b.style.height = `${Math.max(8, (Math.random() * amp + 0.05) * 100)}%`;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, micOn]);

  return (
    <div className="gl-wave" ref={ref} aria-hidden="true">
      {Array.from({ length: BARS }, (_, i) => (
        <span key={i} style={{ height: "8%" }} />
      ))}
    </div>
  );
}
