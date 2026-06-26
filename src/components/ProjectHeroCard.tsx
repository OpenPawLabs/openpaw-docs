import { Card, Chip } from "@heroui/react";
import { DifficultyBadge } from "@openpawlabs/diy-guides-ui";
import { Link as RouterLink } from "react-router-dom";
import type { ProjectEntry } from "../catalog/types";
import { getGuideMetadata, resolveHeroImage } from "../lib/guides/metadata";
import { HeroImage } from "./HeroImage";

interface ProjectHeroCardProps {
  project: ProjectEntry;
}

export function ProjectHeroCard({ project }: ProjectHeroCardProps) {
  const overview = getGuideMetadata(project.overviewPath);
  const hero = resolveHeroImage(project.overviewPath, overview);
  const difficulty = overview?.difficulty;

  return (
    <RouterLink
      className="group block rounded-large outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
      to={`/projects/${project.id}`}
    >
      <Card className="overflow-hidden transition-shadow group-hover:shadow-lg">
        <div className="grid items-center gap-0 sm:grid-cols-[minmax(0,4fr)_minmax(0,6fr)]">
          <div className="relative flex aspect-[16/9] h-48 items-center justify-center overflow-hidden bg-default-100 aspect-auto sm:h-72 lg:h-96">
            <HeroImage
              alt={hero.alt}
              label={project.title}
              src={hero.src}
            />
          </div>

          <div className="flex flex-col justify-center gap-4 p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <Chip color="accent" variant="soft">
                <Chip.Label>Project</Chip.Label>
              </Chip>
              {difficulty && <DifficultyBadge difficulty={difficulty} size="sm" />}
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-default-950 sm:text-4xl">
                {project.title}
              </h2>
              <p className="max-w-prose text-default-600">{project.description}</p>
            </div>

            <span className="inline-flex items-center gap-1 font-semibold text-primary group-hover:gap-2 transition-[gap]">
              View guide collection
              <span aria-hidden>→</span>
            </span>
          </div>
        </div>
      </Card>
    </RouterLink>
  );
}
