import { useCallback, useEffect, useState } from "react";
import {
  getMemberOnboarding, getMoAnswers, setMoAnswers, setMoConfig, resetMoAnswers,
  subscribeMemberOnboarding, type MoAnswers, type MoConfig, type MoDoc,
} from "@/lib/member-onboarding";

function useDoc(): MoDoc {
  const [doc, setDoc] = useState<MoDoc>(() => getMemberOnboarding());
  useEffect(() => {
    setDoc(getMemberOnboarding());
    return subscribeMemberOnboarding(() => setDoc({ ...getMemberOnboarding() }));
  }, []);
  return doc;
}

/** Admin-side editor for the member onboarding questions. */
export function useMemberOnboardingConfig() {
  const doc = useDoc();
  const update = useCallback((patch: Partial<MoConfig>) => { setMoConfig(patch); }, []);
  return { config: doc.config, update };
}

/** Member-side state: answers + whether the flow should be shown. */
export function useMemberOnboarding(memberId: string) {
  const doc = useDoc();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const answers: MoAnswers = doc.members[memberId] ?? getMoAnswers(memberId);
  const done = Boolean(answers.completedAt) || answers.skipped;
  const shouldShow = hydrated && doc.config.enabled && !done;

  const save = useCallback((patch: Partial<MoAnswers>) => { setMoAnswers(memberId, patch); }, [memberId]);
  const complete = useCallback((patch: Partial<MoAnswers>) => {
    setMoAnswers(memberId, { ...patch, completedAt: Date.now(), skipped: false });
  }, [memberId]);
  const skip = useCallback(() => { setMoAnswers(memberId, { skipped: true }); }, [memberId]);
  const reset = useCallback(() => { resetMoAnswers(memberId); }, [memberId]);

  return { config: doc.config, answers, shouldShow, done, save, complete, skip, reset };
}
