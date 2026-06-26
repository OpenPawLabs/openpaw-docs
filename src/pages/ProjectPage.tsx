import { Alert, ProgressBar } from "@heroui/react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { getProject } from "../catalog/projects";
import { SubguideHeroCard } from "../components/SubguideHeroCard";

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

  return <ProjectCollection project={project} />;
}

function ProjectCollection({ project }: { project: NonNullable<ReturnType<typeof getProject>> }) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:gap-10 px-4 py-3 sm:py-6 sm:px-6 lg:py-10">
      <header className="space-y-2 sm:space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-default-950 sm:text-5xl">
          {project.title}
        </h1>
        <p className="max-w-3xl text-lg text-default-600">{project.description}</p>
      </header>

      <section aria-label="Guide collection" className="flex flex-col gap-3 sm:gap-6">
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
