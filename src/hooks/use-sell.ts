import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  defaultSellDoc, findPage, getSellDoc, makeSellBlock, move, saveSellDoc, subscribeSell, upsertPage,
} from "@/lib/sell/store";
import type { SellBlock, SellDoc, SellPage, SellTheme } from "@/lib/sell/types";

const MAX_HISTORY = 50;

/** Whole-document access — used by the Sell hub and funnels. */
export function useSellDoc() {
  const [doc, setDoc] = useState<SellDoc>(() => defaultSellDoc());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDoc(getSellDoc());
    setHydrated(true);
    return subscribeSell(setDoc);
  }, []);

  const update = useCallback((fn: (d: SellDoc) => SellDoc) => {
    setDoc(prev => saveSellDoc(fn(prev)));
  }, []);

  return { doc, hydrated, update };
}

/** Single-page editing session with undo/redo, for the builder route. */
export function useSellPage(pageId: string) {
  const [doc, setDoc] = useState<SellDoc>(() => defaultSellDoc());
  const [hydrated, setHydrated] = useState(false);
  const [dirty, setDirty] = useState(false);
  const past = useRef<SellPage[]>([]);
  const future = useRef<SellPage[]>([]);
  const [, force] = useState(0);

  useEffect(() => {
    setDoc(getSellDoc());
    setHydrated(true);
  }, []);

  const page = findPage(doc, pageId);

  const write = useCallback((fn: (p: SellPage) => SellPage, record = true) => {
    setDoc(prev => {
      const current = findPage(prev, pageId);
      if (!current) return prev;
      if (record) {
        past.current = [...past.current, current].slice(-MAX_HISTORY);
        future.current = [];
      }
      return upsertPage(prev, fn(current));
    });
    setDirty(true);
    force(n => n + 1);
  }, [pageId]);

  const api = useMemo(() => ({
    addBlock(type: string, index?: number) {
      const block = makeSellBlock(type);
      write(p => {
        const blocks = p.blocks.slice();
        blocks.splice(index ?? blocks.length, 0, block);
        return { ...p, blocks };
      });
      return block.id;
    },
    removeBlock(id: string) { write(p => ({ ...p, blocks: p.blocks.filter(b => b.id !== id) })); },
    duplicateBlock(id: string) {
      write(p => {
        const i = p.blocks.findIndex(b => b.id === id);
        if (i < 0) return p;
        const copy: SellBlock = { ...p.blocks[i], id: `${p.blocks[i].type}-${Math.random().toString(36).slice(2, 8)}`, props: { ...p.blocks[i].props } };
        const blocks = p.blocks.slice();
        blocks.splice(i + 1, 0, copy);
        return { ...p, blocks };
      });
    },
    toggleHidden(id: string) { write(p => ({ ...p, blocks: p.blocks.map(b => b.id === id ? { ...b, hidden: !b.hidden } : b) })); },
    updateProps(id: string, props: Record<string, string | number | boolean>) {
      write(p => ({ ...p, blocks: p.blocks.map(b => b.id === id ? { ...b, props: { ...b.props, ...props } } : b) }));
    },
    moveBlock(from: number, to: number) { write(p => ({ ...p, blocks: move(p.blocks, from, to) })); },
    setTheme(patch: Partial<SellTheme>) { write(p => ({ ...p, theme: { ...p.theme, ...patch } })); },
    setMeta(patch: Partial<Pick<SellPage, "title" | "slug">>) { write(p => ({ ...p, ...patch })); },
    applyDraft(blocks: { type: string; props: Record<string, string> }[]) {
      write(p => ({ ...p, blocks: blocks.map(b => makeSellBlock(b.type, b.props)) }));
    },
  }), [write]);

  const undo = useCallback(() => {
    if (!past.current.length) return;
    setDoc(prev => {
      const current = findPage(prev, pageId);
      const prevPage = past.current[past.current.length - 1];
      past.current = past.current.slice(0, -1);
      if (current) future.current = [current, ...future.current].slice(0, MAX_HISTORY);
      return upsertPage(prev, prevPage);
    });
    setDirty(true);
    force(n => n + 1);
  }, [pageId]);

  const redo = useCallback(() => {
    if (!future.current.length) return;
    setDoc(prev => {
      const current = findPage(prev, pageId);
      const nextPage = future.current[0];
      future.current = future.current.slice(1);
      if (current) past.current = [...past.current, current].slice(-MAX_HISTORY);
      return upsertPage(prev, nextPage);
    });
    setDirty(true);
    force(n => n + 1);
  }, [pageId]);

  const save = useCallback(() => { setDoc(prev => saveSellDoc(prev)); setDirty(false); }, []);

  const publish = useCallback(() => {
    setDoc(prev => {
      const current = findPage(prev, pageId);
      if (!current) return prev;
      return saveSellDoc(upsertPage(prev, { ...current, publishedAt: Date.now() }));
    });
    setDirty(false);
  }, [pageId]);

  return {
    doc, page, hydrated, dirty,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
    ...api, undo, redo, save, publish,
  };
}
