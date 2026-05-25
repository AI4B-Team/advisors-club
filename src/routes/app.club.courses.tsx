import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { ClubStub } from "@/components/ClubStub";

export const Route = createFileRoute("/app/club/courses")({
  head: () => ({ meta: [{ title: "Courses — AdvisorsClub" }, { name: "description", content: "Deliver video courses with progress tracking and certificates." }] }),
  component: () => (
    <ClubStub
      icon={<BookOpen size={26}/>}
      title="Courses"
      blurb="Course grid with progress bars, native video player, module accordions, AIVA-built outlines, and completion certificates."
      features={["Course grid","Mux video","Module accordion","AIVA builder","Drip content","Certificates"]}
    />
  ),
});
