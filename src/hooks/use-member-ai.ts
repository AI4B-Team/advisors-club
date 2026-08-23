import { useCallback, useEffect, useState } from "react";
import { getMemberAi, setMemberAi, subscribeMemberAi, type MemberAiSettings } from "@/lib/member-ai";

/** Read-only member view of the assistant settings. */
export function useMemberAi(): MemberAiSettings {
  const [s, setS] = useState<MemberAiSettings>(() => getMemberAi());
  useEffect(() => {
    setS(getMemberAi());
    return subscribeMemberAi(setS);
  }, []);
  return s;
}

/** Admin editor. */
export function useMemberAiEditor() {
  const settings = useMemberAi();
  const update = useCallback((patch: Partial<MemberAiSettings>) => { setMemberAi(patch); }, []);
  return { settings, update };
}
