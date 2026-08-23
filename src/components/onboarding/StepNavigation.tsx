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

export function StepNavigation({ items, setItems, rationale, busy, onGenerate, onBack, onNext }: {
  items: NavProposalItem[]; setItems: (rows: NavProposalItem[]) => void;
  rationale: string; busy: boolean; onGenerate: () => void;
  onBack: () => void; onNext: () => void;
}) {
  const started = useRef(false);
  useEffect(() => {
    if (started.current || items.length) return;
    started.current = true;
    onGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="ob-panel ob-panel-narrow">
      <StepHead
        eyebrow="AI Builds It"
        title="How Your Club Is Organized"
        sub="AI Named Your Menu For Your Business. Everything Here Stays Fully Editable In Settings → Club Navigation."
      />

      {busy && items.length === 0 ? (
        <div className="ob-card ob-navgen-wait">
          <Loader2 size={18} className="ob-spin" /> Designing Your Navigation…
        </div>
      ) : (
        <AiNavProposal
          items={items}
          setItems={setItems}
          rationale={rationale}
          busy={busy}
          onRegenerate={onGenerate}
        />
      )}

      <Nav onBack={onBack} onNext={onNext} disabled={items.length === 0 || busy} nextLabel="Use This Structure" />
    </section>
  );
}

