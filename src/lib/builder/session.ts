// Builder Core — the contract every builder store must satisfy.
//
// Page content lives in different documents (Club customization vs. Sell
// pages), so stores stay separate on purpose. They expose the same session
// API, which is what the shared builder shell drives.

import type { BlockProps, BuilderPage, BuilderTheme } from "./types";

export type BlockDraft = { type: string; props?: Record<string, string> };

export type BuilderSession = {
  page: BuilderPage;
  hydrated: boolean;
  dirty: boolean;
  canUndo: boolean;
  canRedo: boolean;
  addBlock: (type: string, index?: number) => string;
  removeBlock: (id: string) => void;
  duplicateBlock: (id: string) => void;
  toggleHidden: (id: string) => void;
  updateProps: (id: string, props: BlockProps) => void;
  moveBlock: (from: number, to: number) => void;
  /** Replace every block — used when an AI draft is applied. */
  applyDraft: (blocks: BlockDraft[]) => void;
  setTheme: (patch: Partial<BuilderTheme>) => void;
  setMeta: (patch: { title?: string; slug?: string }) => void;
  undo: () => void;
  redo: () => void;
  save: () => void;
  publish: () => void;
};
