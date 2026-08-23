import { useCallback, useEffect, useState } from "react";
import { defaultSellDoc, getSellDoc, saveSellDoc, subscribeSell } from "@/lib/sell/store";
import type { SellDoc } from "@/lib/sell/types";

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
