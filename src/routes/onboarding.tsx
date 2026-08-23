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
  type MonetizationId, type ClubComponentId, type PersonaIdentityMode,
} from "@/lib/aiva-context";
import { StepWelcome } from "@/components/onboarding/StepWelcome";
import { StepLearn } from "@/components/onboarding/StepLearn";
import { StepReview } from "@/components/onboarding/StepReview";
import { StepMonetize } from "@/components/onboarding/StepMonetize";
import { StepRecommendations } from "@/components/onboarding/StepRecommendations";
import { StepNavigation } from "@/components/onboarding/StepNavigation";
import { StepBrand } from "@/components/onboarding/StepBrand";
import { StepPersona } from "@/components/onboarding/StepPersona";
import { StepPayments } from "@/components/onboarding/StepPayments";
import { StepBuild } from "@/components/onboarding/StepBuild";
import { StepReveal } from "@/components/onboarding/StepReveal";

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
  "persona": <Sparkles size={16} />,
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
  const [persona, setPersona] = useState(() => getAivaContext().persona);
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
    setAivaContext({ description, websiteUrl, sources, profile, monetization, components, brand, persona, payments });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [description, websiteUrl, sources, profile, monetization, components, brand, persona, payments]);

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
            onBack={() => go(3)} onNext={() => go(5)}
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
            onBack={() => go(5)} onNext={() => go(7)}
          />
        )}
        {step === 7 && (
          <StepPersona
            value={persona} setValue={setPersona} brand={brand}
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
