// Build Plan generation.
//
// generateOnboardingPlan() reads the REAL business context AIVA captured
// during onboarding (aiva-context + gs-store) and proposes only what fits
// that business. Nothing is included just because the platform supports it.
//
// generateRequestPlan() is the same machinery for future "Build With AI"
// requests ("Build me a coaching program", "Create a 30-day challenge").

import { getAivaContext, type AivaContext } from "@/lib/aiva-context";
import { getGS, type GSStore } from "@/lib/gs-store";
import { APP_TEMPLATES } from "@/lib/apps/library";
import type { BuildPlan, BuildPlanItem, BuildPlanKind } from "./types";

const now = () => new Date().toISOString();

function item(i: Omit<BuildPlanItem, "selected" | "origin"> & Partial<Pick<BuildPlanItem, "selected" | "origin">>): BuildPlanItem {
  return { selected: i.selected ?? true, origin: i.origin ?? "aiva", ...i } as BuildPlanItem;
}

/** Best-effort niche → App Library category match. Falls back to universal apps. */
function appTemplatesFor(niche: string, topics: string[]) {
  const hay = `${niche} ${topics.join(" ")}`.toLowerCase();
  const map: [RegExp, string][] = [
    [/real estate|property|flip|rental|investor|realtor/, "Real Estate"],
    [/fitness|health|nutrition|training|coach.*athlet/, "Fitness"],
    [/coach|mindset|accountab/, "Coaching"],
    [/business|marketing|agency|consult|sales|ecom/, "Business"],
  ];
  const cat = map.find(([re]) => re.test(hay))?.[1];
  const picks = cat ? APP_TEMPLATES.filter(t => t.category === cat) : [];
  const fallback = APP_TEMPLATES.filter(t => t.category === "Universal");
  return (picks.length ? picks : fallback).slice(0, 2);
}

function niceName(gs: GSStore, ctx: AivaContext) {
  return ctx.brand.clubName || gs.clubName || "Your Club";
}

/**
 * The initial onboarding plan. Categories only appear when the creator's
 * answers justify them.
 */
