import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/app/manage")({
  component: () => <Outlet />,
});
