import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { UserCircle2, Eye, Sparkles, ArrowRight } from "lucide-react";
import { AmCard } from "./ui";
import { usePersona } from "@/hooks/use-persona";
import { personaName } from "@/lib/persona/store";
import { PersonaAssistantPanel } from "@/components/persona/PersonaAssistant";
import { MemberOnboardingConfig } from "./MemberOnboardingConfig";

/**
 * AIVA settings → AI Persona.
 *
 * AIVA is the admin operator; the member-facing AI is the Persona and is fully
 * configured on /app/manage/persona. This panel is the pointer plus the
 * member-onboarding config that lives alongside it.
 */
export function AivaPersonaPanel() {
  const persona = usePersona();
  const [preview, setPreview] = useState(false);

  return (
    <div className="am-stack">
      <AmCard
        title="AI Persona"
        desc="The Member-Facing AI Trained On Your Method. AIVA Stays Admin-Only."
        icon={<UserCircle2 size={16} />}
        actions={<button className="am-btn" onClick={() => setPreview(true)}><Eye size={13} /> Preview As Member</button>}
      >
        <p className="am-muted">
          Members Currently See: <b>{personaName(persona)}</b>
          {persona.enabled ? "" : " (Currently Turned Off)"}.
        </p>
        <Link to="/app/manage/persona" className="am-btn primary">
          Open AI Persona <ArrowRight size={13} />
        </Link>
      </AmCard>

      <MemberOnboardingConfig />

      <AmCard title="Preview" desc="Exactly What A Member Sees." icon={<Sparkles size={16} />}>
        <button className="am-btn primary" onClick={() => setPreview(true)}><Eye size={13} /> Open Member Preview</button>
      </AmCard>

      <PersonaAssistantPanel open={preview} onClose={() => setPreview(false)} me={{ id: "c_sarah", name: "Sarah Klein" }} />
    </div>
  );
}
