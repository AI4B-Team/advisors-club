// Builder Core — session adapters.
//
// Both builders keep their own persistence document (Club customization vs.
// Sell pages), but expose ONE session API so the shared builder shell,
// palette, inspector, renderer and AI bar work identically on every page type.

import { useCallback, useEffect, useMemo, useState } from "react";
import { defaultDoc, getDoc, saveDoc } from "@/lib/customize/store";
import type { CustomizeDoc, PageId, WhiteLabel } from "@/lib/customize/types";
import { defaultSellDoc, findPage, getSellDoc, saveSellDoc, slugify, upsertPage } from "@/lib/sell/store";
import type { SellDoc, SellPage } from "@/lib/sell/types";
import { useUndoRedo } from "@/lib/builder/history";
import { makeBuilderBlock, move, normalizeBlocks, normalizeTheme } from "@/lib/builder/normalize";
import type { BlockDraft, BuilderSession } from "@/lib/builder/session";
import type { BuilderBlock, BuilderPage, BuilderTheme, PageTypeId } from "@/lib/builder/types";
import { pageTypeConfig } from "@/lib/builder/page-types";

const CLUB_PAGE_ID: Record<string, PageId> = {
  "club-home": "home",
  "club-community": "community",
  "club-course-home": "course-home",
  "club-member-dashboard": "member-dashboard",
  "club-public": "public-club",
};

type BlockOps = {
  page: BuilderPage;
  writeBlocks: (fn: (b: BuilderBlock[]) => BuilderBlock[]) => void;
};

/** The block operations are identical for every store — implemented once. */
function blockApi({ page, writeBlocks }: BlockOps) {
  const surface = pageTypeConfig(page.pageType).surface;
  return {
    addBlock(type: string, index?: number) {
      const block = makeBuilderBlock(type, surface);
      writeBlocks(list => {
        const next = list.slice();
        next.splice(index ?? next.length, 0, block);
        return next;
      });
      return block.id;
    },
    removeBlock(id: string) { writeBlocks(list => list.filter(b => b.id !== id)); },
    duplicateBlock(id: string) {
      writeBlocks(list => {
        const i = list.findIndex(b => b.id === id);
        if (i < 0) return list;
        const copy = { ...list[i], id: `${list[i].type}-${Math.random().toString(36).slice(2, 8)}`, props: { ...list[i].props } };
        const next = list.slice();
        next.splice(i + 1, 0, copy);
        return next;
      });
    },
    toggleHidden(id: string) { writeBlocks(list => list.map(b => b.id === id ? { ...b, hidden: !b.hidden } : b)); },
    updateProps(id: string, props: Record<string, string | number | boolean>) {
      writeBlocks(list => list.map(b => b.id === id ? { ...b, props: { ...b.props, ...props } } : b));
    },
    moveBlock(from: number, to: number) { writeBlocks(list => move(list, from, to)); },
    applyDraft(blocks: BlockDraft[]) {
      writeBlocks(() => blocks.map(b => makeBuilderBlock(b.type, surface, b.props ?? {})));
    },
  };
}

/* ============ Club customization session ============ */

export function useClubBuilder(pageType: PageTypeId): BuilderSession & {
  doc: CustomizeDoc;
  setWhiteLabel: (p: Partial<WhiteLabel>) => void;
} {
  const [doc, setDoc] = useState<CustomizeDoc>(() => defaultDoc());
  const [hydrated, setHydrated] = useState(false);
  const [dirty, setDirty] = useState(false);
  const history = useUndoRedo<CustomizeDoc>();
  const legacyId = CLUB_PAGE_ID[pageType] ?? "home";

  useEffect(() => { setDoc(getDoc()); setHydrated(true); }, []);

  const write = useCallback((fn: (d: CustomizeDoc) => CustomizeDoc, record = true) => {
    setDoc(prev => { if (record) history.push(prev); return fn(prev); });
    setDirty(true);
  }, [history]);

  const page: BuilderPage = useMemo(() => ({
    id: `club:${legacyId}`,
    pageType,
    title: pageTypeConfig(pageType).label,
    slug: "",
    blocks: normalizeBlocks(doc.pages[legacyId] as BuilderBlock[] | undefined, pageTypeConfig(pageType).surface),
    theme: normalizeTheme(doc.theme as Partial<BuilderTheme>),
    updatedAt: doc.updatedAt,
    publishedAt: doc.publishedAt,
  }), [doc, legacyId, pageType]);

  const writeBlocks = useCallback((fn: (b: BuilderBlock[]) => BuilderBlock[]) => {
    write(d => ({ ...d, pages: { ...d.pages, [legacyId]: fn(normalizeBlocks(d.pages[legacyId] as BuilderBlock[], pageTypeConfig(pageType).surface)) } as CustomizeDoc["pages"] }));
  }, [write, legacyId, pageType]);

  const ops = useMemo(() => blockApi({ page, writeBlocks }), [page, writeBlocks]);

  return {
    ...ops,
    doc,
    page,
    hydrated,
    dirty,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    setTheme: (patch) => write(d => ({ ...d, theme: { ...d.theme, ...patch } })),
    setMeta: () => {},
    setWhiteLabel: (patch) => write(d => ({ ...d, whiteLabel: { ...d.whiteLabel, ...patch } }), false),
    undo: () => setDoc(prev => history.undo(prev) ?? prev),
    redo: () => setDoc(prev => history.redo(prev) ?? prev),
    save: () => { setDoc(prev => saveDoc(prev)); setDirty(false); },
    publish: () => { setDoc(prev => saveDoc({ ...prev, publishedAt: Date.now() })); setDirty(false); },
  };
}

