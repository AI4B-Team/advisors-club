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
import { StepHead, Nav, ListEditor } from "./shared";

const REVIEW_FIELDS: { key: keyof BusinessProfile; label: string; placeholder: string; list?: boolean }[] = [
  { key: "business",       label: "Business",                placeholder: "What your business does." },
  { key: "expertise",      label: "Expertise",               placeholder: "What you're genuinely known for." },
  { key: "audience",       label: "Audience",                placeholder: "Who you serve." },
  { key: "transformation", label: "Transformation / Outcome", placeholder: "The change you create for them." },
  { key: "topics",         label: "Topics",                  placeholder: "Add a topic", list: true },
  { key: "offers",         label: "Current Offers",          placeholder: "Add an offer", list: true },
  { key: "businessModel",  label: "Business Model",          placeholder: "How you make money today." },
  { key: "brandVoice",     label: "Brand Voice",             placeholder: "How you sound to your audience." },
];

export function StepReview({ profile, setProfile, onBack, onNext }: {
  profile: BusinessProfile; setProfile: (p: BusinessProfile | ((p: BusinessProfile) => BusinessProfile)) => void;
  onBack: () => void; onNext: () => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [allEdit, setAllEdit] = useState(profile.origin !== "ai");

  return (
    <section className="ob-panel">
      <StepHead
        eyebrow={profile.origin === "ai" ? "Draft From AIVA" : "Your Details"}
        title="Here's What AIVA Learned"
        sub="AIVA drafted this from what you shared. Check every card — edit anything that isn't right before we build on it."
      />

      <div className="ob-review-grid">
        {REVIEW_FIELDS.map(f => {
          const open = allEdit || editing === f.key;
          const value = profile[f.key];
          return (
            <article key={f.key} className="ob-rcard">
              <header>
                <h3>{f.label}</h3>
                <button onClick={() => setEditing(editing === f.key ? null : (f.key as string))} aria-label={`Edit ${f.label}`}>
                  <Pencil size={13} />
                </button>
              </header>

              {f.list ? (
                <ListEditor
                  items={(value as string[]) || []}
                  placeholder={f.placeholder}
                  editable={open}
                  onChange={items => setProfile(p => ({ ...p, [f.key]: items }))}
                />
              ) : open ? (
                <textarea
                  className="ob-textarea ob-textarea-sm"
                  rows={3}
                  value={value as string}
                  placeholder={f.placeholder}
                  onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                />
              ) : (
                <p className={(value as string) ? "" : "ob-empty"}>{(value as string) || "Not captured yet — add it here."}</p>
              )}
            </article>
          );
        })}
      </div>

      <p className="ob-note ob-note-center">
        <ShieldCheck size={13} /> AIVA can get things wrong. Nothing here is treated as verified until you confirm it.
      </p>

      <Nav
        onBack={onBack}
        onNext={onNext}
        nextLabel="Looks Good"
        extra={<button className="ob-secondary" onClick={() => setAllEdit(v => !v)}>{allEdit ? "Done Editing" : "Edit Details"}</button>}
      />
    </section>
  );
}

