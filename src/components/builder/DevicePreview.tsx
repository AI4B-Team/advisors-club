// Builder Core — the device frame every builder previews inside.

import type { ReactNode } from "react";

export type DeviceId = "desktop" | "tablet" | "mobile";

export const DEVICE_WIDTH: Record<DeviceId, number> = { desktop: 1180, tablet: 834, mobile: 390 };

export function DevicePreview({ device, children }: { device: DeviceId; children: ReactNode }) {
  return (
    <div className="cz-stage">
      <div className="cz-frame" style={{ width: DEVICE_WIDTH[device], maxWidth: "100%" }} data-device={device}>
        {children}
      </div>
    </div>
  );
}
