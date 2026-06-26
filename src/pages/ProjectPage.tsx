import { Alert, ProgressBar } from "@heroui/react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { getProject } from "../catalog/projects";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { SubguideHeroCard } from "../components/SubguideHeroCard";
import { useProjectProgress } from "../hooks/useProjectProgress";

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
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:gap-10 px-4 py-8 sm:px-6 lg:py-10">
      <header className="space-y-4">
        <Breadcrumbs
          items={[{ label: "Projects", to: "/" }, { label: project.title }]}
        />
        <h1 className="text-4xl font-bold tracking-tight text-default-950 sm:text-5xl">
          {project.title}
        </h1>
        <p className="max-w-3xl text-lg text-default-600">{project.description}</p>

        <div className="flex flex-col gap-0 sm:gap-4 rounded-xl border border-default-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
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
