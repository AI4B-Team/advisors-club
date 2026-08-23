import { useEffect, useState } from "react";
import { AmCard } from "./ui";
import { CAPABILITIES, OPERATING_MODES, type AivaAdmin, type CapabilityId } from "@/lib/aiva-admin";
import {
  AUTONOMY_LEVELS, getAutonomy, setAutonomy, subscribeAutonomy, type AutonomyLevel,
} from "@/lib/aiva/autonomy";

export function AivaAutonomy({ admin, update }: {
  admin: AivaAdmin;
  update: (p: Partial<AivaAdmin>) => void;
}) {
  const [levels, setLevels] = useState<Record<CapabilityId, AutonomyLevel>>(() => getAutonomy());

  useEffect(() => {
    setLevels(getAutonomy());
    return subscribeAutonomy(() => setLevels(getAutonomy()));
  }, []);

  function pick(id: CapabilityId, level: AutonomyLevel) {
    setLevels(setAutonomy(id, level));
  }

  const enabled = CAPABILITIES.filter(c => admin.capabilities[c.id]);

  return (
    <div className="am-stack">
      <AmCard title="Default Autonomy" desc="Where AIVA starts for anything you haven't set individually.">
        <div className="aiva-auto-modes">
          {OPERATING_MODES.map(m => (
            <button
              key={m.id}
              type="button"
              className={`aiva-auto-mode${admin.mode === m.id ? " on" : ""}`}
              onClick={() => update({ mode: m.id })}
            >
              <b>{m.label}</b>
              <span>{m.blurb}</span>
            </button>
          ))}
        </div>
      </AmCard>

      <AmCard title="Per Capability" desc="Individual work can run at its own level — nothing forces one global setting.">
        <div className="aiva-auto-list">
          {enabled.map(c => (
            <div key={c.id} className="aiva-auto-row">
              <div className="aiva-auto-meta">
                <b>{c.label}</b>
                <span>{c.blurb}</span>
              </div>
              <div className="aiva-auto-seg" role="group" aria-label={`${c.label} autonomy`}>
                {AUTONOMY_LEVELS.map(l => (
                  <button
                    key={l.id}
                    type="button"
                    title={l.blurb}
                    className={levels[c.id] === l.id ? "on" : ""}
                    onClick={() => pick(c.id, l.id)}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {enabled.length === 0 && (
            <p className="am-muted">Turn on a capability first — then choose how independently AIVA runs it.</p>
          )}
        </div>
      </AmCard>
    </div>
  );
}
