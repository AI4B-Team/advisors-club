import { createFileRoute, Outlet } from "@tanstack/react-router";

/** Single-app layout — the runner and the builder are its children. */
export const Route = createFileRoute("/app/apps/$appId")({
  component: () => <Outlet />,
});
