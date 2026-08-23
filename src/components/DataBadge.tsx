// The visible half of the provenance rule: any surface rendering demo or
// sample data must say so, right next to the data.

import { FlaskConical, Info } from "lucide-react";
import { PROVENANCE_LABEL, type Provenance } from "@/lib/data/provenance";

export function DataBadge({ kind, label }: { kind: Provenance; label?: string }) {
  if (kind === "real") return null;
  return (
    <span className={`data-badge data-badge--${kind}`}>
      <FlaskConical size={11} aria-hidden />
      {label ?? PROVENANCE_LABEL[kind]}
    </span>
  );
}

export function DataNotice({
  kind,
  children,
}: {
  kind: Provenance;
  children: React.ReactNode;
}) {
  if (kind === "real") return null;
  return (
    <div className={`data-notice data-notice--${kind}`} role="note">
      <Info size={14} aria-hidden />
      <span>{children}</span>
    </div>
  );
}

// Canonical empty state now lives in components/ui/empty-state.tsx.
// Re-exported here so existing provenance call sites keep working.
export { EmptyState } from "@/components/ui/empty-state";
