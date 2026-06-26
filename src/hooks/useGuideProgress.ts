import { useCallback, useSyncExternalStore } from "react";
import type { GuideProgressRecord, SubguideStatus } from "../catalog/types";
import {
  deriveSubguideStatus,
  getProgressSnapshot,
  NULL_PROGRESS_SNAPSHOT,
  notifyProgressChange,
  subscribeProgress,
  writeGuideProgress,
} from "../lib/progress/storage";

export function useGuideProgress(projectId: string, guideSlug: string) {
  const progress = useSyncExternalStore(
    subscribeProgress,
    () => getProgressSnapshot(projectId, guideSlug),
    () => NULL_PROGRESS_SNAPSHOT,
  );

  const setProgress = useCallback(
    (next: GuideProgressRecord) => {
      if (writeGuideProgress(projectId, guideSlug, next)) {
        notifyProgressChange();
      }
    },
    [projectId, guideSlug],
  );

  const status: SubguideStatus = deriveSubguideStatus(progress);

  return { progress, status, setProgress };
}

/** Write progress without subscribing — for guide reader pages. */
export function useSaveGuideProgress(projectId: string, guideSlug: string) {
  return useCallback(
    (next: GuideProgressRecord) => {
      if (writeGuideProgress(projectId, guideSlug, next)) {
        notifyProgressChange();
      }
    },
    [projectId, guideSlug],
  );
}
