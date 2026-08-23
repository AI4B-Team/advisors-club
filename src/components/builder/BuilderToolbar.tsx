// Builder Core — the shared builder toolbar (device switcher, undo/redo,
// preview, save, publish). Page-type differences are labels only.

import type { ReactNode } from "react";
import { Monitor, Tablet, Smartphone, Undo2, Redo2, ExternalLink, Check, Loader2 } from "lucide-react";
import type { DeviceId } from "./DevicePreview";
import type { BuilderSession } from "@/lib/builder/session";
import { pageTypeConfig } from "@/lib/builder/page-types";

const DEVICES: { id: DeviceId; icon: typeof Monitor; label: string }[] = [
  { id: "desktop", icon: Monitor, label: "Desktop" },
  { id: "tablet", icon: Tablet, label: "Tablet" },
  { id: "mobile", icon: Smartphone, label: "Mobile" },
];

export function BuilderToolbar({
  session, device, onDevice, left, saving, onPreview,
}: {
  session: BuilderSession;
  device: DeviceId;
  onDevice: (d: DeviceId) => void;
  left?: ReactNode;
  saving?: boolean;
  onPreview?: () => void;
}) {
  const cfg = pageTypeConfig(session.page.pageType);
  return (
    <header className="cz-top">
      <div className="cz-top-l">{left}</div>

      <div className="cz-top-c"><div className="cz-devices" role="group" aria-label="Device Preview">
        {DEVICES.map(d => (
          <button
            key={d.id}
            type="button"
            className={device === d.id ? "on" : ""}
            onClick={() => onDevice(d.id)}
            aria-label={d.label}
            aria-pressed={device === d.id}
          >
            <d.icon size={14} />
          </button>
        ))}
      </div></div>

      <div className="cz-top-r">
        <button type="button" className="cz-icon-btn" onClick={session.undo} disabled={!session.canUndo} aria-label="Undo">
          <Undo2 size={15} />
        </button>
        <button type="button" className="cz-icon-btn" onClick={session.redo} disabled={!session.canRedo} aria-label="Redo">
          <Redo2 size={15} />
        </button>
        <span className="cz-save-state">
          {saving ? <><Loader2 size={12} className="cz-spin" /> Saving</> : session.dirty ? "Unsaved Changes" : <><Check size={12} /> Saved</>}
        </span>
        {onPreview ? (
          <button type="button" className="cz-ghost-btn" onClick={onPreview}>
            <ExternalLink size={14} /> Preview
          </button>
        ) : null}
        <button type="button" className="cz-publish" onClick={session.publish}>
          {cfg.publish.label}
        </button>
      </div>
    </header>
  );
}
