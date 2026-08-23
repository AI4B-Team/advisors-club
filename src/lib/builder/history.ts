// Builder Core — one undo/redo engine for every builder.

import { useCallback, useRef, useState } from "react";

const MAX_HISTORY = 50;

export type HistoryApi<T> = {
  /** Record the current value, then apply an update. */
  push: (current: T) => void;
  undo: (current: T) => T | null;
  redo: (current: T) => T | null;
  reset: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

export function useUndoRedo<T>(): HistoryApi<T> {
  const past = useRef<T[]>([]);
  const future = useRef<T[]>([]);
  const [, force] = useState(0);
  const bump = useCallback(() => force(n => n + 1), []);

  const push = useCallback((current: T) => {
    past.current = [...past.current, current].slice(-MAX_HISTORY);
    future.current = [];
    bump();
  }, [bump]);

  const undo = useCallback((current: T): T | null => {
    if (!past.current.length) return null;
    const prev = past.current[past.current.length - 1];
    past.current = past.current.slice(0, -1);
    future.current = [current, ...future.current].slice(0, MAX_HISTORY);
    bump();
    return prev;
  }, [bump]);

  const redo = useCallback((current: T): T | null => {
    if (!future.current.length) return null;
    const next = future.current[0];
    future.current = future.current.slice(1);
    past.current = [...past.current, current].slice(-MAX_HISTORY);
    bump();
    return next;
  }, [bump]);

  const reset = useCallback(() => {
    past.current = [];
    future.current = [];
    bump();
  }, [bump]);

  return {
    push, undo, redo, reset,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
  };
}
