// Build Plan builders — the ONLY place a plan item turns into real, persisted
// content. Each builder returns true when something was actually written (or
// already existed). Anything without a builder is reported as "skipped" — we
// never claim AIVA created something it did not.

import {
  getGS, setGS,
  type GSCourse, type GSCoachingProgram, type GSChallenge, type GSEvent,
  type GSSocialDraft, type GSResource,
} from "@/lib/gs-store";
import { addFromTemplate } from "@/lib/apps/store";
import { setPersona } from "@/lib/persona/store";
import { getAivaContext } from "@/lib/aiva-context";

export type BuilderInput = Record<string, string> | undefined;
type Builder = (input: BuilderInput) => boolean;

function slug(s: string) {
  return (s || "club").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const BUILDERS: Record<string, Builder> = {
  branding: () => {
    const s = getGS();
    if (!s.clubTagline) setGS({ clubTagline: `The #1 community for serious ${s.niche || "your niche"} professionals.` });
    return true;
  },

  linkbio: () => {
    const s = getGS();
    const handle = slug(s.clubName);
    if (!s.linkInBio) {
      setGS({ linkInBio: {
        handle,
        links: [
          { label: "Join the Club", url: `https://advisorsclub.com/${handle}` },
          { label: "Free Resources", url: `https://advisorsclub.com/${handle}/resources` },
          { label: "Book a Call", url: `https://advisorsclub.com/${handle}/book` },
        ],
      }});
    }
    return true;
  },

  scheduling: () => {
    const s = getGS();
    if (!s.schedulingLink) setGS({ schedulingLink: `https://advisorsclub.com/${slug(s.clubName)}/book` });
    return true;
  },

  website: () => {
    const s = getGS();
    const club = s.clubName || "Your Club";
    const niche = s.niche || "your niche";
    if (!s.websiteUrl) setGS({ websiteUrl: `https://advisorsclub.com/${slug(club)}` });
    if (!s.clubDesc) setGS({ clubDesc: `${club} is a hands-on community for ${niche} professionals — deals, systems, and accountability.` });
    return true;
  },

  welcome: () => {
    const s = getGS();
    const club = s.clubName || "Your Club";
    const niche = s.niche || "your niche";
    if (!s.welcomePost.body) {
      setGS({ welcomePost: {
        title: `Welcome to ${club} 👋`,
        body: `You made it. This is the room where ${niche.toLowerCase()} actually gets done.\n\n→ Drop a comment with your city + what you're working on\n→ Check out the course (already pre-built)\n→ Say hi to the other members`,
        published: true,
      }});
    }
    return true;
  },

  space: (input) => {
    const s = getGS();
    const name = input?.name || `${s.niche || "Member"} Room`;
    const exists = s.resources.some(r => r.id === `space-${slug(name)}`);
    if (!exists) {
      const space: GSResource = {
        id: `space-${slug(name)}`, title: name, kind: "vault",
        desc: `Dedicated community space for ${name.toLowerCase()} conversations.`,
      };
      setGS({ resources: [...s.resources, space] });
    }
    return true;
  },

  newsletter: () => {
    const s = getGS();
    if (!s.newsletter) setGS({ newsletter: { name: `${s.clubName || "Your Club"} Weekly`, cadence: "weekly", configured: true } });
    return true;
  },

  quiz: () => {
    const s = getGS();
    if (!s.quizFunnel) setGS({ quizFunnel: { title: `What kind of ${s.niche || "business"} operator are you?`, questions: 7, published: true } });
    return true;
  },

  social: () => {
    const s = getGS();
    const club = s.clubName || "Your Club";
    const niche = s.niche || "your niche";
    if (!s.socialDrafts.length) {
      const drafts: GSSocialDraft[] = [
        { id: "sd1", platform: "x", caption: `Just opened the doors to ${club}. If you're serious about ${niche}, this is the room.` },
        { id: "sd2", platform: "linkedin", caption: `After years in ${niche}, I'm finally building the community I wish I'd had. Inside ${club}: deals, systems, accountability.` },
        { id: "sd3", platform: "instagram", caption: `${club} is live ✨ Tap the link in bio.` },
        { id: "sd4", platform: "x", caption: `Pro tip from inside ${club}: the win isn't the deal — it's the system that finds the next one.` },
        { id: "sd5", platform: "linkedin", caption: `Free preview lesson from ${club} dropping this week. Comment "in" and I'll send it over.` },
      ];
      setGS({ socialDrafts: drafts });
    }
    return true;
  },

  launchEmail: () => {
    const s = getGS();
    const club = s.clubName || "Your Club";
    const exists = s.resources.some(r => r.id === "launch-email");
    if (!exists) {
      setGS({ resources: [...s.resources, {
        id: "launch-email", title: `${club} Launch Email`, kind: "swipe",
        desc: "Announcement email drafted from your club description and offer.",
      }]});
    }
    return true;
  },

  challenge: (input) => {
    const s = getGS();
    const niche = s.niche || "your niche";
    if (!s.challenge) {
      const ch: GSChallenge = {
        id: "ch1", published: true,
        name: input?.name || `7-Day ${niche} Kickstart`,
        days: 7,
        tagline: "One small, offer-producing action every day for a week.",
        tasks: [
          { day: 1, label: `Define your #1 ${niche} goal for the next 90 days.` },
          { day: 2, label: "Make a list of 25 people to reach out to." },
          { day: 3, label: "Send 10 of those messages." },
          { day: 4, label: "Publish one piece of public content." },
          { day: 5, label: "Book one conversation on the calendar." },
          { day: 6, label: "Review what worked + what didn't." },
          { day: 7, label: "Make your first offer." },
        ],
      };
      setGS({ challenge: ch });
    }
    return true;
  },

  course: (input) => {
    const s = getGS();
    const niche = s.niche || "your niche";
    if (!s.course) {
      const course: GSCourse = {
        id: "c1", published: true,
        title: input?.title || `${niche} Mastery — From First Step to Full-Time`,
        tagline: input?.tagline || `The complete ${niche} playbook — 6 modules, 24 lessons.`,
        modules: [
          { title: "Foundations & Mindset", lessons: 4 },
          { title: "Finding Opportunities", lessons: 5 },
          { title: "Analyzing & Strategy", lessons: 4 },
          { title: "Pitching & Closing", lessons: 4 },
          { title: "Systems & Delivery", lessons: 4 },
          { title: "Scaling Up", lessons: 3 },
        ],
        price: 297,
      };
      setGS({ course });
    }
    return true;
  },

  coachagree: () => {
    const s = getGS();
    if (!s.coachingAgreement) setGS({ coachingAgreement: { title: `${s.clubName || "Your Club"} Coaching Agreement`, drafted: true } });
    return true;
  },

  coaching1on1: () => {
    const s = getGS();
    if (s.coaching.some(c => c.type === "1on1")) return true;
    const item: GSCoachingProgram = {
      id: `co-${Date.now()}`, type: "1on1", name: `1:1 ${s.niche || "Business"} Coaching`,
      desc: "Private weekly call — get unstuck on what's in front of you.",
      sessionsPerMonth: 4, price: 497,
    };
    setGS({ coaching: [...s.coaching, item] });
    return true;
  },

  coachingGroup: (input) => {
    const s = getGS();
    if (s.coaching.some(c => c.type === "group")) return true;
    const item: GSCoachingProgram = {
      id: `co-${Date.now()}`, type: "group", name: input?.name || "Weekly Group Coaching",
      desc: input?.desc || "Recurring group call with hot-seats and live reviews.",
      sessionsPerMonth: 4, price: 197,
    };
    setGS({ coaching: [...s.coaching, item] });
    return true;
  },

  event: (input) => {
    const s = getGS();
    if (s.events.length) return true;
    const ev: GSEvent = {
      id: "ev1", type: "qa",
      title: input?.title || `${s.clubName || "Your Club"} — Live Q&A: Ask Me Anything`,
      desc: "Bring your hardest question. We unpack it live.",
      date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      time: "18:00", maxAttendees: 200,
    };
    setGS({ events: [ev] });
    return true;
  },

  marketplace: () => {
    const s = getGS();
    if (!s.marketplaceListing) setGS({ marketplaceListing: { headline: `${s.clubName || "Your Club"} — ${s.niche || "business"} community + coaching`, listed: true } });
    return true;
  },

  resourceVault: (input) => {
    const s = getGS();
    const title = input?.title || `${s.niche || "Member"} Resource Vault`;
    const id = `res-${slug(title)}`;
    if (!s.resources.some(r => r.id === id)) {
      setGS({ resources: [...s.resources, { id, title, kind: "vault", desc: input?.desc || "Central library for your templates, checklists and guides." }] });
    }
    return true;
  },

  /** Installs a real app from the App Library into the creator's Apps area. */
  appTemplate: (input) => {
    const templateId = input?.templateId;
    if (!templateId) return false;
    return Boolean(addFromTemplate(templateId, { mode: "free" }));
  },

  /** Turns on the member-facing AI Persona with a name derived from the business. */
  persona: (input) => {
    const ctx = getAivaContext();
    const s = getGS();
    setPersona({
      enabled: true,
      name: input?.name || ctx.memberAi.name || `${s.niche || "Member"} Coach AI`,
      title: input?.title || "AI Coach",
      description: input?.description || "AI assistant trained on your content, methodology and voice.",
    });
    return true;
  },
};

export function runBuilder(builder: string | undefined, input: BuilderInput): boolean {
  if (!builder) return false;
  const fn = BUILDERS[builder];
  if (!fn) return false;
  try { return fn(input); } catch { return false; }
}

export function hasBuilder(builder: string | undefined): boolean {
  return Boolean(builder && BUILDERS[builder]);
}
