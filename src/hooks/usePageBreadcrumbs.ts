import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { getProject, getSubguide } from "../catalog/projects";
import type { BreadcrumbItem } from "../components/Breadcrumbs";
import { subguideTitle } from "../lib/guides/navigation";

/** Route-derived breadcrumb trail for project and guide pages. */
export function usePageBreadcrumbs(): BreadcrumbItem[] | null {
  const { projectId, guideSlug } = useParams();

  return useMemo(() => {
    if (!projectId) {
      return null;
    }

    const project = getProject(projectId);
    if (!project) {
      return null;
    }

    const items: BreadcrumbItem[] = [
      { label: "Projects", to: "/" },
      { label: project.title, to: `/projects/${project.id}` },
    ];

    if (guideSlug) {
      const subguide = getSubguide(project, guideSlug);
      items.push({ label: subguide ? subguideTitle(subguide) : guideSlug });
    }

    return items;
  }, [projectId, guideSlug]);
}
