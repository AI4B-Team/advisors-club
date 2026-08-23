import { AlertTriangle, Lock } from "lucide-react";
import { AmCard, AmSectionLabel, AmToggle } from "./ui";
import { CAPABILITIES, OPERATING_MODES, type AivaAdmin, type CapabilityId } from "@/lib/aiva-admin";

const GROUPS = ["Member Experience", "Content", "Admin Support"] as const;

export function AivaCapabilities({ admin, update }: { admin: AivaAdmin; update: (p: Partial<AivaAdmin>) => void }) {
  function toggle(id: CapabilityId, on: boolean) {
    update({ capabilities: { ...admin.capabilities, [id]: on } });
  }

  return (
    <div className="am-stack">
      <AmCard title="Operating Mode" desc="How Much AIVA Is Allowed To Do On Its Own.">
        <div className="am-mode-grid">
          {OPERATING_MODES.map(m => (
            <button
              key={m.id}
              className={`am-mode${admin.mode === m.id ? " on" : ""}${m.available ? "" : " off"}`}
              disabled={!m.available}
              onClick={() => m.available && update({ mode: m.id })}
            >
              <b>{m.label} {!m.available && <span className="am-tag"><Lock size={11} /> Not Available Yet</span>}</b>
              <span>{m.blurb}</span>
            </button>
          ))}
        </div>
        <p className="am-muted am-note">
          Assist And Autopilot Are Not Available Yet. Today AIVA Prepares Drafts And Recommendations For Your Approval.
        </p>
      </AmCard>

      {GROUPS.map(group => (
        <AmCard key={group} title={group}>
          <div className="am-cap-grid">
            {CAPABILITIES.filter(c => c.group === group).map(c => {
              const paused = admin.pausedCapabilities.includes(c.id);
              return (
                <div key={c.id} className={`am-cap${admin.capabilities[c.id] ? " on" : ""}`}>
                  <div className="am-cap-t">
                    <b>{c.label}</b>
                    <p className="am-muted">{c.blurb}</p>
                    {paused && <span className="am-tag warn"><AlertTriangle size={11} /> Paused</span>}
                  </div>
                  <AmToggle label={c.label} on={admin.capabilities[c.id]} onChange={v => toggle(c.id, v)} />
                </div>
              );
            })}
          </div>
        </AmCard>
      ))}

      <AmCard>
        <AmSectionLabel>How Capabilities Run</AmSectionLabel>
        <p className="am-muted">
          Enabled Capabilities Produce Drafts, Suggestions, And Flags That Appear In Activity. Nothing Is Published, Sent,
          Or Removed Without Your Approval While AIVA Is In Suggest Mode.
        </p>
      </AmCard>
    </div>
  );
}
