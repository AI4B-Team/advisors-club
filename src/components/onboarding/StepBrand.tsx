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
import { BRAND_COLORS, StepHead, Nav } from "./shared";

export function StepBrand({ brand, setBrand, profile, onBack, onNext }: {
  brand: { clubName: string; logoUrl: string; color: string; slug: string };
  setBrand: (b: { clubName: string; logoUrl: string; color: string; slug: string }) => void;
  profile: BusinessProfile; onBack: () => void; onNext: () => void;
}) {
  const namesFn = useServerFn(suggestClubNames);
  const [names, setNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);

  async function suggest() {
    setLoading(true);
    try {
      const res = await namesFn({ data: { business: profile.business, audience: profile.audience, topics: profile.topics } });
      if (res.error || res.names.length === 0) toast.error(res.error || "No suggestions right now.");
      setNames(res.names);
    } finally { setLoading(false); }
  }

  function pickLogo(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    setBrand({ ...brand, logoUrl: URL.createObjectURL(f) });
  }

  return (
    <section className="ob-panel ob-panel-narrow">
      <StepHead eyebrow="Step 6" title="Make It Yours" sub="Your Club's name, look, and address. All of it stays editable in Settings." />

      <div className="ob-card">
        <label className="ob-label">Club Name</label>
        <input className="ob-input" value={brand.clubName} placeholder="e.g. Deal Makers Club"
          onChange={e => setBrand({ ...brand, clubName: e.target.value, slug: slugifyClub(e.target.value) })} />
        <div className="ob-card-foot">
          <span className="ob-hint">Stuck? Let AIVA suggest a few.</span>
          <button className="ob-secondary" onClick={suggest} disabled={loading}>
            {loading ? <Loader2 size={14} className="ob-spin" /> : <Wand2 size={14} />} Suggest Names
          </button>
        </div>
        {names.length > 0 && (
          <div className="ob-chips ob-chips-sm">
            {names.map(n => (
              <button key={n} className="ob-chip ob-chip-btn" onClick={() => setBrand({ ...brand, clubName: n, slug: slugifyClub(n) })}>{n}</button>
            ))}
          </div>
        )}
      </div>

      <div className="ob-card">
        <label className="ob-label">Logo</label>
        <div className="ob-logo-row">
          <span className="ob-logo-prev" style={{ background: brand.color }}>
            {brand.logoUrl ? <img src={brand.logoUrl} alt="Club logo preview" /> : (brand.clubName.trim().charAt(0).toUpperCase() || "C")}
          </span>
          <div>
            <button className="ob-secondary" onClick={() => logoRef.current?.click()}><Upload size={14} /> Upload Logo</button>
            <p className="ob-hint">PNG or SVG, square works best. You can add this later.</p>
          </div>
          <input ref={logoRef} type="file" accept="image/*" hidden onChange={e => pickLogo(e.target.files)} />
        </div>
      </div>

      <div className="ob-card">
        <label className="ob-label"><Palette size={13} /> Brand Color</label>
        <div className="ob-swatches">
          {BRAND_COLORS.map(c => (
            <button key={c} className={`ob-swatch${brand.color === c ? " on" : ""}`} style={{ background: c }}
              onClick={() => setBrand({ ...brand, color: c })} aria-label={`Brand color ${c}`} />
          ))}
        </div>
      </div>

      <div className="ob-card">
        <label className="ob-label">Club URL</label>
        <div className="ob-url">
          <span>advisorsclub.com/</span>
          <input className="ob-input ob-input-bare" value={brand.slug} placeholder="your-club"
            onChange={e => setBrand({ ...brand, slug: slugifyClub(e.target.value) })} />
        </div>
      </div>

      <Nav onBack={onBack} onNext={onNext} disabled={brand.clubName.trim().length < 3} />
    </section>
  );
}

