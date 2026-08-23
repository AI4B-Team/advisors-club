import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  AM_TABS, AM_SETTINGS_KEYS, AM_LEGACY_TAB, AM_LEGACY_SUB,
  type AmPrimaryKey, type AmSettingsKey,
} from "@/components/aiva/tabs";
import { AivaChat } from "@/components/aiva/AivaChat";
import { AivaSettings } from "@/components/aiva/AivaSettings";
import { OpportunityBoard } from "@/components/aiva/OpportunityBoard";
import { AivaActivityFeed } from "@/components/aiva/activity/AivaActivityFeed";
import { useAivaAdmin } from "@/hooks/use-aiva-admin";

export const Route = createFileRoute("/app/aiva")({
  head: () => ({
    meta: [
      { title: "AIVA — Your AI Business Operator" },
      { name: "description", content: "Chat with AIVA, review what it has been doing, act on opportunities, and tune how independently it works." },
      { property: "og:title", content: "AIVA — Your AI Business Operator" },
      { property: "og:description", content: "One intelligent assistant that knows your business, your content, and your members." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
    sub: typeof search.sub === "string" ? search.sub : undefined,
  }),
  component: AivaArea,
});

/** Resolve current and legacy links into the four-concept model. */
function resolveEntry(tab?: string, sub?: string): { tab: AmPrimaryKey; sub: AmSettingsKey | null } {
  const mapped = tab ? AM_LEGACY_TAB[tab] : undefined;
  const primary: AmPrimaryKey = mapped?.tab
    ?? (AM_TABS.some(t => t.key === tab) ? (tab as AmPrimaryKey) : "chat");

  let settings: AmSettingsKey | null = mapped?.sub ?? null;
  if (sub) {
    if ((AM_SETTINGS_KEYS as string[]).includes(sub)) settings = sub as AmSettingsKey;
    else if (AM_LEGACY_SUB[sub]) settings = AM_LEGACY_SUB[sub];
  }
  return { tab: settings ? "settings" : primary, sub: settings };
}

function AivaArea() {
  const search = Route.useSearch();
  const entry = resolveEntry(search.tab, search.sub);
  const [tab, setTab] = useState<AmPrimaryKey>(entry.tab);
  const [sub, setSub] = useState<AmSettingsKey | null>(entry.sub);
  const { admin, update } = useAivaAdmin();

  function open(next: AmPrimaryKey, key?: AmSettingsKey) {
    setTab(next);
    setSub(next === "settings" ? key ?? null : null);
  }

  return (
    <div className="aiva-area">
      <div className="lt-ph">
        <div>
          <h1>AIVA</h1>
          <p>Your AI Business Operator.</p>
        </div>
      </div>

      <nav className="am-tabs" aria-label="AIVA Sections">
        {AM_TABS.map(t => (
          <button
            key={t.key}
            type="button"
            className={`am-tab${tab === t.key ? " on" : ""}`}
            onClick={() => open(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "chat" && <AivaChat onOpen={open} />}
      {tab === "opportunities" && <OpportunityBoard />}
      {tab === "activity" && (
        <AivaActivityFeed
          legacy={admin.activity}
          onGoInternal={(view, s) => {
            if (view === "create" || view === "settings") open("settings", (s as AmSettingsKey) ?? undefined);
            else open(view as AmPrimaryKey);
          }}
        />
      )}
      {tab === "settings" && (
        <AivaSettings admin={admin} update={update} open={sub} onOpen={setSub} />
      )}
    </div>
  );
}