/* ============ Sell page session ============ */

function pageTypeForSell(p: SellPage): PageTypeId {
  if (p.surface === "club") return "club-public";
  return (p as SellPage & { pageType?: PageTypeId }).pageType === "offer" ? "offer" : "sales";
}

export function useSellBuilder(pageId: string): (BuilderSession & { doc: SellDoc; missing: boolean }) {
  const [doc, setDoc] = useState<SellDoc>(() => defaultSellDoc());
  const [hydrated, setHydrated] = useState(false);
  const [dirty, setDirty] = useState(false);
  const history = useUndoRedo<SellDoc>();

  useEffect(() => { setDoc(getSellDoc()); setHydrated(true); }, []);

  const raw = findPage(doc, pageId);

  const write = useCallback((fn: (p: SellPage) => SellPage, record = true) => {
    setDoc(prev => {
      const current = findPage(prev, pageId);
      if (!current) return prev;
      if (record) history.push(prev);
      return upsertPage(prev, fn(current));
    });
    setDirty(true);
  }, [pageId, history]);

  const pageType = raw ? pageTypeForSell(raw) : "sales";
  const surface = pageTypeConfig(pageType).surface;

  const page: BuilderPage = useMemo(() => ({
    id: raw?.id ?? pageId,
    pageType,
    title: raw?.title ?? "Page",
    slug: raw?.slug ?? "",
    blocks: normalizeBlocks(raw?.blocks as BuilderBlock[] | undefined, surface),
    theme: normalizeTheme(raw?.theme as Partial<BuilderTheme>),
    updatedAt: raw?.updatedAt ?? Date.now(),
    publishedAt: raw?.publishedAt ?? null,
  }), [raw, pageId, pageType, surface]);

  const writeBlocks = useCallback((fn: (b: BuilderBlock[]) => BuilderBlock[]) => {
    write(p => ({ ...p, blocks: fn(normalizeBlocks(p.blocks as BuilderBlock[], surface)) as SellPage["blocks"] }));
  }, [write, surface]);

  const ops = useMemo(() => blockApi({ page, writeBlocks }), [page, writeBlocks]);

  return {
    ...ops,
    doc,
    page,
    missing: hydrated && !raw,
    hydrated,
    dirty,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    setTheme: (patch) => write(p => ({ ...p, theme: { ...p.theme, ...patch } as SellPage["theme"] })),
    setMeta: (patch) => write(p => ({
      ...p,
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(patch.slug !== undefined ? { slug: slugify(patch.slug) } : {}),
    })),
    undo: () => setDoc(prev => history.undo(prev) ?? prev),
    redo: () => setDoc(prev => history.redo(prev) ?? prev),
    save: () => { setDoc(prev => saveSellDoc(prev)); setDirty(false); },
    publish: () => {
      setDoc(prev => {
        const current = findPage(prev, pageId);
        if (!current) return prev;
        return saveSellDoc(upsertPage(prev, { ...current, publishedAt: Date.now() }));
      });
      setDirty(false);
    },
  };
}

/** Read a published page for public rendering. */
export function toBuilderPage(p: SellPage): BuilderPage {
  const pageType = pageTypeForSell(p);
  return {
    id: p.id,
    pageType,
    title: p.title,
    slug: p.slug,
    blocks: normalizeBlocks(p.blocks as BuilderBlock[], pageTypeConfig(pageType).surface),
    theme: normalizeTheme(p.theme as Partial<BuilderTheme>),
    updatedAt: p.updatedAt,
    publishedAt: p.publishedAt,
  };
}
