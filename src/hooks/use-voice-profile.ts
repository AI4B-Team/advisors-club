import { useCallback, useEffect, useState } from "react";
import { getVoiceProfile, setVoiceProfile, subscribeVoiceProfile, type VoiceProfile } from "@/lib/persona/voice";

/** Read the Voice Profile for a persona (multi-persona ready). */
export function useVoiceProfile(personaId = "primary"): VoiceProfile {
  const [v, setV] = useState<VoiceProfile>(() => getVoiceProfile(personaId));
  useEffect(() => {
    setV(getVoiceProfile(personaId));
    return subscribeVoiceProfile(() => setV(getVoiceProfile(personaId)));
  }, [personaId]);
  return v;
}

export function useVoiceEditor(personaId = "primary") {
  const voice = useVoiceProfile(personaId);
  const update = useCallback(
    (patch: Partial<VoiceProfile>) => { setVoiceProfile(patch, personaId); },
    [personaId],
  );
  return { voice, update };
}
