import type { GuideProgressRecord, SubguideStatus } from "../../catalog/types";

const STORAGE_PREFIX = "openpaw-docs:guide-progress:";

/** Stable null reference for useSyncExternalStore snapshots. */
export const NULL_PROGRESS_SNAPSHOT = null;

const snapshotCache = new Map<string, GuideProgressRecord | typeof NULL_PROGRESS_SNAPSHOT>();
const listeners = new Set<() => void>();

function storageKey(projectId: string, guideSlug: string): string {
  return `${STORAGE_PREFIX}${projectId}/${guideSlug}`;
}

function cacheKey(projectId: string, guideSlug: string): string {
  return `${projectId}/${guideSlug}`;
}

function parseStoredProgress(raw: string): GuideProgressRecord | null {
  try {
    const parsed = JSON.parse(raw) as GuideProgressRecord;
    if (
      typeof parsed.completed === "number" &&
      typeof parsed.total === "number" &&
      parsed.total >= 0 &&
      parsed.completed >= 0 &&
      parsed.completed <= parsed.total
    ) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

function readFromStorage(
  projectId: string,
  guideSlug: string,
): GuideProgressRecord | null {
  if (typeof localStorage === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(storageKey(projectId, guideSlug));
  if (!raw) {
    return null;
  }

  return parseStoredProgress(raw);
}

/** Cached snapshot for useSyncExternalStore — must return referentially stable values. */
export function getProgressSnapshot(
  projectId: string,
  guideSlug: string,
): GuideProgressRecord | null {
  const key = cacheKey(projectId, guideSlug);
  const fresh = readFromStorage(projectId, guideSlug);
  const cached = snapshotCache.get(key);

  if (fresh === null) {
    if (cached !== NULL_PROGRESS_SNAPSHOT) {
      snapshotCache.set(key, NULL_PROGRESS_SNAPSHOT);
    }
    return NULL_PROGRESS_SNAPSHOT;
  }

  if (
    cached &&
    cached !== NULL_PROGRESS_SNAPSHOT &&
    cached.completed === fresh.completed &&
    cached.total === fresh.total
  ) {
    return cached;
  }

  snapshotCache.set(key, fresh);
  return fresh;
}

export function readGuideProgress(
  projectId: string,
  guideSlug: string,
): GuideProgressRecord | null {
  return getProgressSnapshot(projectId, guideSlug);
}

export function writeGuideProgress(
  projectId: string,
  guideSlug: string,
  progress: GuideProgressRecord,
): boolean {
  if (typeof localStorage === "undefined") {
    return false;
  }

  const cached = getProgressSnapshot(projectId, guideSlug);
  if (
    cached &&
    cached.completed === progress.completed &&
    cached.total === progress.total
  ) {
    return false;
  }

  const record: GuideProgressRecord = {
    completed: progress.completed,
    total: progress.total,
  };

  localStorage.setItem(storageKey(projectId, guideSlug), JSON.stringify(record));
  snapshotCache.set(cacheKey(projectId, guideSlug), record);
  return true;
}

export function subscribeProgress(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function notifyProgressChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function deriveSubguideStatus(
  progress: GuideProgressRecord | null,
): SubguideStatus {
  if (!progress || progress.total === 0) {
    return "not-started";
  }

  if (progress.completed >= progress.total) {
    return "complete";
  }

  if (progress.completed > 0) {
    return "in-progress";
  }

  return "not-started";
}

export function statusLabel(status: SubguideStatus): string {
  switch (status) {
    case "complete":
      return "Complete";
    case "in-progress":
      return "In progress";
    default:
      return "Not started";
  }
}
