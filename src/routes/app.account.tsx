import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy Account area — now part of the unified Settings control center. */
export const Route = createFileRoute("/app/account")({
  beforeLoad: () => {
    throw redirect({ to: "/app/settings/$section", params: { section: "workspace" } });
  },
});
