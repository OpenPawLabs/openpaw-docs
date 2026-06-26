import { Card, Chip } from "@heroui/react";
import { DifficultyBadge } from "@openpawlabs/diy-guides-ui";
import { Link as RouterLink } from "react-router-dom";
import type { SubguideEntry } from "../catalog/types";
import { useGuideProgress } from "../hooks/useGuideProgress";
import { getGuideMetadata, resolveHeroImage } from "../lib/guides/metadata";
import { statusLabel } from "../lib/progress/storage";
import { HeroImage } from "./HeroImage";

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

const ctaLabel = {
  "not-started": "Start guide",
  "in-progress": "Continue",
  complete: "Review",
} as const;

export function SubguideHeroCard({ projectId, subguide, index }: SubguideHeroCardProps) {
  const metadata = getGuideMetadata(subguide.path);
  const hero = resolveHeroImage(subguide.path, metadata);
  const { status, progress } = useGuideProgress(projectId, subguide.slug);
  const title = metadata?.title ?? subguide.title;

  return (
    <RouterLink
      className="group block rounded-large outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
      to={`/projects/${projectId}/${subguide.slug}`}
    >
      <Card className="overflow-hidden transition-shadow group-hover:shadow-lg">
        <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="relative aspect-[16/9] min-h-44 bg-default-100 md:aspect-auto md:min-h-56">
            <HeroImage alt={hero.alt} label={title} src={hero.src} />
            {status === "complete" && (
              <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-white shadow">
                <svg aria-hidden className="size-3.5" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Complete
              </span>
            )}
          </div>

          <div className="flex flex-col justify-center gap-4 p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Chip variant="soft">
                <Chip.Label>Step {index + 1}</Chip.Label>
              </Chip>
              {status !== "complete" && (
                <Chip color={statusColor[status]} variant="soft">
                  <Chip.Label>{statusLabel(status)}</Chip.Label>
                </Chip>
              )}
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
              <h3 className="text-2xl font-bold tracking-tight text-default-950">
                {title}
              </h3>
              <p className="text-default-600">{subguide.description}</p>
              {metadata?.timeEstimate && (
                <p className="text-sm text-default-500">{metadata.timeEstimate}</p>
              )}
              {status === "in-progress" && progress && progress.total > 0 && (
                <p className="text-sm text-default-500">
                  {progress.completed} / {progress.total} steps complete
                </p>
              )}
            </div>

            <span className="inline-flex items-center gap-1 font-semibold text-primary group-hover:gap-2 transition-[gap]">
              {ctaLabel[status]}
              <span aria-hidden>→</span>
            </span>
          </div>
        </div>
      </Card>
    </RouterLink>
  );
}
