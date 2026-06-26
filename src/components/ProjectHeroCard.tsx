import { Button, Card, Chip } from "@heroui/react";
import { DifficultyBadge } from "@openpawlabs/diy-guides-ui";
import { Link as RouterLink } from "react-router-dom";
import type { ProjectEntry } from "../catalog/types";
import { getGuideMetadata, resolveHeroImage } from "../lib/guides/metadata";

interface ProjectHeroCardProps {
  project: ProjectEntry;
}

export function ProjectHeroCard({ project }: ProjectHeroCardProps) {
  const overview = getGuideMetadata(project.overviewPath);
  const hero = resolveHeroImage(project.overviewPath, overview);
  const difficulty = overview?.difficulty;

  return (
    <Card className="overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        {hero.src ? (
          <div className="relative aspect-[16/9] min-h-48 bg-default-100 lg:aspect-auto lg:min-h-72">
            <img
              alt={hero.alt ?? ""}
              className="size-full object-cover"
              src={hero.src}
            />
          </div>
        ) : (
          <div className="flex min-h-48 items-center justify-center bg-default-100 lg:min-h-72">
            <span className="text-sm text-default-400">No hero image</span>
          </div>
        )}

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

          <div>
            <RouterLink to={`/projects/${project.id}`}>
              <Button size="lg" variant="primary">
                View guide collection
              </Button>
            </RouterLink>
          </div>
        </div>
      </div>
    </Card>
  );
}
