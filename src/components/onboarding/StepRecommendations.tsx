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
import { COMPONENT_ICONS, StepHead, Nav } from "./shared";

export function StepRecommendations({ selected, setSelected, recommended, onBack, onNext }: {
  selected: ClubComponentId[]; setSelected: (c: ClubComponentId[]) => void;
  recommended: ClubComponentId[]; onBack: () => void; onNext: () => void;
}) {
  const toggle = (id: ClubComponentId) =>
    setSelected(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
  const list = COMPONENT_CATALOG.filter(c => recommended.includes(c.id));

  return (
    <section className="ob-panel">
      <StepHead
        eyebrow="AIVA Recommends"
        title="Here's What AIVA Recommends"
        sub="A focused starting point based on your answers. Turn anything off — you can add more once your Club is live."
      />
      <div className="ob-rec-list">
        {list.map(c => {
          const on = selected.includes(c.id);
          return (
            <div key={c.id} className={`ob-rec${on ? " on" : ""}`}>
              <span className="ob-ico ob-ico-amber">{COMPONENT_ICONS[c.id]}</span>
              <div className="ob-rec-body">
                <strong>{c.label}</strong>
                <span>{c.desc}</span>
              </div>
              <button className={`ob-switch${on ? " on" : ""}`} onClick={() => toggle(c.id)} role="switch" aria-checked={on} aria-label={c.label}>
                <span />
              </button>
            </div>
          );
        })}
      </div>
      <Nav onBack={onBack} onNext={onNext} disabled={selected.length === 0} />
    </section>
  );
}

