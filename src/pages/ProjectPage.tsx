import { Alert } from "@heroui/react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { getProject } from "../catalog/projects";
import { SubguideHeroCard } from "../components/SubguideHeroCard";
import { getGuideMetadata } from "../lib/guides/metadata";

export function ProjectPage() {
  const { projectId = "" } = useParams();
  const project = getProject(projectId);

  if (!project) {
    return (
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <Alert className="border border-danger-300 bg-danger-50">
          <Alert.Content>
            <Alert.Title>Project not found</Alert.Title>
            <Alert.Description>
              <RouterLink className="text-primary underline" to="/">
                Return home
              </RouterLink>{" "}
              to browse available projects.
            </Alert.Description>
          </Alert.Content>
        </Alert>
      </main>
    );
  }

  const overview = getGuideMetadata(project.overviewPath);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
      <header className="space-y-3">
        <p className="text-sm text-default-500">
          <RouterLink className="text-primary hover:underline" to="/">
            Projects
          </RouterLink>{" "}
          / {project.title}
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-default-950 sm:text-5xl">
          {overview?.title ?? project.title}
        </h1>
        <p className="max-w-3xl text-lg text-default-600">{project.description}</p>
      </header>

      <section aria-label="Guide collection" className="flex flex-col gap-6">
        {project.subguides.map((subguide, index) => (
          <SubguideHeroCard
            index={index}
            key={subguide.slug}
            projectId={project.id}
            subguide={subguide}
          />
        ))}
      </section>
    </main>
  );
}
