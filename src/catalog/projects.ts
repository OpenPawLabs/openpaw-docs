import type { ProjectEntry } from "./types";
import generatedProjects from "./projects.generated.json";

export const projects = generatedProjects as ProjectEntry[];

export function getProject(projectId: string): ProjectEntry | undefined {
  return projects.find((project) => project.id === projectId);
}

export function getSubguide(
  project: ProjectEntry,
  guideSlug: string,
): ProjectEntry["subguides"][number] | undefined {
  return project.subguides.find((subguide) => subguide.slug === guideSlug);
}
