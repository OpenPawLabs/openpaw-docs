import { cn } from "@heroui/react";
import { Link as RouterLink } from "react-router-dom";
import type { ProjectEntry, SubguideStatus } from "../catalog/types";
import { useProjectProgress } from "../hooks/useProjectProgress";
import { subguideTitle } from "../lib/guides/navigation";

interface GuideCollectionNavProps {
  project: ProjectEntry;
  currentSlug: string;
  /** Fired after a guide link is activated (used to close the mobile switcher). */
  onNavigate?: () => void;
  className?: string;
}

function CheckIcon() {
  return (
    <svg aria-hidden className="size-3.5" fill="none" viewBox="0 0 24 24">
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatusMarker({
  status,
  step,
  isCurrent,
}: {
  status: SubguideStatus;
  step: number;
  isCurrent: boolean;
}) {
  if (status === "complete") {
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success text-white">
        <CheckIcon />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
        isCurrent
          ? "bg-primary text-white"
          : status === "in-progress"
            ? "bg-warning-100 text-warning-700 ring-1 ring-warning-400"
            : "bg-default-100 text-default-500",
      )}
    >
      {step}
    </span>
  );
}

/**
 * Ordered list of a project's subguides with completion status and the current
 * guide highlighted. Rendered as a sticky rail on desktop and inside the mobile
 * switcher — one source of truth for the collection list.
 */
export function GuideCollectionNav({
  project,
  currentSlug,
  onNavigate,
  className,
}: GuideCollectionNavProps) {
  const { statusBySlug } = useProjectProgress(project);

  return (
    <nav aria-label="Guides in this project" className={className}>
      <ol className="flex flex-col gap-1">
        {project.subguides.map((subguide, index) => {
          const isCurrent = subguide.slug === currentSlug;
          const status = statusBySlug[subguide.slug] ?? "not-started";
          return (
            <li key={subguide.slug}>
              <RouterLink
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  "flex items-start gap-3 rounded-lg px-3 py-2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary-300",
                  isCurrent
                    ? "bg-primary-50 text-default-950"
                    : "text-default-600 hover:bg-default-100 hover:text-default-900",
                )}
                onClick={onNavigate}
                to={`/projects/${project.id}/${subguide.slug}`}
              >
                <StatusMarker isCurrent={isCurrent} status={status} step={index + 1} />
                <span className="min-w-0 flex-1 pt-0.5">
                  <span
                    className={cn(
                      "block text-sm leading-snug",
                      isCurrent && "font-semibold",
                    )}
                  >
                    {subguideTitle(subguide)}
                  </span>
                  {(subguide.optional || subguide.shared) && (
                    <span className="mt-0.5 block text-xs text-default-400">
                      {subguide.optional ? "Optional" : "Shared"}
                    </span>
                  )}
                </span>
              </RouterLink>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
