import { BUILD_STEPS, type BuildStep } from "@/lib/buildplan/types";

export function BuildPlanProgress({ current, accent }: { current: BuildStep; accent: string }) {
  const idx = BUILD_STEPS.indexOf(current);
  return (
    <div className="bp-steps" aria-label="Build progress">
      {BUILD_STEPS.map((s, i) => (
        <span key={s} className={`bp-step${i <= idx ? " on" : ""}`} style={i === idx ? { color: accent } : {}}>
          {s}
          {i < BUILD_STEPS.length - 1 && <i className="bp-step-sep">→</i>}
        </span>
      ))}
    </div>
  );
}
