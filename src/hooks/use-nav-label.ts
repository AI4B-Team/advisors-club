import { useEffect, useState } from "react";
import { getNavConfig, subscribeNav } from "@/lib/nav/store";

/**
 * Resolve the creator's customized navigation label for a nav item id.
 * Member-facing UI must never hard-code labels like "Apps" — a creator can
 * rename that item to "Tools", "Deal Tools", "Calculators", etc.
 */
export function useNavLabel(id: string, fallback: string): string {
  const read = () => getNavConfig().items.find(i => i.id === id)?.label || fallback;
  const [label, setLabel] = useState(fallback);
  useEffect(() => {
    setLabel(read());
    return subscribeNav(() => setLabel(read()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, fallback]);
  return label;
}
