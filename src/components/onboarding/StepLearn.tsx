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
import { SOURCE_KINDS, uid, StepHead, Nav } from "./shared";

export function StepLearn({
  sources, setSources, websiteUrl, setWebsiteUrl, description, setDescription, learning, onBack, onNext,
}: {
  sources: LearnSource[]; setSources: (s: LearnSource[]) => void;
  websiteUrl: string; setWebsiteUrl: (s: string) => void;
  description: string; setDescription: (s: string) => void;
  learning: boolean; onBack: () => void; onNext: () => void;
}) {
  const [active, setActive] = useState<LearnSourceKind | null>(null);
  const [draft, setDraft] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function add(kind: LearnSourceKind, label: string, content?: string) {
    if (!label.trim()) return;
    setSources([...sources, { id: uid(), kind, label: label.trim(), content, addedAt: new Date().toISOString() }]);
    setDraft("");
    setActive(null);
  }

  function onFiles(files: FileList | null) {
    if (!files) return;
    const added: LearnSource[] = Array.from(files).slice(0, 8).map(f => ({
      id: uid(), kind: "file" as const, label: f.name, addedAt: new Date().toISOString(),
    }));
    setSources([...sources, ...added]);
    setActive(null);
  }

  return (
    <section className="ob-panel">
      <StepHead
        eyebrow="Optional"
        title="Help AIVA Learn About You"
        sub="Add anything that shows how you teach and who you serve. All of this is optional — you can add more later."
      />

      <div className="ob-source-grid">
        {SOURCE_KINDS.map(k => (
          <button key={k.id} className={`ob-source${active === k.id ? " on" : ""}`} onClick={() => { setActive(active === k.id ? null : k.id); setDraft(k.id === "website" ? websiteUrl : ""); }}>
            <span className="ob-ico ob-ico-neutral">{k.icon}</span>
            <span className="ob-source-l">{k.label}</span>
            <span className="ob-source-h">{k.hint}</span>
          </button>
        ))}
      </div>

      {active && active !== "file" && (
        <div className="ob-card ob-card-tight">
          {active === "paste" ? (
            <textarea className="ob-textarea" rows={5} value={draft} onChange={e => setDraft(e.target.value)}
              placeholder="Paste course notes, a transcript, a sales page, or an email you've written…" />
          ) : (
            <input className="ob-input" value={draft} onChange={e => setDraft(e.target.value)}
              placeholder={SOURCE_KINDS.find(s => s.id === active)?.hint} />
          )}
          <div className="ob-card-foot">
            <span className="ob-hint">Nothing is published — AIVA uses this for context only.</span>
            <button className="ob-cta ob-cta-quiet" onClick={() => {
              if (active === "website") setWebsiteUrl(draft.trim());
              add(active, active === "paste" ? `Pasted content (${draft.trim().length} chars)` : draft, active === "paste" ? draft : undefined);
            }} disabled={!draft.trim()}>
              <Plus size={15} /> Add Source
            </button>
          </div>
        </div>
      )}

      {active === "file" && (
        <div className="ob-card ob-card-tight">
          <div className="ob-drop" onClick={() => fileRef.current?.click()}>
            <span className="ob-ico ob-ico-amber"><Upload size={18} /></span>
            <strong>Upload Files</strong>
            <span className="ob-hint">PDF, DOCX, TXT — course materials, transcripts, resources</span>
            <input ref={fileRef} type="file" multiple hidden accept=".pdf,.doc,.docx,.txt,.md,.rtf"
              onChange={e => onFiles(e.target.files)} />
          </div>
          <p className="ob-note">Files are listed as context for AIVA in this prototype — document parsing isn't connected yet.</p>
        </div>
      )}

      {sources.length > 0 && (
        <div className="ob-chips">
          {sources.map(s => (
            <span key={s.id} className="ob-chip">
              {s.kind === "file" ? <FileText size={13} /> : s.kind === "paste" ? <ClipboardPaste size={13} /> : <Link2 size={13} />}
              {s.label.length > 42 ? `${s.label.slice(0, 42)}…` : s.label}
              <button onClick={() => setSources(sources.filter(x => x.id !== s.id))} aria-label="Remove"><X size={12} /></button>
            </span>
          ))}
        </div>
      )}

      <div className="ob-card ob-card-tight">
        <label className="ob-label">In Your Own Words</label>
        <textarea className="ob-textarea" rows={4} value={description} onChange={e => setDescription(e.target.value)}
          placeholder="I help new real estate investors learn how to find, fund, and close their first deal..." />
      </div>

      <Nav onBack={onBack} onNext={onNext} nextLabel="Let AIVA Learn" busy={learning}
        disabled={!description.trim() && !websiteUrl.trim() && sources.length === 0} />
    </section>
  );
}