export function generateOnboardingPlan(): BuildPlan {
  const gs = getGS();
  const ctx = getAivaContext();
  const club = niceName(gs, ctx);
  const niche = ctx.profile.expertise || gs.niche || "your niche";
  const audience = ctx.profile.audience || gs.audience || "your members";
  const money = ctx.monetization;
  const comps = ctx.components;
  const goal = (gs.goal || "").toLowerCase();
  const has = (m: string) => money.includes(m as never);
  const wants = (c: string) => comps.includes(c as never);
  const topics = ctx.profile.topics || [];

  const items: BuildPlanItem[] = [];

  /* IDENTITY — always required to have a club at all */
  items.push(item({
    id: "branding", label: "Club Branding", category: "identity", required: true,
    description: `Name, colors and tagline for ${club}.`,
    building: "Designing your brand…", done: "Brand is locked in!",
    builder: "branding", editTo: "/app/customize",
  }));
  items.push(item({
    id: "website", label: "Club Website", category: "identity", required: true,
    description: "Public page members join from.",
    building: "Spinning up your website…", done: "Website is live!",
    builder: "website", editTo: "/app/customize",
  }));
  if (has("coaching-1on1") || has("coaching-group") || has("mastermind")) {
    items.push(item({
      id: "scheduling", label: "Scheduling Link", category: "identity",
      description: "Booking link for calls and consults.",
      building: "Setting up your scheduling link…", done: "Scheduling link is ready!",
      builder: "scheduling", recommended: true,
    }));
  }
  if (/audience|social|follow/.test(goal) || ctx.sources.some(s => s.kind === "social")) {
    items.push(item({
      id: "linkbio", label: "Link In Bio", category: "identity",
      description: "One page linking your socials to the club.",
      building: "Building your link-in-bio page…", done: "Link in bio is live!",
      builder: "linkbio",
    }));
  }

  /* COMMUNITY */
  items.push(item({
    id: "welcome", label: "Welcome Post", category: "community", required: true,
    description: "Pinned first post that tells members what to do first.",
    building: "Drafting your welcome post…", done: "Welcome post is pinned!",
    builder: "welcome", editTo: "/app/club/community",
  }));
  if (topics[0]) {
    const spaceName = `${topics[0]} Room`;
    items.push(item({
      id: "space", label: spaceName, category: "community", recommended: true,
      description: `Dedicated space for ${audience.toLowerCase()} to talk ${topics[0].toLowerCase()}.`,
      building: `Creating the ${spaceName}…`, done: `${spaceName} is open!`,
      builder: "space", builderInput: { name: spaceName }, editTo: "/app/club/community",
    }));
  }
  if (has("free-community") || /grow|reach|members/.test(goal)) {
    items.push(item({
      id: "marketplace", label: "Marketplace Listing", category: "community", selected: false,
      description: "Get discovered by people searching for your expertise.",
      building: "Listing you on the marketplace…", done: "Listed on the marketplace!",
      builder: "marketplace",
    }));
  }

  /* COURSES */
  if (has("courses") || has("membership") || wants("starter-course")) {
    items.push(item({
      id: "course", label: `${niche} Academy`, category: "courses", recommended: true,
      description: `Beginner-to-advanced course built from your ${niche.toLowerCase()} framework.`,
      building: "Outlining your signature course…", done: "Course is outlined!",
      builder: "course", builderInput: { title: `${niche} Academy` }, editTo: "/app/club/courses",
    }));
  }

  /* COACHING */
  if (has("coaching-group") || has("mastermind") || wants("coaching-program")) {
    items.push(item({
      id: "coachingGroup", label: "Weekly Group Coaching", category: "coaching", recommended: true,
      description: "Recurring group session for live reviews and hot seats.",
      building: "Setting up weekly coaching…", done: "Weekly coaching is scheduled!",
      builder: "coachingGroup", editTo: "/app/club/coaching",
    }));
  }
  if (has("coaching-1on1")) {
    items.push(item({
      id: "coaching1on1", label: "1:1 Coaching", category: "coaching",
      description: "Private coaching tier with a monthly session cadence.",
      building: "Building your 1:1 coaching tier…", done: "1:1 coaching is set!",
      builder: "coaching1on1", editTo: "/app/club/coaching",
    }));
    items.push(item({
      id: "coachagree", label: "Coaching Agreement", category: "coaching", selected: false,
      description: "Simple client agreement you can edit and send.",
      building: "Drafting your coaching agreement…", done: "Agreement is ready to sign!",
      builder: "coachagree",
    }));
  }

  /* EVENTS */
  if (has("events") || wants("events")) {
    items.push(item({
      id: "event", label: "Live Q&A Session", category: "events",
      description: "First scheduled session on your club calendar.",
      building: "Scheduling your live Q&A…", done: "Live Q&A is on the calendar!",
      builder: "event", editTo: "/app/club/events",
    }));
  }

  /* RESOURCES */
  if (wants("resources") || has("digital-products")) {
    items.push(item({
      id: "resourceVault", label: `${niche} Resource Vault`, category: "resources", recommended: true,
      description: "Central library for your templates, checklists and guides.",
      building: "Building your resource vault…", done: "Resource vault is ready!",
      builder: "resourceVault", builderInput: { title: `${niche} Resource Vault` }, editTo: "/app/club/resources",
    }));
  }

  /* APPS — interactive tools from your expertise */
  for (const t of appTemplatesFor(niche, topics)) {
    items.push(item({
      id: `app-${t.id}`, label: t.name, category: "apps", recommended: true,
      description: t.description,
      building: `Creating ${t.name}…`, done: `${t.name} is ready!`,
      builder: "appTemplate", builderInput: { templateId: t.id }, editTo: "/app/apps",
    }));
  }

  /* AI PERSONA */
  if (wants("member-ai") || ctx.memberAi.configured || true) {
    const personaName = ctx.memberAi.name && ctx.memberAi.name !== "AIVA"
      ? ctx.memberAi.name : `${niche} Coach AI`;
    items.push(item({
      id: "persona", label: personaName, category: "persona", recommended: true,
      description: "AI assistant trained on your content, methodology and voice.",
      building: "Configuring your member AI…", done: "Your member AI is live!",
      builder: "persona", builderInput: { name: personaName }, editTo: "/app/manage/persona",
    }));
  }

  /* CONTENT — only what the goal actually calls for */
  items.push(item({
    id: "launchEmail", label: "Launch Email", category: "content",
    description: "Announcement email drafted from your club description.",
    building: "Writing your launch email…", done: "Launch email is drafted!",
    builder: "launchEmail",
  }));
  if (/audience|list|email|nurture/.test(goal) || has("membership")) {
    items.push(item({
      id: "newsletter", label: "Newsletter", category: "content", selected: false,
      description: "Weekly send that keeps members warm between offers.",
      building: "Setting up your newsletter…", done: "Newsletter is configured!",
      builder: "newsletter",
    }));
  }
  if (/lead|grow|audience/.test(goal)) {
    items.push(item({
      id: "social", label: "Social Drafts", category: "content", selected: false,
      description: "Five launch posts in your voice.",
      building: "Writing 5 social posts…", done: "Social drafts are ready!",
      builder: "social",
    }));
  }

  return {
    id: "onboarding",
    kind: "onboarding",
    intro: `Here's what I'll build for ${club}. Keep what you want and turn off anything you don't need.`,
    cta: "Build My Club",
    returnTo: "/app",
    returnLabel: "Enter My Club",
    items,
    createdAt: now(),
  };
}

