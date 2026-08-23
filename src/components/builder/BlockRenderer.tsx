// Builder Core — THE canonical block renderer.
//
// Editing preview and published output both render through this component, so
// what a creator builds is exactly what a visitor or member sees.
//
// Two section libraries feed it: signed-in Club sections (cz-*) and public
// marketing sections (sp-*). The page's surface decides which library is tried
// first; the other is the fallback, so every canonical block type renders on
// every page type.

import type { BuilderBlock, BuilderSurface, BuilderTheme } from "@/lib/builder/types";
import { renderAppSection, type SectionData } from "./sections/app-sections";
import { renderMarketingSection, marketingStyleVars } from "./sections/marketing-sections";

export type { SectionData };

const APP_PAD: Record<string, string> = { comfortable: "18px", compact: "12px", spacious: "26px" };

/** CSS custom properties for a themed page, per surface. */
export function builderStyleVars(theme: BuilderTheme, surface: BuilderSurface): React.CSSProperties {
  const base = marketingStyleVars(theme);
  if (surface === "marketing") return base;
  return { ...base, ["--cz-pad" as string]: APP_PAD[theme.density] ?? "18px" };
}

export function BlockRenderer({
  block, data, surface,
}: {
  block: BuilderBlock;
  data: SectionData;
  surface: BuilderSurface;
}) {
  const primary = surface === "marketing" ? renderMarketingSection : renderAppSection;
  const fallback = surface === "marketing" ? renderAppSection : renderMarketingSection;
  const out = primary(block, data) ?? fallback(block, data);
  return <>{out}</>;
}
