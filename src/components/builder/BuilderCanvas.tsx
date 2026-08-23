// Builder Core — the editing canvas: device frame + the canonical page render
// with selection affordances.

import { DevicePreview, type DeviceId } from "./DevicePreview";
import { PagePreview } from "./PagePreview";
import type { BuilderPage } from "@/lib/builder/types";

export function BuilderCanvas({
  page, device, selectedId, onSelect,
}: {
  page: BuilderPage;
  device: DeviceId;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div className="cz-canvas-wrap" onClick={() => onSelect(null)}>
      <DevicePreview device={device}>
        <PagePreview page={page} selectedId={selectedId} onSelect={onSelect} interactive />
      </DevicePreview>
    </div>
  );
}
