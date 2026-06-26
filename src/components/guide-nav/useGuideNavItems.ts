import { useMemo } from "react";
import type { ProjectEntry, SubguideStatus } from "../../catalog/types";
import { useProjectProgress } from "../../hooks/useProjectProgress";
import { subguideTitle } from "../../lib/guides/navigation";

export interface GuideNavItem {
  slug: string;
  title: string;
  href: string;
  step: number;
  status: SubguideStatus;
  isCurrent: boolean;
  optional?: boolean;
  shared?: boolean;
}

export function useGuideNavItems(
  project: ProjectEntry,
  currentSlug: string,
): GuideNavItem[] {
  const { statusBySlug } = useProjectProgress(project);

  return useMemo(
    () =>
      project.subguides.map((subguide, index) => ({
        slug: subguide.slug,
        title: subguideTitle(subguide),
        href: `/projects/${project.id}/${subguide.slug}`,
        step: index + 1,
        status: statusBySlug[subguide.slug] ?? "not-started",
        isCurrent: subguide.slug === currentSlug,
        optional: subguide.optional,
        shared: subguide.shared,
      })),
    [project, currentSlug, statusBySlug],
  );
}
