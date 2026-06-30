import { Card, Chip } from "@heroui/react";
import { DifficultyBadge } from "@openpawlabs/diy-guides-ui";
import { Link as RouterLink } from "react-router-dom";
import type { SubguideEntry } from "../catalog/types";
import { useGuideProgress } from "../hooks/useGuideProgress";
import { getGuideMetadata, resolveHeroImage } from "../lib/guides/metadata";
import { getFirstIncompleteStep, statusLabel } from "../lib/progress/storage";
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
  "in-progress": "Continue where you left off",
  complete: "Review",
} as const;

export function SubguideHeroCard({ projectId, subguide }: SubguideHeroCardProps) {
  const metadata = getGuideMetadata(subguide.path);
  const hero = resolveHeroImage(subguide.path, metadata);
  const { status, progress } = useGuideProgress(projectId, subguide.slug);
  const title = metadata?.title ?? subguide.title;
  const resumeStep = getFirstIncompleteStep(progress, metadata?.steps?.length);
  const guideHref =
    status === "in-progress" && resumeStep != null
      ? `/projects/${projectId}/${subguide.slug}#step-${resumeStep}`
      : `/projects/${projectId}/${subguide.slug}`;

  return (
    <RouterLink
      className="group block rounded-large outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
      to={guideHref}
    >
      <Card className="overflow-hidden transition-shadow group-hover:shadow-lg">
        <div className="grid items-center gap-0 grid-cols-[minmax(0,4fr)_minmax(0,6fr)] sm:grid-cols-[minmax(0,3fr)_minmax(0,7fr)] md:grid-cols-[minmax(0,4fr)_minmax(0,6fr)]">
          <div className="relative flex aspect-[16/9] h-42 items-center justify-center overflow-hidden bg-default-100 aspect-auto sm:h-48 md:h-54">
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

          <div className="flex flex-col justify-center gap-1 sm:gap-4 p-1 sm:p-6">
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              
              {status !== "complete" && (
                <Chip color={statusColor[status]} variant="soft">
                  <Chip.Label>{metadata?.timeEstimate}</Chip.Label>
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
              {status !== "complete" && (
                <Chip color={statusColor[status]} variant="soft">
                  <Chip.Label>{statusLabel(status)}</Chip.Label>
                </Chip>
              )}
            </div>

            <div className="space-y-1 sm:space-y-2">
              <h3 className="text-2xl font-bold tracking-tight text-default-950">
                {title}
              </h3>
              <p className="text-default-600 md:text-lg">{subguide.description}</p>
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
