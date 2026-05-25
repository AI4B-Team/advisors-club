import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/club/$")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/app/club/" + (params._splat ?? "") as any });
  },
});
