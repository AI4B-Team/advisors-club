// Builder Core — the single canonical block catalog.
//
// Two manifests feed it (signed-in Club blocks and public marketing blocks).
// Types that exist in both are merged into ONE canonical definition, so there
// is exactly one schema per block type across every page builder.

import type { BlockDef, BlockField, BlockProps, BuilderSurface, PageTypeId } from "./types";
import { APP_BLOCK_DEFS } from "./catalog/app-blocks";
import { MARKETING_BLOCK_DEFS } from "./catalog/marketing-blocks";

export type CanonicalBlockDef = BlockDef & {
  /** Which rendering surfaces know how to draw this block. */
  surfaces: BuilderSurface[];
  /** Surface-specific starting content, used when a block is added. */
  variants: Partial<Record<BuilderSurface, BlockProps>>;
};

function mergeFields(a: BlockField[], b: BlockField[]): BlockField[] {
  const out = a.slice();
  for (const f of b) if (!out.some(x => x.key === f.key)) out.push(f);
  return out;
}

function build(): CanonicalBlockDef[] {
  const map = new Map<string, CanonicalBlockDef>();

  const add = (def: BlockDef, surface: BuilderSurface) => {
    const existing = map.get(def.type);
    if (!existing) {
      map.set(def.type, {
        ...def,
        pages: [...def.pages],
        surfaces: [surface],
        variants: { [surface]: def.defaults },
      });
      return;
    }
    existing.pages = Array.from(new Set([...existing.pages, ...def.pages]));
    existing.fields = mergeFields(existing.fields, def.fields);
    existing.defaults = { ...existing.defaults, ...def.defaults };
    existing.duplicable = existing.duplicable || def.duplicable;
    if (!existing.surfaces.includes(surface)) existing.surfaces.push(surface);
    existing.variants[surface] = def.defaults;
  };

  APP_BLOCK_DEFS.forEach(d => add(d, "app"));
  MARKETING_BLOCK_DEFS.forEach(d => add(d, "marketing"));
  return Array.from(map.values());
}

export const BLOCK_CATALOG: CanonicalBlockDef[] = build();

export const BLOCK_MAP: Record<string, CanonicalBlockDef> =
  Object.fromEntries(BLOCK_CATALOG.map(d => [d.type, d]));

export function blockDef(type: string): CanonicalBlockDef | undefined {
  return BLOCK_MAP[type];
}

export function blockLabel(type: string): string {
  return BLOCK_MAP[type]?.label ?? type.replace(/-/g, " ");
}

/** Blocks a given page type is allowed to use. */
export function blocksForPageType(pageType: PageTypeId): CanonicalBlockDef[] {
  return BLOCK_CATALOG.filter(d => d.pages.includes(pageType));
}

/** Starting props for a new block, biased to the surface it will render on. */
export function defaultPropsFor(type: string, surface: BuilderSurface): BlockProps {
  const def = BLOCK_MAP[type];
  if (!def) return {};
  return { ...def.defaults, ...(def.variants[surface] ?? {}) };
}
