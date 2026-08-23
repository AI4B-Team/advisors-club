import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy Manage route — Club Navigation now lives in Settings. */
export const Route = createFileRoute("/app/manage/navigation")({
  beforeLoad: () => {
    throw redirect({ to: "/app/settings/navigation" });
  },
});
