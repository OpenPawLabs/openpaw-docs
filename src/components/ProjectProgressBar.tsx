import { ProgressBar } from "@heroui/react";
import { Link as RouterLink } from "react-router-dom";
import type { ProjectEntry } from "../catalog/types";
import { useProjectProgress } from "../hooks/useProjectProgress";

interface ProjectProgressBarProps {
  project: ProjectEntry;
}

/** Project-wide guide completion summary for the site header. */
export function ProjectProgressBar({ project }: ProjectProgressBarProps) {
  const { completedGuides, totalGuides, firstIncompleteSlug } =
    useProjectProgress(project);

  const resumeSlug = firstIncompleteSlug ?? project.subguides[0]?.slug;
  const resumeLabel =
    completedGuides === 0
      ? "Start project"
      : firstIncompleteSlug
        ? "Resume project"
        : "Review project";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <ProgressBar
        aria-label="Project progress"
        className="flex min-w-0 flex-1 flex-col gap-1.5"
        maxValue={totalGuides}
        value={completedGuides}
      >
        <div className="flex items-center justify-between text-sm text-default-600">
          <span className="font-medium">Project progress</span>
          <ProgressBar.Output>
            {completedGuides} / {totalGuides} guides
          </ProgressBar.Output>
        </div>
        <ProgressBar.Track className="h-2 overflow-hidden rounded-full bg-default-100">
          <ProgressBar.Fill className="h-full rounded-full bg-success transition-[width]" />
        </ProgressBar.Track>
      </ProgressBar>

      {resumeSlug && (
        <RouterLink
          className="hidden sm:inline-flex shrink-0 items-center justify-center gap-1 rounded-large bg-primary px-5 py-2.5 font-semibold outline-none transition-colors hover:bg-primary-600 focus-visible:ring-2 focus-visible:ring-primary-300"
          to={`/projects/${project.id}/${resumeSlug}`}
        >
          {resumeLabel}
          <span aria-hidden>→</span>
        </RouterLink>
      )}
    </div>
  );
}
