import { Plus } from "lucide-react";
import { useViewMode } from "@/hooks/use-view-mode";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { AiPromptBar } from "@/components/ui/ai-prompt-bar";

/**
 * Placeholder surface for content areas that have no items yet.
 *
 * Simplification pass: one heading, one primary action, and — for admins only —
 * the AI build panel. Members never see the machinery used to create content.
 */
export function ClubStub({
  icon, title, blurb, features, noun = "item", aivaPrompts,
}: {
  icon: React.ReactNode;
  title: string;
  blurb: string;
  /** Kept for callers; surfaced as quiet supporting copy rather than badge rows. */
  features?: string[];
  noun?: string;
  aivaPrompts?: string[];
}) {
  const { isAdmin, viewAs } = useViewMode();
  const adminView = isAdmin && !viewAs;
  const prompts = aivaPrompts ?? [
    `Generate my first ${noun} from scratch`,
    `Suggest 3 ${noun} ideas for my audience`,
    `Turn my last post into a ${noun}`,
  ];

  if (!adminView) {
    return (
      <EmptyState
        icon={icon}
        title="Nothing Here Yet"
        body={`New ${noun}s will show up here as soon as they're published.`}
      />
    );
  }

  return (
    <>
      <PageHeader
        title={title}
        description={blurb}
        actions={<button className="btn-ghost"><Plus size={14}/> Create Manually</button>}
      />

      <AiPromptBar
        placeholder={`Describe the ${noun} you want AI to build…`}
        suggestions={prompts}
      />

    </>
  );
}
