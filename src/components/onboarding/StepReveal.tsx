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
import { COMPONENT_ICONS, StepHead } from "./shared";

export function StepReveal({ brand, components, onEnter, onPreview }: {
  brand: { clubName: string; color: string; slug: string; logoUrl: string };
  components: ClubComponentId[]; onEnter: () => void; onPreview: () => void;
}) {
  const built = getAivaContext().built;
  const created = COMPONENT_CATALOG.filter(c => components.includes(c.id));

  return (
    <section className="ob-panel ob-panel-narrow">
      <div className="ob-reveal-hero" style={{ background: brand.color }}>
        <span className="ob-reveal-mark">
          {brand.logoUrl ? <img src={brand.logoUrl} alt={`${brand.clubName} logo`} /> : (brand.clubName.trim().charAt(0).toUpperCase() || "C")}
        </span>
        <strong>{brand.clubName || "Your Club"}</strong>
        <span className="ob-reveal-url">advisorsclub.com/{brand.slug || "your-club"}</span>
      </div>

      <StepHead title="Your Club Is Ready" sub="Here's what AIVA set up. Everything below is a draft you can edit, publish, or remove." />

      <div className="ob-summary">
        {created.map(c => {
          const persisted = built.includes(c.id);
          return (
            <div key={c.id} className="ob-sum">
              <span className="ob-ico ob-ico-amber">{COMPONENT_ICONS[c.id]}</span>
              <div>
                <strong>{c.label}</strong>
                <span>{persisted ? c.desc : "Reserved in your setup — you'll finish this inside your Club."}</span>
              </div>
              {persisted ? <Check size={15} className="ob-sum-check" /> : <span className="ob-sum-soon">Next</span>}
            </div>
          );
        })}
      </div>

      <div className="ob-nav">
        <button className="ob-secondary" onClick={onPreview}>Preview As Member</button>
        <button className="ob-cta" onClick={onEnter}>Enter My Club <ArrowRight size={15} /></button>
      </div>
    </section>
  );
}
