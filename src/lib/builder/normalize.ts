// Builder Core — normalization and migration.
//
// Historically the Club builder and the Sales builder used slightly different
// prop names for the same idea ("subtitle" vs "sub", "url" vs "imageUrl").
// Saved pages keep working because every block is normalized on read: aliases
// are mirrored so any renderer finds the value under the name it expects, and
// missing props are back-filled from the canonical catalog defaults.

import { blockDef, defaultPropsFor } from "./catalog";
import type { BuilderBlock, BuilderSurface, BuilderTheme, BlockProps } from "./types";
import { DEFAULT_BUILDER_THEME } from "./types";

/** Prop pairs that mean the same thing. Values are mirrored both ways. */
const ALIASES: Record<string, [string, string][]> = {
  hero: [["subtitle", "sub"], ["imageUrl", "coverUrl"]],
  image: [["url", "imageUrl"]],
  cta: [["body", "sub"]],
  "join-cta": [["body", "sub"]],
  booking: [["body", "sub"]],
  offer: [["body", "sub"]],
  countdown: [["body", "sub"]],
};

function mirror(type: string, props: BlockProps): BlockProps {
  const pairs = ALIASES[type];
  if (!pairs) return props;
  const next = { ...props };
  for (const [a, b] of pairs) {
    const av = next[a];
    const bv = next[b];
    if (av !== undefined && av !== "" && (bv === undefined || bv === "")) next[b] = av;
    else if (bv !== undefined && bv !== "" && (av === undefined || av === "")) next[a] = bv;
  }
  return next;
}

export function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Create a canonical block for a surface. */
export function makeBuilderBlock(
  type: string,
  surface: BuilderSurface,
  props: BlockProps = {},
): BuilderBlock {
  return {
    id: uid(type),
    type,
    props: mirror(type, { ...defaultPropsFor(type, surface), ...props }),
  };
}

/** Normalize one saved block. */
export function normalizeBlock(block: BuilderBlock, surface: BuilderSurface): BuilderBlock {
  const def = blockDef(block.type);
  const base = def ? defaultPropsFor(block.type, surface) : {};
  const props = mirror(block.type, { ...base, ...(block.props ?? {}) });
  return {
    id: block.id || uid(block.type || "block"),
    type: block.type,
    ...(block.hidden ? { hidden: true } : {}),
    props,
  };
}

/** Normalize a saved page's blocks. Unknown types are kept but never render. */
export function normalizeBlocks(blocks: BuilderBlock[] | undefined, surface: BuilderSurface): BuilderBlock[] {
  if (!Array.isArray(blocks)) return [];
  return blocks.map(b => normalizeBlock(b, surface));
}

/** Normalize any saved theme onto the canonical theme shape. */
export function normalizeTheme(theme: Partial<BuilderTheme> | undefined): BuilderTheme {
  return { ...DEFAULT_BUILDER_THEME, ...(theme ?? {}) };
}

/** Reorder helper shared by every builder. */
export function move<T>(arr: T[], from: number, to: number): T[] {
  const next = arr.slice();
  if (from < 0 || from >= next.length || to < 0 || to >= next.length) return next;
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
