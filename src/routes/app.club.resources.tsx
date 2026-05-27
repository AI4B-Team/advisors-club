import { createFileRoute } from "@tanstack/react-router";
import { FolderOpen } from "lucide-react";

export const Route = createFileRoute("/app/club/resources")({
  head: () => ({ meta: [{ title: "Resources — Real Estate Empire" }] }),
  component: ResourcesPage,
});

function ResourcesPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 24, fontWeight: 700 }}>
        <FolderOpen size={22} /> Resources
      </h1>
      <p style={{ color: "#6B7280", marginTop: 8 }}>
        Library, templates, links and downloads for your members.
      </p>
    </div>
  );
}
