import { Eye, Pin } from "lucide-react";
import type { PanelKey } from "@/lib/settings/config";
import {
  ProfilePanel, AudiencePanel, ContentPanel, PaywallsPanel, AffiliatesPanel,
  PlansPanel, PayoutsPanel, NotificationsPanel, ChatPanel, PaymentMethodsPanel,
  PaymentHistoryPanel, AnalyticsPanel, SitePanel, DevelopersPanel, SettingsPanel,
  SiteBuilderPanel, CustomizeThemePanel, PanelHead,
} from "@/components/account-panels";

/** Clubs / Workspaces — moved out of the old Account sidebar. */
function ClubsPanel() {
  return (
    <div className="ap">
      <PanelHead title="Clubs & Workspaces" sub="Reorder, Pin To Sidebar, Or Hide." />
      <div className="ap-card">
        <ClubRow color="#F5A623" letter="R" name="Real Estate Empire" meta="847 Members · Pro" />
        <ClubRow color="#6366F1" letter="A" name="AIVA Builders" meta="2.1k Members · Free" />
      </div>
    </div>
  );
}

function ClubRow({ color, letter, name, meta }: { color: string; letter: string; name: string; meta: string }) {
  return (
    <div className="acct-comm">
      <span className="acct-comm-av" style={{ background: color }}>{letter}</span>
      <div className="acct-comm-t">
        <div className="acct-comm-n">{name}</div>
        <div className="acct-comm-m">{meta}</div>
      </div>
      <button className="acct-comm-icon" aria-label="Hide"><Eye size={18} /></button>
      <button className="acct-comm-icon" aria-label="Pin"><Pin size={18} /></button>
    </div>
  );
}

/** Billing details — company, address, tax. */
function BillingDetailsPanel() {
  return (
    <div className="ap">
      <PanelHead title="Billing Details" sub="Appears On Every Invoice." />
      <div className="ap-card">
        <div className="ap-grid-2">
          <Row label="Billing Name" value="Advisors Club LLC" />
          <Row label="Billing Email" value="billing@advisorsclub.com" />
          <Row label="Address" value="1200 Market St, Suite 400" />
          <Row label="City / State" value="Austin, TX 78701" />
          <Row label="Country" value="United States" />
          <Row label="Tax ID / VAT" value="—" />
        </div>
      </div>
    </div>
  );
}

/** Language, theme and shortcuts — personal, not a sidebar item. */
function PersonalPreferencesPanel() {
  return (
    <div className="ap">
      <PanelHead title="Language, Theme & Shortcuts" sub="Personal Interface Preferences." />
      <div className="ap-card">
        <div className="ap-list-row">
          <div><div className="ap-list-t">Language</div><div className="ap-list-s">Interface Language For Your Account</div></div>
          <button className="ap-btn-light">English (US)</button>
        </div>
        <div className="ap-list-row">
          <div><div className="ap-list-t">Theme</div><div className="ap-list-s">Light Or Dark Appearance</div></div>
          <button
            className="ap-btn-light"
            onClick={() => window.dispatchEvent(new CustomEvent("cc:toggle-theme"))}
          >Switch To Light Mode</button>
        </div>
        <div className="ap-list-row">
          <div><div className="ap-list-t">Keyboard Shortcuts</div><div className="ap-list-s">Open The Shortcut Reference (⌘K Opens AI)</div></div>
          <button
            className="ap-btn-light"
            onClick={() => window.dispatchEvent(new CustomEvent("cc:shortcuts"))}
          >View Shortcuts</button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <label className="ap-field">
      <span>{label}</span>
      <input defaultValue={value} />
    </label>
  );
}

export const PANELS: Record<PanelKey, () => JSX.Element> = {
  clubs: ClubsPanel,
  profile: ProfilePanel,
  members: AudiencePanel,
  content: ContentPanel,
  site: SitePanel,
  "site-builder": SiteBuilderPanel,
  theme: CustomizeThemePanel,
  plans: PlansPanel,
  paywalls: PaywallsPanel,
  affiliates: AffiliatesPanel,
  payouts: PayoutsPanel,
  analytics: AnalyticsPanel,
  "payment-methods": PaymentMethodsPanel,
  "payment-history": PaymentHistoryPanel,
  "billing-details": BillingDetailsPanel,
  notifications: NotificationsPanel,
  chat: ChatPanel,
  "personal-preferences": PersonalPreferencesPanel,
  developers: DevelopersPanel,
  system: SettingsPanel,
};
