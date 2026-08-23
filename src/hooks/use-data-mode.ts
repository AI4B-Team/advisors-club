import { useEffect, useState } from "react";
import { subscribeActiveClub } from "@/lib/clubs/context";
import { activeClub } from "@/lib/clubs/context";
import { demoMode, subscribeDemoMode, type DemoMode } from "@/lib/data/provenance";

/**
 * Is this workspace allowed to show demo fixtures? Every surface that has
 * fixtures asks here first, and labels whatever it renders.
 */
export function useDataMode(): DemoMode {
  const [mode, setMode] = useState<DemoMode>(() => ({ enabled: false, reason: null }));

  useEffect(() => {
    const read = () => setMode(demoMode({ clubIsDemo: activeClub()?.isDemo }));
    read();
    const a = subscribeActiveClub(read);
    const b = subscribeDemoMode(read);
    return () => { a(); b(); };
  }, []);

  return mode;
}
