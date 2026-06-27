import { Alert, ProgressBar } from "@heroui/react";
import { Link as RouterLink } from "react-router-dom";
import type { ProjectEntry } from "../catalog/types";
import { useProjectProgress } from "../hooks/useProjectProgress";

interface ProjectProgressBarProps {
  project: ProjectEntry;
  variant: "inline" | "floating";
}

/** Project-wide guide completion summary for collection pages. */
export function ProjectProgressBar({ project, variant }: ProjectProgressBarProps) {
  const { completedGuides, totalGuides, firstIncompleteSlug } =
    useProjectProgress(project);

  const resumeSlug = firstIncompleteSlug ?? project.subguides[0]?.slug;
  const resumeLabel =
    completedGuides === 0
      ? "Start project"
      : firstIncompleteSlug
        ? "Resume project"
        : "Review project";

  const resumeLink = resumeSlug ? (
    <RouterLink
      className={
        variant === "floating"
          ? "inline-flex w-full items-center justify-center gap-1 rounded-large bg-primary px-5 py-2 text-sm font-semibold outline-none transition-colors hover:bg-primary-600 focus-visible:ring-2 focus-visible:ring-primary-300"
          : "hidden sm:inline-flex shrink-0 items-center justify-center gap-1 rounded-large bg-primary px-5 py-2.5 text-sm font-semibold outline-none transition-colors hover:bg-primary-600 focus-visible:ring-2 focus-visible:ring-primary-300"
      }
      to={`/projects/${project.id}/${resumeSlug}`}
    >
      {resumeLabel}
      <span aria-hidden>→</span>
    </RouterLink>
  ) : null;

  if (variant === "floating") {
    return (
      <Alert className="w-120 shadow-md">
        <Alert.Content>
          <Alert.Description className="grid grid-cols-[minmax(0,6.5fr)_minmax(0,3.5fr)] w-full">
            <ProgressBar
              aria-label="Project progress"
              className="w-full"
              color="success"
              maxValue={totalGuides}
              value={completedGuides}
            >
              <div className="flex justify-start text-sm text-default-600">
                <ProgressBar.Output>
                  Project progress
                </ProgressBar.Output>
              </div>
              <div className="flex justify-end text-sm text-default-600">
                <ProgressBar.Output>
                  {completedGuides} / {totalGuides} guides
                </ProgressBar.Output>
              </div>
              <ProgressBar.Track>
                <ProgressBar.Fill />
              </ProgressBar.Track>
            </ProgressBar>
            {resumeLink}
          </Alert.Description>
        </Alert.Content>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <ProgressBar
        aria-label="Project progress"
        className="min-w-0 flex-1"
        color="success"
        maxValue={totalGuides}
        value={completedGuides}
      >
        <div className="flex items-center justify-between text-sm text-default-600">
          <span className="font-medium">Project progress</span>
          <ProgressBar.Output>
            {completedGuides} / {totalGuides} guides
          </ProgressBar.Output>
        </div>
        <ProgressBar.Track>
          <ProgressBar.Fill />
        </ProgressBar.Track>
      </ProgressBar>
      {resumeLink}
    </div>
  );
}
