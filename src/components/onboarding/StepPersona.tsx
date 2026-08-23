import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowRight, ArrowLeft, Sparkles, Check, Globe, Youtube, AtSign, Upload, ClipboardPaste,
  Loader2, Pencil, X, Plus, CreditCard, ShieldCheck, Bot, UserRound, Wand2, Palette,
  Users, BookOpen, UserCheck, Flame, Calendar, FolderOpen, Compass, FileText, Link2,
} from "lucide-react";
import { toast } from "sonner";

import { getSignupData, clearSignupData } from "@/lib/signup-store";
import { setGS, getGS, type GSCourse } from "@/lib/gs-store";
import { learnBusiness, suggestClubNames, generateNavigation } from "@/lib/ai.functions";
import { AiNavProposal } from "@/components/nav/AiNavProposal";
import { applyNavProposal, defaultProposal, normalizeProposal, type NavProposalItem } from "@/lib/nav/ai";
import {
  getAivaContext, setAivaContext, markBuilt, slugifyClub,
  MONETIZATION_OPTIONS, COMPONENT_CATALOG, recommendComponents,
  EMPTY_PROFILE,
  type BusinessProfile, type LearnSource, type LearnSourceKind,
  type MonetizationId, type ClubComponentId, type PersonaIdentityMode,
} from "@/lib/aiva-context";
import { StepHead, Nav } from "./shared";

// AIVA is the admin business operator and is deliberately NOT offered here.
const AI_MODES: { id: PersonaIdentityMode; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: "expert",   label: "My AI Coach",         desc: "An assistant trained on your expertise and content, presented as your coaching AI.", icon: <UserRound size={16} /> },
  { id: "separate", label: "Separate AI Identity", desc: "Its own name, image, personality, and positioning — trained on your method.", icon: <Bot size={16} /> },
];

export function StepPersona({ value, setValue, brand, onBack, onNext, onSkip }: {
  value: { identityMode: PersonaIdentityMode; name: string; personality: string; avatarUrl: string; disclosure: string; configured: boolean };
  setValue: (v: typeof value) => void;
  brand: { clubName: string };
  onBack: () => void; onNext: () => void; onSkip: () => void;
}) {
  const avatarRef = useRef<HTMLInputElement>(null);
  const defaultName = value.identityMode === "expert" ? `${brand.clubName || "Your Club"} Coach` : value.name;

  return (
    <section className="ob-panel ob-panel-narrow">
      <StepHead
        eyebrow="Step 7"
        title="How Should Members Experience Your AI?"
        sub="This Is Your AI Persona — The Member-Facing AI Trained On Your Method. You Can Refine It Any Time."
      />

      <div className="ob-rec-list">
        {AI_MODES.map(m => {
          const on = value.identityMode === m.id;
          return (
            <button key={m.id} className={`ob-rec ob-rec-btn${on ? " on" : ""}`}
              onClick={() => setValue({ ...value, identityMode: m.id, name: m.id === "separate" ? value.name : `${brand.clubName || "Your Club"} Coach` })}>
              <span className="ob-ico ob-ico-amber">{m.icon}</span>
              <div className="ob-rec-body">
                <strong>{m.label}</strong>
                <span>{m.desc}</span>
              </div>
              <span className={`ob-radio${on ? " on" : ""}`} />
            </button>
          );
        })}
      </div>

      {value.identityMode === "separate" && (
        <div className="ob-card">
          <label className="ob-label">Assistant Name</label>
          <input className="ob-input" value={value.name} placeholder="e.g. Ace" onChange={e => setValue({ ...value, name: e.target.value })} />
          <label className="ob-label">Personality & Positioning</label>
          <textarea className="ob-textarea ob-textarea-sm" rows={3} value={value.personality}
            placeholder="Direct, encouraging, always brings the conversation back to the member's next deal…"
            onChange={e => setValue({ ...value, personality: e.target.value })} />
          <div className="ob-logo-row">
            <span className="ob-logo-prev ob-logo-prev-sm">
              {value.avatarUrl ? <img src={value.avatarUrl} alt="Assistant avatar preview" /> : <Bot size={18} />}
            </span>
            <button className="ob-secondary" onClick={() => avatarRef.current?.click()}><Upload size={14} /> Upload Image</button>
            <input ref={avatarRef} type="file" accept="image/*" hidden
              onChange={e => { const f = e.target.files?.[0]; if (f) setValue({ ...value, avatarUrl: URL.createObjectURL(f) }); }} />
          </div>
        </div>
      )}

      <div className="ob-disclosure">
        <span className="ob-ico ob-ico-neutral"><ShieldCheck size={16} /></span>
        <div>
          <strong>Members Always Know It's AI</strong>
          <p>
            However you brand it, {defaultName || "your assistant"} is labelled as AI in every conversation. Advisors Club never
            presents an assistant as a human coach.
          </p>
          <input className="ob-input" value={value.disclosure} onChange={e => setValue({ ...value, disclosure: e.target.value })} />
        </div>
      </div>

      <Nav
        onBack={onBack}
        onNext={() => { setValue({ ...value, configured: true }); onNext(); }}
        extra={<button className="ob-secondary" onClick={onSkip}>Set Up Later</button>}
      />
    </section>
  );
}

