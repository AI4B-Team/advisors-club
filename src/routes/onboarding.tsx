import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
  type MonetizationId, type ClubComponentId, type MemberAiMode,
} from "@/lib/aiva-context";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Build Your Club With AIVA — AdvisorsClub" },
      { name: "description", content: "Tell AIVA about your business and it helps build the first version of your Club." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: OnboardingPage,
});

const STEP_LABELS = [
  "Welcome", "Learn", "Review", "Monetize", "Recommendations",
  "Navigation", "Brand", "Member AI", "Payments", "Build", "Ready",
];

const BRAND_COLORS = ["#F5A623", "#EF4444", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#0EA5E9", "#14B8A6"];

const COMPONENT_ICONS: Record<ClubComponentId, React.ReactNode> = {
  "community": <Users size={16} />,
  "starter-course": <BookOpen size={16} />,
  "coaching-program": <UserCheck size={16} />,
  "challenge": <Flame size={16} />,
  "events": <Calendar size={16} />,
  "resources": <FolderOpen size={16} />,
  "member-onboarding": <Compass size={16} />,
  "member-ai": <Sparkles size={16} />,
};

const SOURCE_KINDS: { id: LearnSourceKind; label: string; icon: React.ReactNode; hint: string }[] = [
  { id: "website", label: "Website",        icon: <Globe size={16} />,          hint: "https://yourwebsite.com" },
  { id: "youtube", label: "YouTube",        icon: <Youtube size={16} />,        hint: "Channel or video URL" },
  { id: "social",  label: "Social Profile", icon: <AtSign size={16} />,         hint: "Instagram, LinkedIn, X…" },
  { id: "file",    label: "Upload Files",   icon: <Upload size={16} />,         hint: "PDF, DOCX, TXT, transcripts" },
  { id: "paste",   label: "Paste Content",  icon: <ClipboardPaste size={16} />, hint: "Course notes, emails, outlines" },
];

function uid() { return Math.random().toString(36).slice(2, 10); }

/* ========================= Page ========================= */
function OnboardingPage() {
  const nav = useNavigate();
  const signup = useMemo(() => getSignupData(), []);
  const [step, setStep] = useState(0);

  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [sources, setSources] = useState<LearnSource[]>([]);
  const [profile, setProfile] = useState<BusinessProfile>(EMPTY_PROFILE);
  const [monetization, setMonetization] = useState<MonetizationId[]>([]);
  const [components, setComponents] = useState<ClubComponentId[]>([]);
  const [brand, setBrand] = useState({
    clubName: signup.clubName || "",
    logoUrl: "",
    color: signup.avatarColor || "#F5A623",
    slug: slugifyClub(signup.clubName || ""),
  });
  const [memberAi, setMemberAi] = useState(() => getAivaContext().memberAi);
  const [payments, setPayments] = useState({ connected: false, deferred: false });
  const [learning, setLearning] = useState(false);
  const [navItems, setNavItems] = useState<NavProposalItem[]>([]);
  const [navRationale, setNavRationale] = useState("");
  const [navBusy, setNavBusy] = useState(false);

  const learnFn = useServerFn(learnBusiness);
  const navFn = useServerFn(generateNavigation);

  // Restore anything already captured (e.g. a refresh mid-flow).
  const restored = useRef(false);
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    const c = getAivaContext();
    if (c.description) setDescription(c.description);
    if (c.websiteUrl) setWebsiteUrl(c.websiteUrl);
    if (c.sources.length) setSources(c.sources);
    if (c.profile.origin !== "empty") setProfile(c.profile);
    if (c.monetization.length) setMonetization(c.monetization);
    if (c.brand.clubName) setBrand(c.brand);
  }, []);

  // Persist as we go — this context outlives onboarding.
  useEffect(() => {
    setAivaContext({ description, websiteUrl, sources, profile, monetization, components, brand, memberAi, payments });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [description, websiteUrl, sources, profile, monetization, components, brand, memberAi, payments]);

  const go = (n: number) => { setStep(n); if (typeof window !== "undefined") window.scrollTo({ top: 0 }); };

  async function runLearn(next: number) {
    setLearning(true);
    try {
      const res = await learnFn({
        data: {
          description,
          websiteUrl,
          sources: sources.map(s => ({ kind: s.kind, label: s.label, content: s.content || "" })),
        },
      });
      if (res.error || !res.profile) {
        toast.error(res.error || "AIVA couldn't read that yet — you can fill it in yourself.");
        setProfile(p => ({ ...p, origin: p.origin === "empty" ? "manual" : p.origin }));
      } else {
        setProfile({ ...res.profile, confirmed: false, origin: "ai" });
        toast.success("AIVA drafted your profile — review it below.");
      }
      go(next);
    } finally {
      setLearning(false);
    }
  }

  async function runNavGen() {
    setNavBusy(true);
    try {
      const res = await navFn({
        data: {
          description,
          business: profile.business,
          audience: profile.audience,
          transformation: profile.transformation,
          topics: profile.topics,
          clubName: brand.clubName,
        },
      });
      if (res.error || res.items.length === 0) {
        toast.error(res.error || "AI Couldn't Draft A Structure — Using The Standard Menu.");
        setNavItems(defaultProposal().items);
        setNavRationale("");
      } else {
        const p = normalizeProposal(res);
        setNavItems(p.items);
        setNavRationale(res.rationale || "");
      }
    } finally {
      setNavBusy(false);
    }
  }

  return (
    <div className="ob">
      <header className="ob-top">
        <div className="ob-top-brand"><span className="ob-mark">AC</span> AdvisorsClub</div>
        <div className="ob-steps" aria-label="Onboarding progress">
          {STEP_LABELS.map((l, i) => (
            <span key={l} className={`ob-step-dot${i === step ? " on" : ""}${i < step ? " done" : ""}`} title={l} />
          ))}
        </div>
        <button className="ob-exit" onClick={() => nav({ to: "/app" })}>Skip For Now</button>
      </header>

      <main className="ob-main">
        {step === 0 && (
          <StepWelcome
            description={description} setDescription={setDescription}
            websiteUrl={websiteUrl} setWebsiteUrl={setWebsiteUrl}
            learning={learning}
            onDescribe={() => go(1)}
            onLearnSite={() => runLearn(2)}
            onSkip={() => go(1)}
          />
        )}
        {step === 1 && (
          <StepLearn
            sources={sources} setSources={setSources}
            websiteUrl={websiteUrl} setWebsiteUrl={setWebsiteUrl}
            description={description} setDescription={setDescription}
            learning={learning}
            onBack={() => go(0)}
            onNext={() => runLearn(2)}
          />
        )}
        {step === 2 && (
          <StepReview
            profile={profile} setProfile={setProfile}
            onBack={() => go(1)}
            onNext={() => { setProfile(p => ({ ...p, confirmed: true })); go(3); }}
          />
        )}
        {step === 3 && (
          <StepMonetize
            selected={monetization} setSelected={setMonetization}
            onBack={() => go(2)}
            onNext={() => { setComponents(c => (c.length ? c : recommendComponents(monetization))); go(4); }}
          />
        )}
        {step === 4 && (
          <StepRecommendations
            selected={components} setSelected={setComponents}
            recommended={recommendComponents(monetization)}
            onBack={() => go(3)} onNext={() => go(6)}
          />
        )}
        {step === 5 && (
          <StepNavigation
            items={navItems} setItems={setNavItems} rationale={navRationale}
            busy={navBusy} onGenerate={runNavGen}
            onBack={() => go(4)} onNext={() => go(6)}
          />
        )}
        {step === 6 && (
          <StepBrand
            brand={brand} setBrand={setBrand} profile={profile}
            onBack={() => go(4)} onNext={() => go(7)}
          />
        )}
        {step === 7 && (
          <StepMemberAi
            value={memberAi} setValue={setMemberAi} brand={brand}
            onBack={() => go(6)} onNext={() => go(8)} onSkip={() => go(8)}
          />
        )}
        {step === 8 && (
          <StepPayments
            onBack={() => go(7)}
            onConnect={() => { setPayments({ connected: false, deferred: false }); toast("Payment setup opens after your Club is created."); go(9); }}
            onLater={() => { setPayments({ connected: false, deferred: true }); go(9); }}
          />
        )}
        {step === 9 && (
          <StepBuild
            components={components} profile={profile} brand={brand} navItems={navItems}
            onDone={() => go(10)}
          />
        )}
        {step === 10 && (
          <StepReveal
            brand={brand} components={components}
            onEnter={() => { clearSignupData(); nav({ to: "/app" }); }}
            onPreview={() => { clearSignupData(); nav({ to: "/app/club/feed" }); }}
          />
        )}
      </main>
    </div>
  );
}

