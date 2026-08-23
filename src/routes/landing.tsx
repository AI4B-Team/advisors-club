import { createFileRoute, redirect } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { StatsRow } from "@/components/landing/StatsRow";
import { ReplaceToolsSection } from "@/components/landing/ReplaceToolsSection";
import { ShowcaseSection } from "@/components/landing/ShowcaseSection";
import { MeetAivaSection } from "@/components/landing/MeetAivaSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { BottomCta } from "@/components/landing/BottomCta";
import { SiteFooter } from "@/components/landing/SiteFooter";

export const Route = createFileRoute("/landing")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
});

/** Marketing home page. Each section owns its own markup; this file only
 *  composes them in order. Design and copy are unchanged. */
export function Index() {
  return (
    <div className="ac">
      <SiteNav />
      <HeroSection />
      <StatsRow />
      <ReplaceToolsSection />
      <ShowcaseSection />
      <MeetAivaSection />
      <PricingSection />
      <TestimonialsSection />
      <BottomCta />
      <SiteFooter />
    </div>
  );
}
