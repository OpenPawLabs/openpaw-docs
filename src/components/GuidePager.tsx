import { cn } from "@heroui/react";
import { Link as RouterLink } from "react-router-dom";
import type { ProjectEntry } from "../catalog/types";
import { getGuideNavigation, type GuideNavLink } from "../lib/guides/navigation";

interface GuidePagerProps {
  project: ProjectEntry;
  currentSlug: string;
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden
      className={cn("size-4 shrink-0", direction === "left" ? "" : "rotate-180")}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M15 5l-7 7 7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PagerLink({
  projectId,
  link,
  direction,
}: {
  projectId: string;
  link: GuideNavLink;
  direction: "prev" | "next";
}) {
  const isPrev = direction === "prev";
  return (
    <RouterLink
      className={cn(
        "group flex flex-1 items-center gap-3 rounded-xl border border-default-200 bg-surface p-4 outline-none transition-colors hover:border-primary-300 hover:bg-primary-50 focus-visible:ring-2 focus-visible:ring-primary-300",
        isPrev ? "text-left" : "flex-row-reverse text-right",
      )}
      to={`/projects/${projectId}/${link.slug}`}
    >
      <span className="text-default-400 transition-colors group-hover:text-primary">
        <ArrowIcon direction={isPrev ? "left" : "right"} />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-medium uppercase tracking-wide text-default-400">
          {isPrev ? "Previous" : "Next"}
        </span>
        <span className="block truncate font-semibold text-default-900">
          {link.title}
        </span>
      </span>
    </RouterLink>
  );
}

/**
 * Bottom-of-guide navigation: prev/next cards plus a "Back to all guides" link.
 * At the end of the collection it nudges readers back to the project page.
 */
export function GuidePager({ project, currentSlug }: GuidePagerProps) {
  const navigation = getGuideNavigation(project, currentSlug);
  if (!navigation) {
    return null;
  }

  const { prev, next } = navigation;
  const isLast = !next;

  return (
    <nav
      aria-label="Guide navigation"
      className="mt-12 flex flex-col gap-6 border-t border-default-200 pt-8"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        {prev ? (
          <PagerLink direction="prev" link={prev} projectId={project.id} />
        ) : (
          <div className="hidden flex-1 sm:block" />
        )}
        {next ? (
          <PagerLink direction="next" link={next} projectId={project.id} />
        ) : (
          <div className="hidden flex-1 sm:block" />
        )}
      </div>

      <div className="text-center text-sm">
        {isLast && (
          <p className="mb-2 font-medium text-default-700">
            That's the last guide in this project. Nice work!
          </p>
        )}
        <RouterLink
          className="rounded text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-primary-300"
          to={`/projects/${project.id}`}
        >
          Back to all guides
        </RouterLink>
      </div>
    </nav>
  );
}
