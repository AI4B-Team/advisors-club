import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { defaultDoc, getDoc, makeBlock, move, saveDoc } from "@/lib/customize/store";
import type { Block, CustomizeDoc, PageId, Theme, WhiteLabel } from "@/lib/customize/types";

const MAX_HISTORY = 50;

export function useCustomize(page: PageId) {
  const [doc, setDoc] = useState<CustomizeDoc>(() => defaultDoc());
  const [dirty, setDirty] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const past = useRef<CustomizeDoc[]>([]);
  const future = useRef<CustomizeDoc[]>([]);
  const [, force] = useState(0);

  useEffect(() => {
    setDoc(getDoc());
    setHydrated(true);
  }, []);

  const commit = useCallback((next: CustomizeDoc, options?: { silent?: boolean }) => {
    setDoc(prev => {
      if (!options?.silent) {
        past.current = [...past.current, prev].slice(-MAX_HISTORY);
        future.current = [];
      }
      return next;
    });
    setDirty(true);
    force(n => n + 1);
  }, []);

  const setBlocks = useCallback((updater: (blocks: Block[]) => Block[]) => {
    setDoc(prev => {
      past.current = [...past.current, prev].slice(-MAX_HISTORY);
      future.current = [];
      return { ...prev, pages: { ...prev.pages, [page]: updater(prev.pages[page] ?? []) } };
    });
    setDirty(true);
    force(n => n + 1);
  }, [page]);

  const blocks = doc.pages[page] ?? [];

  const api = useMemo(() => ({
    addBlock(type: string, index?: number) {
      const block = makeBlock(type);
      setBlocks(list => {
        const next = list.slice();
        next.splice(index ?? next.length, 0, block);
        return next;
      });
      return block.id;
    },
    removeBlock(id: string) { setBlocks(list => list.filter(b => b.id !== id)); },
    duplicateBlock(id: string) {
      setBlocks(list => {
        const i = list.findIndex(b => b.id === id);
        if (i < 0) return list;
        const copy: Block = { ...list[i], id: `${list[i].type}-${Math.random().toString(36).slice(2, 8)}`, props: { ...list[i].props } };
        const next = list.slice();
        next.splice(i + 1, 0, copy);
        return next;
      });
    },
    toggleHidden(id: string) { setBlocks(list => list.map(b => b.id === id ? { ...b, hidden: !b.hidden } : b)); },
    updateProps(id: string, props: Record<string, string | number | boolean>) {
      setBlocks(list => list.map(b => b.id === id ? { ...b, props: { ...b.props, ...props } } : b));
    },
    moveBlock(from: number, to: number) { setBlocks(list => move(list, from, to)); },
    replaceBlocks(types: string[]) { setBlocks(() => types.map(t => makeBlock(t))); },
  }), [setBlocks]);

  const setTheme = useCallback((patch: Partial<Theme>) => {
    setDoc(prev => {
      past.current = [...past.current, prev].slice(-MAX_HISTORY);
      future.current = [];
      return { ...prev, theme: { ...prev.theme, ...patch } };
    });
    setDirty(true);
    force(n => n + 1);
  }, []);

  const setWhiteLabel = useCallback((patch: Partial<WhiteLabel>) => {
    setDoc(prev => ({ ...prev, whiteLabel: { ...prev.whiteLabel, ...patch } }));
    setDirty(true);
  }, []);

  const undo = useCallback(() => {
    if (!past.current.length) return;
    setDoc(prev => {
      const prevDoc = past.current[past.current.length - 1];
      past.current = past.current.slice(0, -1);
      future.current = [prev, ...future.current].slice(0, MAX_HISTORY);
      return prevDoc;
    });
    setDirty(true);
    force(n => n + 1);
  }, []);

  const redo = useCallback(() => {
    if (!future.current.length) return;
    setDoc(prev => {
      const nextDoc = future.current[0];
      future.current = future.current.slice(1);
      past.current = [...past.current, prev].slice(-MAX_HISTORY);
      return nextDoc;
    });
    setDirty(true);
    force(n => n + 1);
  }, []);

  const save = useCallback(() => {
    setDoc(prev => saveDoc(prev));
    setDirty(false);
  }, []);

  const publish = useCallback(() => {
    setDoc(prev => saveDoc({ ...prev, publishedAt: Date.now() }));
    setDirty(false);
  }, []);

  return {
    doc, blocks, hydrated, dirty,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
    ...api,
    setTheme, setWhiteLabel, undo, redo, save, publish, commit,
  };
}
