import { Button, Card, Chip } from "@heroui/react";
import { DifficultyBadge } from "@openpawlabs/diy-guides-ui";
import { Link as RouterLink } from "react-router-dom";
import type { SubguideEntry } from "../catalog/types";
import { useGuideProgress } from "../hooks/useGuideProgress";
import { getGuideMetadata, resolveHeroImage } from "../lib/guides/metadata";
import { statusLabel } from "../lib/progress/storage";

interface SubguideHeroCardProps {
  projectId: string;
  subguide: SubguideEntry;
  index: number;
}

const statusColor = {
  "not-started": "default",
  "in-progress": "warning",
  complete: "success",
} as const;

export function SubguideHeroCard({ projectId, subguide, index }: SubguideHeroCardProps) {
  const metadata = getGuideMetadata(subguide.path);
  const hero = resolveHeroImage(subguide.path, metadata);
  const { status, progress } = useGuideProgress(projectId, subguide.slug);
  const title = metadata?.title ?? subguide.title;

  return (
    <Card className="overflow-hidden">
      <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {hero.src ? (
          <div className="relative aspect-[16/9] min-h-44 bg-default-100 md:aspect-auto md:min-h-56">
            <img
              alt={hero.alt ?? ""}
              className="size-full object-cover"
              src={hero.src}
            />
          </div>
        ) : (
          <div className="flex min-h-44 items-center justify-center bg-default-100 md:min-h-56">
            <span className="text-sm text-default-400">No hero image</span>
          </div>
        )}

        <div className="flex flex-col justify-center gap-4 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Chip variant="soft">
              <Chip.Label>Step {index + 1}</Chip.Label>
            </Chip>
            <Chip color={statusColor[status]} variant="soft">
              <Chip.Label>{statusLabel(status)}</Chip.Label>
            </Chip>
            {subguide.optional && (
              <Chip variant="soft">
                <Chip.Label>Optional</Chip.Label>
              </Chip>
            )}
            {subguide.shared && (
              <Chip variant="soft">
                <Chip.Label>Shared</Chip.Label>
              </Chip>
            )}
            {metadata?.difficulty && (
              <DifficultyBadge difficulty={metadata.difficulty} size="sm" />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold tracking-tight text-default-950">{title}</h3>
            <p className="text-default-600">{subguide.description}</p>
            {metadata?.timeEstimate && (
              <p className="text-sm text-default-500">{metadata.timeEstimate}</p>
            )}
            {progress && progress.total > 0 && (
              <p className="text-sm text-default-500">
                {progress.completed} / {progress.total} steps complete
              </p>
            )}
          </div>

          <div>
            <RouterLink to={`/projects/${projectId}/${subguide.slug}`}>
              <Button variant="primary">Open guide</Button>
            </RouterLink>
          </div>
        </div>
      </div>
    </Card>
  );
}
