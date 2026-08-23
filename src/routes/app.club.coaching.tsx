import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Users, GitBranch, FileText, Trophy, Video, Target, ListChecks } from "lucide-react";
import { useCoaching } from "@/hooks/use-coaching";
import { useViewMode } from "@/hooks/use-view-mode";
import type { Client } from "@/lib/coaching/types";
import { CoachingClients } from "@/components/coaching/CoachingClients";
import { CoachingPipeline } from "@/components/coaching/CoachingPipeline";
import { CoachingIntakes } from "@/components/coaching/CoachingIntakes";
import { CoachingPrograms } from "@/components/coaching/CoachingPrograms";
import { CoachingSessions } from "@/components/coaching/CoachingSessions";
import { CoachingGoals } from "@/components/coaching/CoachingGoals";
import { CoachingAccountability } from "@/components/coaching/CoachingAccountability";
import { ClientProfileDrawer } from "@/components/coaching/ClientProfileDrawer";
import { MemberCoaching } from "@/components/coaching/MemberCoaching";
import { PageHeader } from "@/components/ui/page-header";

export const Route = createFileRoute("/app/club/coaching")({
  head: () => ({
    meta: [
      { title: "Coaching — AdvisorsClub" },
      { name: "description", content: "Run your coaching business: clients, pipeline, intakes, programs, sessions, goals, and accountability." },
      { property: "og:title", content: "Coaching — AdvisorsClub" },
      { property: "og:description", content: "Run your coaching business: clients, pipeline, intakes, programs, sessions, goals, and accountability." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CoachingPage,
});

type TabId = "clients" | "pipeline" | "intakes" | "programs" | "sessions" | "goals" | "accountability";

const TABS: { id: TabId; label: string; icon: typeof Users }[] = [
  { id: "clients", label: "Clients", icon: Users },
  { id: "pipeline", label: "Pipeline", icon: GitBranch },
  { id: "intakes", label: "Intakes", icon: FileText },
  { id: "programs", label: "Programs", icon: Trophy },
  { id: "sessions", label: "Sessions", icon: Video },
  { id: "goals", label: "Goals", icon: Target },
  { id: "accountability", label: "Accountability", icon: ListChecks },
];

function CoachingPage() {
  const api = useCoaching();
  const { isAdmin } = useViewMode();
  const [tab, setTab] = useState<TabId>("clients");
  const [openId, setOpenId] = useState<string | null>(null);

  const openClient: Client | null = openId ? api.doc.clients.find(c => c.id === openId) ?? null : null;
  const onOpen = (c: Client) => setOpenId(c.id);

  if (!isAdmin) {
    return <div className="coach-shell">{api.hydrated ? <MemberCoaching api={api} /> : null}</div>;
  }

  return (
    <div className="coach-shell">
      <PageHeader
        title="Coaching"
        description="Your Coaching Business — Clients, Pipeline, Sessions, Goals, And Accountability In One Place."
      />

      <nav className="coach-tabs" aria-label="Coaching sections">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} className={tab === t.id ? "is-on" : ""} onClick={() => setTab(t.id)}>
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </nav>

      {api.hydrated && (
        <div className="coach-tabpane">
          {tab === "clients" && <CoachingClients api={api} onOpen={onOpen} />}
          {tab === "pipeline" && <CoachingPipeline api={api} onOpen={onOpen} />}
          {tab === "intakes" && <CoachingIntakes api={api} />}
          {tab === "programs" && <CoachingPrograms api={api} />}
          {tab === "sessions" && <CoachingSessions api={api} />}
          {tab === "goals" && <CoachingGoals api={api} onOpen={onOpen} />}
          {tab === "accountability" && <CoachingAccountability api={api} onOpen={onOpen} />}
        </div>
      )}

      {openClient && <ClientProfileDrawer api={api} client={openClient} onClose={() => setOpenId(null)} />}
    </div>
  );
}
