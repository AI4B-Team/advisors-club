import { useCallback, useEffect, useState } from "react";
import { type AivaAdmin, getAivaAdmin, setAivaAdmin, subscribeAivaAdmin } from "@/lib/aiva-admin";

export function useAivaAdmin() {
  const [state, setState] = useState<AivaAdmin>(() => getAivaAdmin());

  useEffect(() => {
    setState(getAivaAdmin());
    return subscribeAivaAdmin(setState);
  }, []);

  const update = useCallback((partial: Partial<AivaAdmin>) => {
    setState(setAivaAdmin(partial));
  }, []);

  return { admin: state, update };
}
