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

function parseStoredSteps(value: unknown): Record<string, boolean> | undefined {
  if (typeof value !== "object" || value == null) {
    return undefined;
  }

  const steps: Record<string, boolean> = {};

  for (const [key, stepValue] of Object.entries(value)) {
    if (/^\d+$/.test(key) && typeof stepValue === "boolean") {
      steps[key] = stepValue;
    }
  }

  return Object.keys(steps).length > 0 ? steps : undefined;
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
      const steps = parseStoredSteps(parsed.steps);
      return steps ? { ...parsed, steps } : parsed;
    }
  } catch {
    return null;
  }

  return null;
}

function stepsEqual(
  left: Record<string, boolean> | undefined,
  right: Record<string, boolean> | undefined,
): boolean {
  const a = left ?? {};
  const b = right ?? {};
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  if (aKeys.length !== bKeys.length) {
    return false;
  }

  return aKeys.every((key) => a[key] === b[key]);
}

function progressRecordsEqual(
  left: GuideProgressRecord,
  right: GuideProgressRecord,
): boolean {
  return (
    left.completed === right.completed &&
    left.total === right.total &&
    stepsEqual(left.steps, right.steps)
  );
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
    progressRecordsEqual(cached, fresh)
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

export function stepCompletionFromStorage(
  steps: Record<string, boolean> | undefined,
): Record<number, boolean> {
  if (!steps) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(steps)
      .filter(([, completed]) => completed)
      .map(([step, completed]) => [Number(step), completed]),
  );
}

export function stepCompletionToStorage(
  steps: Record<number, boolean>,
): Record<string, boolean> | undefined {
  const stored = Object.fromEntries(
    Object.entries(steps)
      .filter(([, completed]) => completed)
      .map(([step, completed]) => [String(step), completed]),
  );

  return Object.keys(stored).length > 0 ? stored : undefined;
}

export function countCompletedSteps(steps: Record<number, boolean>): number {
  return Object.values(steps).filter(Boolean).length;
}

export function buildGuideProgressRecord(
  steps: Record<number, boolean>,
  total: number,
): GuideProgressRecord {
  const completed = countCompletedSteps(steps);
  const storedSteps = stepCompletionToStorage(steps);

  return storedSteps
    ? { completed, total, steps: storedSteps }
    : { completed, total };
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
  const record: GuideProgressRecord = {
    completed: progress.completed,
    total: progress.total,
    ...(progress.steps ? { steps: progress.steps } : {}),
  };

  if (cached && progressRecordsEqual(cached, record)) {
    return false;
  }

  localStorage.setItem(storageKey(projectId, guideSlug), JSON.stringify(record));
  snapshotCache.set(cacheKey(projectId, guideSlug), record);
  return true;
}

export function writeGuideStepCompletion(
  projectId: string,
  guideSlug: string,
  steps: Record<number, boolean>,
  total: number,
): boolean {
  return writeGuideProgress(projectId, guideSlug, buildGuideProgressRecord(steps, total));
}

export function clearGuideProgress(projectId: string, guideSlug: string): void {
  if (typeof localStorage === "undefined") {
    return;
  }

  localStorage.removeItem(storageKey(projectId, guideSlug));
  snapshotCache.set(cacheKey(projectId, guideSlug), NULL_PROGRESS_SNAPSHOT);
}

export function clearProjectProgress(projectId: string, guideSlugs: string[]): void {
  for (const guideSlug of guideSlugs) {
    clearGuideProgress(projectId, guideSlug);
  }
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

export function getFirstIncompleteStep(
  progress: GuideProgressRecord | null,
  stepCount?: number,
): number | null {
  const total = stepCount ?? progress?.total ?? 0;

  if (total <= 0) {
    return null;
  }

  const completedSteps = stepCompletionFromStorage(progress?.steps);

  for (let step = 1; step <= total; step += 1) {
    if (!completedSteps[step]) {
      return step;
    }
  }

  return null;
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
