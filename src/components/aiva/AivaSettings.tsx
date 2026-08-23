import { ChevronLeft, ChevronRight } from "lucide-react";
import { AM_SETTINGS, type AmSettingsKey } from "./tabs";
import { AivaOverview } from "./AivaOverview";
import { AivaKnowledge } from "./AivaKnowledge";
import { AivaInstructions } from "./AivaInstructions";
import { AivaPersonaPanel } from "./AivaPersonaPanel";
import { AivaCapabilities } from "./AivaCapabilities";
import { AivaAutonomy } from "./AivaAutonomy";
import { AivaCatalog } from "./AivaCatalog";
import { FlywheelBoard } from "./FlywheelBoard";
import { NewProductIntelligence } from "@/components/recos/NewProductIntelligence";
import { ConnectionReview } from "@/components/relationships/ConnectionReview";
import { VoicePersonality } from "@/components/persona/VoicePersonality";
import { MarketingPanel, WorkflowsPanel, AIAgentsPanel, AIInboxPanel } from "@/components/account-panels";
import type { AivaAdmin } from "@/lib/aiva-admin";

const GROUPS: ("AIVA" | "Behavior" | "Advanced")[] = ["AIVA", "Behavior", "Advanced"];

export function AivaSettings({ admin, update, open, onOpen }: {
  admin: AivaAdmin;
  update: (p: Partial<AivaAdmin>) => void;
  open: AmSettingsKey | null;
  onOpen: (key: AmSettingsKey | null) => void;
}) {
  if (!open) {
    return (
      <div className="aiva-set">
        {GROUPS.map(g => (
          <section key={g} className="aiva-set-group">
            <h3>{g}</h3>
            <div className="aiva-set-list">
              {AM_SETTINGS.filter(s => s.group === g).map(s => (
                <button key={s.key} type="button" className="aiva-set-row" onClick={() => onOpen(s.key)}>
                  <span className="aiva-set-meta">
                    <b>{s.label}</b>
                    <span>{s.desc}</span>
                  </span>
                  <ChevronRight size={16}/>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  const item = AM_SETTINGS.find(s => s.key === open)!;
  return (
    <div className="aiva-set-detail">
      <button type="button" className="aiva-set-back" onClick={() => onOpen(null)}>
        <ChevronLeft size={15}/> Settings
      </button>
      <div className="aiva-set-head">
        <h2>{item.label}</h2>
        <p>{item.desc}</p>
      </div>
      <SettingsPanel k={open} admin={admin} update={update} onOpen={onOpen} />
    </div>
  );
}

function SettingsPanel({ k, admin, update, onOpen }: {
  k: AmSettingsKey;
  admin: AivaAdmin;
  update: (p: Partial<AivaAdmin>) => void;
  onOpen: (key: AmSettingsKey | null) => void;
}) {
  switch (k) {
    case "business-knowledge":
      return <AivaOverview admin={admin} update={update} go={key => onOpen(key as AmSettingsKey)} />;
    case "knowledge-sources": return <AivaKnowledge admin={admin} update={update} />;
    case "instructions": return <AivaInstructions admin={admin} update={update} />;
    case "voice": return <VoicePersonality />;
    case "persona": return <AivaPersonaPanel />;
    case "capabilities": return <AivaCapabilities admin={admin} update={update} />;
    case "autonomy": return <AivaAutonomy admin={admin} update={update} />;
    case "catalog": return <AivaCatalog />;
    case "connections": return <ConnectionReview />;
    case "intelligence": return <NewProductIntelligence />;
    case "flywheel": return <FlywheelBoard />;
    case "marketing": return <MarketingPanel />;
    case "workflows": return <WorkflowsPanel />;
    case "agents": return <AIAgentsPanel />;
    case "inbox": return <AIInboxPanel />;
    default: return null;
  }
}
