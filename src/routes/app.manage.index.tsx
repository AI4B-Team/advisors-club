import { createFileRoute, redirect } from "@tanstack/react-router";

/** The standalone Manage hub folded into Settings. */
export const Route = createFileRoute("/app/manage/")({
  beforeLoad: () => {
    throw redirect({ to: "/app/settings/$section", params: { section: "workspace" } });
  },
});