const REQUEST_CTA: Record<BuildPlanKind, string> = {
  onboarding: "Build My Club",
  community: "Build This Space",
  course: "Build This Course",
  coaching: "Build This Program",
  challenge: "Build This Challenge",
  event: "Build This Event",
  resource: "Build These Resources",
  app: "Build These Apps",
  offer: "Create My Launch Plan",
  custom: "Build This",
};

/**
 * Future "Build With AI" entry point. The admin picks what to build and
 * describes it; AIVA proposes a plan that renders in the SAME component.
 */
export function generateRequestPlan(kind: BuildPlanKind, prompt = ""): BuildPlan {
  const gs = getGS();
  const ctx = getAivaContext();
  const niche = ctx.profile.expertise || gs.niche || "your niche";
  const label = prompt.trim() || `${niche} ${kind}`;
  const items: BuildPlanItem[] = [];

  if (kind === "course") {
    items.push(item({ id: "course", label: label, category: "courses", required: true,
      description: "Full module and lesson outline from your framework.",
      building: "Outlining your course…", done: "Course is outlined!",
      builder: "course", builderInput: { title: label }, editTo: "/app/club/courses" }));
    items.push(item({ id: "resourceVault", label: "Course Resource Pack", category: "resources", recommended: true,
      description: "Worksheets and checklists that support the lessons.",
      building: "Building the resource pack…", done: "Resource pack is ready!",
      builder: "resourceVault", builderInput: { title: `${label} Resources` } }));
  } else if (kind === "coaching") {
    items.push(item({ id: "coachingGroup", label: label, category: "coaching", required: true,
      description: "Recurring group program with session cadence and pricing.",
      building: "Setting up your program…", done: "Program is live!",
      builder: "coachingGroup", builderInput: { name: label }, editTo: "/app/club/coaching" }));
    items.push(item({ id: "coachagree", label: "Coaching Agreement", category: "coaching", recommended: true,
      description: "Client agreement you can edit and send.",
      building: "Drafting the agreement…", done: "Agreement is ready!", builder: "coachagree" }));
    items.push(item({ id: "event", label: "First Session", category: "events",
      description: "Puts the first call on the calendar.",
      building: "Scheduling the first session…", done: "First session is scheduled!", builder: "event" }));
  } else if (kind === "challenge") {
    items.push(item({ id: "challenge", label: label, category: "community", required: true,
      description: "Day-by-day tasks members complete together.",
      building: "Designing your challenge…", done: "Challenge is scheduled!",
      builder: "challenge", builderInput: { name: label } }));
    items.push(item({ id: "launchEmail", label: "Challenge Invite Email", category: "content", recommended: true,
      description: "Invitation email for your members.",
      building: "Writing the invite…", done: "Invite is drafted!", builder: "launchEmail" }));
  } else if (kind === "app") {
    for (const t of appTemplatesFor(niche, ctx.profile.topics || [])) {
      items.push(item({ id: `app-${t.id}`, label: t.name, category: "apps", recommended: true,
        description: t.description, building: `Creating ${t.name}…`, done: `${t.name} is ready!`,
        builder: "appTemplate", builderInput: { templateId: t.id }, editTo: "/app/apps" }));
    }
  } else if (kind === "event") {
    items.push(item({ id: "event", label: label, category: "events", required: true,
      description: "Scheduled session on your club calendar.",
      building: "Scheduling your event…", done: "Event is on the calendar!", builder: "event", editTo: "/app/club/events" }));
  } else if (kind === "resource") {
    items.push(item({ id: "resourceVault", label: label, category: "resources", required: true,
      description: "New library members can work through.",
      building: "Building your resources…", done: "Resources are ready!",
      builder: "resourceVault", builderInput: { title: label }, editTo: "/app/club/resources" }));
  } else if (kind === "community") {
    items.push(item({ id: "space", label: label, category: "community", required: true,
      description: "New space with its own conversation.",
      building: `Creating ${label}…`, done: `${label} is open!`,
      builder: "space", builderInput: { name: label }, editTo: "/app/club/community" }));
    items.push(item({ id: "welcome", label: "Welcome Post", category: "community", recommended: true,
      description: "Tells members what this space is for.",
      building: "Drafting the welcome post…", done: "Welcome post is pinned!", builder: "welcome" }));
  } else {
    items.push(item({ id: "launchEmail", label: label, category: "content", required: true,
      description: "Draft AIVA can build from your description.",
      building: "Working on it…", done: "Draft is ready!", builder: "launchEmail", origin: "static" }));
  }

  return {
    id: `plan-${Date.now()}`,
    kind,
    intro: `Here's what I'd build for that. Keep what you want and turn off anything you don't need.`,
    cta: REQUEST_CTA[kind],
    returnTo: kind === "app" ? "/app/apps" : kind === "course" ? "/app/club/courses" : "/app",
    returnLabel: "View What I Built",
    items,
    createdAt: now(),
  };
}
