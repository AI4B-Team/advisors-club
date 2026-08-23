// Builds the business-knowledge brief AIVA uses to draft sales pages.
// Reads the same sources as the rest of the product: onboarding context,
// AIVA admin facts, the getting-started store, courses and events.

import { getAivaContext } from "../aiva-context";
import { getAivaAdmin } from "../aiva-admin";
import { getGS } from "../gs-store";
import { loadAdmin } from "../courses/storage";
import { getEvents } from "../events-store";

export function businessBrief(): string {
  if (typeof window === "undefined") return "";
  const ctx = getAivaContext();
  const admin = getAivaAdmin();
  const gs = getGS();
  const out: string[] = [];

  out.push(`CLUB: ${ctx.brand.clubName || gs.clubName || "Your Club"}${gs.clubTagline ? ` — ${gs.clubTagline}` : ""}`);
  if (gs.clubDesc) out.push(`DESCRIPTION: ${gs.clubDesc}`);
  if (gs.niche) out.push(`NICHE: ${gs.niche}`);

  const p = ctx.profile;
  if (p.business) out.push(`BUSINESS: ${p.business}`);
  if (p.expertise) out.push(`EXPERTISE: ${p.expertise}`);
  if (p.audience || gs.audience) out.push(`AUDIENCE: ${p.audience || gs.audience}`);
  if (p.transformation) out.push(`TRANSFORMATION PROMISED: ${p.transformation}`);
  if (p.topics?.length) out.push(`TOPICS: ${p.topics.join(", ")}`);
  if (p.offers?.length) out.push(`EXISTING OFFERS: ${p.offers.join(", ")}`);
  if (p.businessModel) out.push(`BUSINESS MODEL: ${p.businessModel}`);
  if (p.brandVoice || gs.tone) out.push(`BRAND VOICE: ${p.brandVoice || gs.tone}`);
  if (ctx.monetization?.length) out.push(`MONETIZATION: ${ctx.monetization.join(", ")}`);

  const facts = admin.facts || {};
  for (const [k, v] of Object.entries(facts)) if (v) out.push(`${k.replace(/-/g, " ").toUpperCase()}: ${String(v).slice(0, 600)}`);

  const courses = loadAdmin();
  if (courses.length) out.push(`COURSES: ${courses.slice(0, 8).map(c => c.title).join(", ")}`);
  if (gs.coaching?.length) out.push(`COACHING PROGRAMS: ${gs.coaching.map(c => c.name || c.title || "").filter(Boolean).join(", ")}`);

  const events = getEvents();
  if (events.length) out.push(`UPCOMING EVENTS: ${events.slice(0, 4).map(e => e.title).join(", ")}`);

  if (gs.membership) {
    out.push(`CURRENT PLANS: ${gs.membership.freeLabel || "Free"} ($0) and ${gs.membership.paidLabel || "Pro"} ($${gs.membership.paidPrice ?? 49}/mo)`);
  }
  if (gs.testimonials?.length) out.push(`TESTIMONIALS: ${gs.testimonials.map(t => `${t.name}: ${t.body}`).slice(0, 4).join(" | ")}`);
  if (ctx.websiteUrl || gs.websiteUrl) out.push(`WEBSITE: ${ctx.websiteUrl || gs.websiteUrl}`);

  return out.join("\n").slice(0, 6000);
}
