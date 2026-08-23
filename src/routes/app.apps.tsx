import { createFileRoute, Outlet } from "@tanstack/react-router";

/** Apps section layout — children own their own metadata and UI. */
export const Route = createFileRoute("/app/apps")({
  component: () => <Outlet />,
});
