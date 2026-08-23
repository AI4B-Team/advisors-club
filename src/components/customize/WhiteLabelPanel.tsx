// Club-only builder panel: custom domain + white label. Mounted into the
// shared builder shell as a page-type-specific panel.

import { Globe } from "lucide-react";
import type { WhiteLabel } from "@/lib/customize/types";

export function WhiteLabelPanel({ wl, onChange }: { wl: WhiteLabel; onChange: (p: Partial<WhiteLabel>) => void }) {
  return (
    <div className="cz-panel-body">
      <div className="cz-lp-label"><Globe size={12} /> Custom Domain</div>
      <label className="cz-field"><span>Domain</span>
        <input value={wl.customDomain} onChange={e => onChange({ customDomain: e.target.value })} placeholder="club.yourdomain.com" />
      </label>
      <div className={`cz-domain-state${wl.domainVerified ? " ok" : ""}`}>
        {wl.customDomain
          ? (wl.domainVerified ? "Domain Verified — Members Load Your Club At This Address." : "Pending DNS Verification. Point A CNAME To advisorsclub.app, Then Verify.")
          : "No Custom Domain Connected Yet."}
      </div>
      <button type="button" className="cz-ghost" disabled={!wl.customDomain} onClick={() => onChange({ domainVerified: !wl.domainVerified })}>
        {wl.domainVerified ? "Re-Check DNS" : "Verify Domain"}
      </button>

      <div className="cz-lp-label">White Label</div>
      <label className="cz-field row"><span>Hide Platform Branding</span>
        <button type="button" className={`cz-switch${wl.hidePlatformBranding ? " on" : ""}`} onClick={() => onChange({ hidePlatformBranding: !wl.hidePlatformBranding })}><i /></button>
      </label>
      <label className="cz-field"><span>Favicon URL</span>
        <input value={wl.faviconUrl} onChange={e => onChange({ faviconUrl: e.target.value })} placeholder="https://…" />
      </label>
      <label className="cz-field"><span>Email From Name</span>
        <input value={wl.emailFromName} onChange={e => onChange({ emailFromName: e.target.value })} placeholder="Your Club" />
      </label>
      <label className="cz-field"><span>Support Email</span>
        <input value={wl.supportEmail} onChange={e => onChange({ supportEmail: e.target.value })} placeholder="support@yourdomain.com" />
      </label>
      <p className="cz-note">Availability Depends On Your Current Plan. Nothing Here Changes Your Plan Or Billing.</p>
    </div>
  );
}
