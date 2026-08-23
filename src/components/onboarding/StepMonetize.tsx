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

export function StepMonetize({ selected, setSelected, onBack, onNext }: {
  selected: MonetizationId[]; setSelected: (m: MonetizationId[]) => void;
  onBack: () => void; onNext: () => void;
}) {
  const toggle = (id: MonetizationId) =>
    setSelected(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);

  return (
    <section className="ob-panel">
      <StepHead
        eyebrow="Step 4"
        title="How Do You Want To Monetize Your Expertise?"
        sub="Pick everything that sounds right. You won't set prices here — that comes later, when you're ready."
      />
      <div className="ob-opt-grid">
        {MONETIZATION_OPTIONS.map(o => {
          const on = selected.includes(o.id);
          return (
            <button key={o.id} className={`ob-opt${on ? " on" : ""}`} onClick={() => toggle(o.id)}>
              <span className="ob-check">{on && <Check size={12} strokeWidth={3} />}</span>
              <span className="ob-opt-l">{o.label}</span>
              <span className="ob-opt-d">{o.desc}</span>
            </button>
          );
        })}
      </div>
      <Nav onBack={onBack} onNext={onNext} disabled={selected.length === 0} />
    </section>
  );
}

