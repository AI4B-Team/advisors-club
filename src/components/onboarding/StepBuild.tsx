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

export function StepBuild({ components, profile, brand, navItems, onDone }: {
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

