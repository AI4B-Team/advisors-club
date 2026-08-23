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

export function StepPayments({ onBack, onConnect, onLater }: { onBack: () => void; onConnect: () => void; onLater: () => void }) {
  return (
    <section className="ob-panel ob-panel-narrow">
      <StepHead eyebrow="Step 8" title="Ready To Get Paid?" sub="Connect payments whenever you're ready — your Club works either way, and nothing about your plan changes here." />
      <div className="ob-card ob-card-lead">
        <div className="ob-card-hd">
          <span className="ob-ico ob-ico-green"><CreditCard size={16} /></span>
          <div>
            <h2>Connect Payments</h2>
            <p>Take memberships, course sales, and coaching payments directly inside your Club.</p>
          </div>
        </div>
        <div className="ob-card-foot">
          <button className="ob-secondary" onClick={onLater}>Do This Later</button>
          <button className="ob-cta" onClick={onConnect}>Connect Payments <ArrowRight size={15} /></button>
        </div>
      </div>
      <Nav onBack={onBack} />
    </section>
  );
}

