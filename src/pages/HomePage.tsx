import { projects } from "../catalog/projects";
import { ProjectHeroCard } from "../components/ProjectHeroCard";

export function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 sm:px-6 lg:py-10">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Documentation
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-default-950 sm:text-5xl">
          DIY Projects
        </h1>
        <p className="max-w-2xl text-lg text-default-600">
          Pick a maker project and follow the step-by-step guides in order — from
          parts and printing through assembly and setup.
        </p>
      </header>

      <section aria-label="Projects" className="flex flex-col gap-8">
        {projects.map((project) => (
          <ProjectHeroCard key={project.id} project={project} />
        ))}
      </section>
    </main>
  );
}
