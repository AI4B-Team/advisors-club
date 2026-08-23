import { createFileRoute, redirect } from "@tanstack/react-router";

/** Club configuration now lives in the unified Settings area. */
export const Route = createFileRoute("/app/club/settings")({
  beforeLoad: () => {
    throw redirect({ to: "/app/settings" });
  },
});
