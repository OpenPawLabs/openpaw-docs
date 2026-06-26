import { useCallback, useRef, useSyncExternalStore } from "react";
import type { ProjectEntry, SubguideStatus } from "../catalog/types";
import {
  deriveSubguideStatus,
  getProgressSnapshot,
  subscribeProgress,
} from "../lib/progress/storage";

export interface ProjectProgress {
  /** Subguides whose stored progress is fully complete. */
  completedGuides: number;
  totalGuides: number;
  /** Completed / total guides, 0–100, rounded. */
  percent: number;
  statusBySlug: Record<string, SubguideStatus>;
  /** Slug of the first not-yet-complete subguide — drives the "resume" CTA. */
  firstIncompleteSlug?: string;
}

/**
 * Aggregates per-subguide completion across a project from the progress store.
 * Read-only: progress is written by the guide reader (Phase 2 owns deeper restore).
 * Uses guides-complete fraction so it stays accurate before every guide is opened.
 */
export function useProjectProgress(project: ProjectEntry): ProjectProgress {
  const cacheRef = useRef<{ key: string; value: ProjectProgress } | null>(null);

  const getSnapshot = useCallback((): ProjectProgress => {
    const statusBySlug: Record<string, SubguideStatus> = {};
    const keyParts: string[] = [];
    let completedGuides = 0;
    let firstIncompleteSlug: string | undefined;

    for (const subguide of project.subguides) {
      const progress = getProgressSnapshot(project.id, subguide.slug);
      const status = deriveSubguideStatus(progress);
      statusBySlug[subguide.slug] = status;
      keyParts.push(`${subguide.slug}:${status}`);

      if (status === "complete") {
        completedGuides += 1;
      } else if (firstIncompleteSlug === undefined) {
        firstIncompleteSlug = subguide.slug;
      }
    }

    const key = keyParts.join("|");
    if (cacheRef.current?.key === key) {
      return cacheRef.current.value;
    }

    const totalGuides = project.subguides.length;
    const value: ProjectProgress = {
      completedGuides,
      totalGuides,
      percent: totalGuides ? Math.round((completedGuides / totalGuides) * 100) : 0,
      statusBySlug,
      firstIncompleteSlug,
    };
    cacheRef.current = { key, value };
    return value;
  }, [project]);

  return useSyncExternalStore(subscribeProgress, getSnapshot, getSnapshot);
}
