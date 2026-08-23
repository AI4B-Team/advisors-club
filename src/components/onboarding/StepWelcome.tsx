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
import { StepHead } from "./shared";

export function StepWelcome({
  description, setDescription, websiteUrl, setWebsiteUrl, learning, onDescribe, onLearnSite, onSkip,
}: {
  description: string; setDescription: (s: string) => void;
  websiteUrl: string; setWebsiteUrl: (s: string) => void;
  learning: boolean; onDescribe: () => void; onLearnSite: () => void; onSkip: () => void;
}) {
  return (
    <section className="ob-panel">
      <StepHead
        eyebrow="AIVA Setup"
        title="Let's Build Your Club"
        sub="Tell AIVA about your business and we'll help create the foundation for your Club."
      />

      <div className="ob-card ob-card-lead">
        <div className="ob-card-hd">
          <span className="ob-ico ob-ico-amber"><Pencil size={16} /></span>
          <div>
            <h2>Describe My Business</h2>
            <p>The more context you give, the better everything AIVA builds later will be.</p>
          </div>
        </div>
        <textarea
          className="ob-textarea"
          rows={6}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="I help new real estate investors learn how to find, fund, and close their first deal..."
        />
        <div className="ob-card-foot">
          <span className="ob-hint">{description.trim().length} characters</span>
          <button className="ob-cta" onClick={onDescribe} disabled={description.trim().length < 20}>
            Continue <ArrowRight size={15} />
          </button>
        </div>
      </div>

      <div className="ob-or"><span>Or</span></div>

      <div className="ob-card">
        <div className="ob-card-hd">
          <span className="ob-ico ob-ico-blue"><Globe size={16} /></span>
          <div>
            <h2>Import From My Website</h2>
            <p>AIVA reads what you've already published and drafts your profile from it.</p>
          </div>
        </div>
        <div className="ob-inline">
          <input
            className="ob-input"
            value={websiteUrl}
            onChange={e => setWebsiteUrl(e.target.value)}
            placeholder="https://yourwebsite.com"
          />
          <button className="ob-cta ob-cta-quiet" onClick={onLearnSite} disabled={!websiteUrl.trim() || learning}>
            {learning ? <><Loader2 size={15} className="ob-spin" /> Reading…</> : <>Learn From My Website</>}
          </button>
        </div>
      </div>

      <button className="ob-skip" onClick={onSkip}>Skip For Now</button>
    </section>
  );
}

