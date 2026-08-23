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

export const BRAND_COLORS = ["#F5A623", "#EF4444", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#0EA5E9", "#14B8A6"];

export const COMPONENT_ICONS: Record<ClubComponentId, React.ReactNode> = {
  "community": <Users size={16} />,
  "starter-course": <BookOpen size={16} />,
  "coaching-program": <UserCheck size={16} />,
  "challenge": <Flame size={16} />,
  "events": <Calendar size={16} />,
  "resources": <FolderOpen size={16} />,
  "member-onboarding": <Compass size={16} />,
  "persona": <Sparkles size={16} />,
};

export const SOURCE_KINDS: { id: LearnSourceKind; label: string; icon: React.ReactNode; hint: string }[] = [
  { id: "website", label: "Website",        icon: <Globe size={16} />,          hint: "https://yourwebsite.com" },
  { id: "youtube", label: "YouTube",        icon: <Youtube size={16} />,        hint: "Channel or video URL" },
  { id: "social",  label: "Social Profile", icon: <AtSign size={16} />,         hint: "Instagram, LinkedIn, X…" },
  { id: "file",    label: "Upload Files",   icon: <Upload size={16} />,         hint: "PDF, DOCX, TXT, transcripts" },
  { id: "paste",   label: "Paste Content",  icon: <ClipboardPaste size={16} />, hint: "Course notes, emails, outlines" },
];

export function uid() { return Math.random().toString(36).slice(2, 10); }

export function StepHead({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) {
  return (
    <div className="ob-head">
      {eyebrow && <div className="ob-eyebrow"><Sparkles size={12} /> {eyebrow}</div>}
      <h1 className="ob-title">{title}</h1>
      {sub && <p className="ob-sub">{sub}</p>}
    </div>
  );
}

export function Nav({ onBack, onNext, nextLabel = "Continue", disabled, busy, extra }: {
  onBack?: () => void; onNext?: () => void; nextLabel?: string;
  disabled?: boolean; busy?: boolean; extra?: React.ReactNode;
}) {
  return (
    <div className="ob-nav">
      {onBack ? <button className="ob-back" onClick={onBack}><ArrowLeft size={15} /> Back</button> : <span />}
      <div className="ob-nav-right">
        {extra}
        {onNext && (
          <button className="ob-cta" onClick={onNext} disabled={disabled || busy}>
            {busy ? <><Loader2 size={15} className="ob-spin" /> Working…</> : <>{nextLabel} <ArrowRight size={15} /></>}
          </button>
        )}
      </div>
    </div>
  );
}


export function ListEditor({ items, placeholder, editable, onChange }: {
  items: string[]; placeholder: string; editable: boolean; onChange: (i: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  return (
    <div className="ob-list-edit">
      <div className="ob-chips ob-chips-sm">
        {items.length === 0 && !editable && <span className="ob-empty">Nothing captured yet.</span>}
        {items.map((it, i) => (
          <span key={`${it}-${i}`} className="ob-chip ob-chip-soft">
            {it}
            {editable && <button onClick={() => onChange(items.filter((_, x) => x !== i))} aria-label="Remove"><X size={11} /></button>}
          </span>
        ))}
      </div>
      {editable && (
        <div className="ob-inline ob-inline-sm">
          <input className="ob-input" value={draft} placeholder={placeholder}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && draft.trim()) { onChange([...items, draft.trim()]); setDraft(""); } }} />
          <button className="ob-secondary" onClick={() => { if (draft.trim()) { onChange([...items, draft.trim()]); setDraft(""); } }}>Add</button>
        </div>
      )}
    </div>
  );
}