/* ========================= Shared bits ========================= */
function StepHead({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) {
  return (
    <div className="ob-head">
      {eyebrow && <div className="ob-eyebrow"><Sparkles size={12} /> {eyebrow}</div>}
      <h1 className="ob-title">{title}</h1>
      {sub && <p className="ob-sub">{sub}</p>}
    </div>
  );
}

function Nav({ onBack, onNext, nextLabel = "Continue", disabled, busy, extra }: {
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

/* ========================= 1 — Welcome ========================= */
function StepWelcome({
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

/* ========================= 2 — Help AIVA Learn ========================= */
function StepLearn({
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

/* ========================= 3 — What AIVA Learned ========================= */
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

function StepReview({ profile, setProfile, onBack, onNext }: {
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

function ListEditor({ items, placeholder, editable, onChange }: {
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

/* ========================= 4 — Monetization ========================= */
function StepMonetize({ selected, setSelected, onBack, onNext }: {
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

/* ========================= 5 — Recommendations ========================= */
function StepRecommendations({ selected, setSelected, recommended, onBack, onNext }: {
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

/* ========================= 6 — Brand ========================= */
function StepBrand({ brand, setBrand, profile, onBack, onNext }: {
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

/* ========================= 7 — Member AI ========================= */
const AI_MODES: { id: MemberAiMode; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: "aiva",     label: "AIVA",                desc: "Use the Advisors Club AI identity your members already recognize.", icon: <Sparkles size={16} /> },
  { id: "my-coach", label: "My AI Coach",         desc: "An assistant trained on your expertise and content, presented as your coaching AI.", icon: <UserRound size={16} /> },
  { id: "custom",   label: "Custom AI Assistant", desc: "Choose your own name, image, personality, and positioning.", icon: <Bot size={16} /> },
];

function StepMemberAi({ value, setValue, brand, onBack, onNext, onSkip }: {
  value: { mode: MemberAiMode; name: string; personality: string; avatarUrl: string; disclosure: string; configured: boolean };
  setValue: (v: typeof value) => void;
  brand: { clubName: string };
  onBack: () => void; onNext: () => void; onSkip: () => void;
}) {
  const avatarRef = useRef<HTMLInputElement>(null);
  const defaultName = value.mode === "aiva" ? "AIVA" : value.mode === "my-coach" ? `${brand.clubName || "Your Club"} Coach` : value.name;

  return (
    <section className="ob-panel ob-panel-narrow">
      <StepHead
        eyebrow="Step 7"
        title="How Should Members Experience AI?"
        sub="AIVA powers the intelligence either way. This only changes how the member-facing assistant is presented."
      />

      <div className="ob-rec-list">
        {AI_MODES.map(m => {
          const on = value.mode === m.id;
          return (
            <button key={m.id} className={`ob-rec ob-rec-btn${on ? " on" : ""}`}
              onClick={() => setValue({ ...value, mode: m.id, name: m.id === "custom" ? value.name : (m.id === "aiva" ? "AIVA" : `${brand.clubName || "Your Club"} Coach`) })}>
              <span className="ob-ico ob-ico-amber">{m.icon}</span>
              <div className="ob-rec-body">
                <strong>{m.label}</strong>
                <span>{m.desc}</span>
              </div>
              <span className={`ob-radio${on ? " on" : ""}`} />
            </button>
          );
        })}
      </div>

      {value.mode === "custom" && (
        <div className="ob-card">
          <label className="ob-label">Assistant Name</label>
          <input className="ob-input" value={value.name} placeholder="e.g. Ace" onChange={e => setValue({ ...value, name: e.target.value })} />
          <label className="ob-label">Personality & Positioning</label>
          <textarea className="ob-textarea ob-textarea-sm" rows={3} value={value.personality}
            placeholder="Direct, encouraging, always brings the conversation back to the member's next deal…"
            onChange={e => setValue({ ...value, personality: e.target.value })} />
          <div className="ob-logo-row">
            <span className="ob-logo-prev ob-logo-prev-sm">
              {value.avatarUrl ? <img src={value.avatarUrl} alt="Assistant avatar preview" /> : <Bot size={18} />}
            </span>
            <button className="ob-secondary" onClick={() => avatarRef.current?.click()}><Upload size={14} /> Upload Image</button>
            <input ref={avatarRef} type="file" accept="image/*" hidden
              onChange={e => { const f = e.target.files?.[0]; if (f) setValue({ ...value, avatarUrl: URL.createObjectURL(f) }); }} />
          </div>
        </div>
      )}

      <div className="ob-disclosure">
        <span className="ob-ico ob-ico-neutral"><ShieldCheck size={16} /></span>
        <div>
          <strong>Members Always Know It's AI</strong>
          <p>
            However you brand it, {defaultName || "your assistant"} is labelled as AI in every conversation. Advisors Club never
            presents an assistant as a human coach.
          </p>
          <input className="ob-input" value={value.disclosure} onChange={e => setValue({ ...value, disclosure: e.target.value })} />
        </div>
      </div>

      <Nav
        onBack={onBack}
        onNext={() => { setValue({ ...value, configured: true }); onNext(); }}
        extra={<button className="ob-secondary" onClick={onSkip}>Set Up Later</button>}
      />
    </section>
  );
}

/* ========================= 8 — Payments ========================= */
function StepPayments({ onBack, onConnect, onLater }: { onBack: () => void; onConnect: () => void; onLater: () => void }) {
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

/* ========================= 9 — Build ========================= */
type BuildTask = { id: string; label: string; run: () => void };

function buildTasks(components: ClubComponentId[], profile: BusinessProfile, brand: { clubName: string; color: string; slug: string; logoUrl: string }, navItems: NavProposalItem[]): BuildTask[] {
  const tasks: BuildTask[] = [];

  tasks.push({
    id: "navigation",
    label: "Building Your Navigation",
    run: () => { applyNavProposal({ items: navItems.length ? navItems : defaultProposal().items }); },
  });

  tasks.push({
    id: "structure",
    label: "Creating Club Structure",
    run: () => {
      setGS({
        clubName: brand.clubName || "Your Club",
        coverColor: brand.color,
        logoUrl: brand.logoUrl,
        clubTagline: profile.transformation,
        clubDesc: profile.business,
        niche: profile.topics[0] || "Business",
        audience: profile.audience,
        goal: profile.transformation,
        tone: profile.brandVoice,
      });
      markBuilt("structure");
    },
  });

  if (components.includes("community")) {
    tasks.push({
      id: "community",
      label: "Organizing Community",
      run: () => {
        setGS({
          welcomePost: {
            title: `Welcome To ${brand.clubName || "The Club"}`,
            body: `${profile.business || "This is our community."}\n\nStart here: introduce yourself, tell us where you are today, and what you want to achieve.${profile.transformation ? `\n\nWhat we're working toward: ${profile.transformation}` : ""}`,
            published: false,
          },
        });
        markBuilt("community");
      },
    });
  }

  if (components.includes("starter-course")) {
    tasks.push({
      id: "starter-course",
      label: "Preparing Your First Program",
      run: () => {
        const topics = profile.topics.length ? profile.topics : ["Getting Started", "Core Method", "Next Steps"];
        const course: GSCourse = {
          id: "starter",
          title: `${brand.clubName || "Your"} Starter Course`,
          tagline: profile.transformation || "Your first program outline, drafted by AIVA.",
          modules: topics.slice(0, 6).map(t => ({ title: t, lessons: 3 })),
          price: 0,
          published: false,
        };
        setGS({ course });
        markBuilt("starter-course");
      },
    });
  }

  if (components.includes("coaching-program")) {
    tasks.push({
      id: "coaching-program",
      label: "Setting Up Your Coaching Program",
      run: () => {
        const cur = getGS();
        setGS({
          coaching: [
            ...cur.coaching,
            {
              id: "starter-coaching",
              type: "both",
              name: `${brand.clubName || "Club"} Coaching`,
              desc: profile.transformation || "Guided coaching for your members.",
              sessionsPerMonth: 4,
              price: 0,
            },
          ],
        });
        markBuilt("coaching-program");
      },
    });
  }

  if (components.includes("challenge")) {
    tasks.push({
      id: "challenge",
      label: "Drafting Your First Challenge",
      run: () => {
        setGS({
          challenge: {
            id: "starter-challenge",
            name: "7-Day Kickoff Challenge",
            days: 7,
            tagline: profile.transformation || "Get members moving in their first week.",
            tasks: Array.from({ length: 7 }, (_, i) => ({ day: i + 1, label: profile.topics[i] || `Day ${i + 1} action` })),
            published: false,
          },
        });
        markBuilt("challenge");
      },
    });
  }

  if (components.includes("resources")) {
    tasks.push({ id: "resources", label: "Creating Starter Content", run: () => { markBuilt("resources"); } });
  }
  if (components.includes("events")) {
    tasks.push({ id: "events", label: "Preparing Your Events Space", run: () => { markBuilt("events"); } });
  }
  if (components.includes("member-onboarding")) {
    tasks.push({ id: "member-onboarding", label: "Setting Up Member Onboarding", run: () => { markBuilt("member-onboarding"); } });
  }

  tasks.push({
    id: "aiva",
    label: "Configuring AIVA",
    run: () => {
      setAivaContext({ onboardingCompleted: true });
      markBuilt("aiva");
    },
  });

  return tasks;
}

function StepBuild({ components, profile, brand, navItems, onDone }: {
  components: ClubComponentId[]; profile: BusinessProfile;
  brand: { clubName: string; color: string; slug: string; logoUrl: string };
  navItems: NavProposalItem[];
  onDone: () => void;
}) {
  const tasks = useMemo(() => buildTasks(components, profile, brand, navItems), [components, profile, brand, navItems]);
  const [done, setDone] = useState(0);

  useEffect(() => {
    if (done >= tasks.length) {
      const t = window.setTimeout(onDone, 700);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => {
      tasks[done].run();
      setDone(d => d + 1);
    }, done === 0 ? 500 : 850);
    return () => window.clearTimeout(t);
  }, [done, tasks, onDone]);

  const pct = Math.round((done / tasks.length) * 100);

  return (
    <section className="ob-panel ob-panel-narrow ob-build">
      <div className="ob-build-orb" style={{ ["--ob-orb" as string]: brand.color }}><Sparkles size={22} /></div>
      <h1 className="ob-title">AIVA Is Building Your Club</h1>
      <p className="ob-sub">This takes a moment. Everything AIVA creates stays editable.</p>

      <div className="ob-prog"><span style={{ width: `${pct}%` }} /></div>

      <ul className="ob-build-list">
        {tasks.map((t, i) => (
          <li key={t.id} className={i < done ? "done" : i === done ? "active" : ""}>
            <span className="ob-build-dot">
              {i < done ? <Check size={12} strokeWidth={3} /> : i === done ? <Loader2 size={12} className="ob-spin" /> : null}
            </span>
            {t.label}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ========================= 10 — Reveal ========================= */
function StepReveal({ brand, components, onEnter, onPreview }: {
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
