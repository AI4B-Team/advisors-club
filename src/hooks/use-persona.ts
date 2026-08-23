import { useCallback, useEffect, useState } from "react";
import { getPersona, setPersona, subscribePersona } from "@/lib/persona/store";
import type { PersonaSettings } from "@/lib/persona/types";

/** Member view of the AI Persona configuration. */
export function usePersona(): PersonaSettings {
  const [s, setS] = useState<PersonaSettings>(() => getPersona());
  useEffect(() => {
    setS(getPersona());
    return subscribePersona(setS);
  }, []);
  return s;
}

/** Admin editor. */
export function usePersonaEditor() {
  const persona = usePersona();
  const update = useCallback((patch: Partial<PersonaSettings>) => { setPersona(patch); }, []);
  return { persona, update };
}
