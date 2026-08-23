import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy Manage route — AI Persona now lives in Settings. */
export const Route = createFileRoute("/app/manage/persona")({
  beforeLoad: () => {
    throw redirect({ to: "/app/settings/ai-persona" });
  },
});
