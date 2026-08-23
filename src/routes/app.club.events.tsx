import { createFileRoute, redirect } from "@tanstack/react-router";

/** Events is now served by the Calendar experience. */
export const Route = createFileRoute("/app/club/events")({
  beforeLoad: () => {
    throw redirect({ to: "/app/calendar" });
  },
});
