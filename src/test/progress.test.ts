import { describe, expect, it, beforeEach } from "vitest";
import {
  buildGuideProgressRecord,
  clearGuideProgress,
  clearProjectProgress,
  getFirstIncompleteStep,
  getProgressSnapshot,
  readGuideProgress,
  stepCompletionFromStorage,
  stepCompletionToStorage,
  writeGuideProgress,
  writeGuideStepCompletion,
} from "../lib/progress/storage";

describe("writeGuideProgress", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns false when progress is unchanged", () => {
    expect(writeGuideProgress("bb-lsm6dsv", "0-overview", { completed: 0, total: 2 })).toBe(
      true,
    );
    expect(writeGuideProgress("bb-lsm6dsv", "0-overview", { completed: 0, total: 2 })).toBe(
      false,
    );
    expect(readGuideProgress("bb-lsm6dsv", "0-overview")).toEqual({
      completed: 0,
      total: 2,
    });
  });

  it("returns true when progress changes", () => {
    writeGuideProgress("bb-lsm6dsv", "0-overview", { completed: 0, total: 2 });
    expect(writeGuideProgress("bb-lsm6dsv", "0-overview", { completed: 1, total: 2 })).toBe(
      true,
    );
  });

  it("persists per-step completion", () => {
    writeGuideStepCompletion("bb-lsm6dsv", "0-overview", { 1: true, 2: false }, 2);

    expect(readGuideProgress("bb-lsm6dsv", "0-overview")).toEqual({
      completed: 1,
      total: 2,
      steps: { "1": true },
    });
  });

  it("returns false when step completion is unchanged", () => {
    writeGuideStepCompletion("bb-lsm6dsv", "0-overview", { 1: true }, 2);
    expect(
      writeGuideStepCompletion("bb-lsm6dsv", "0-overview", { 1: true }, 2),
    ).toBe(false);
  });
});

describe("getProgressSnapshot", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns a referentially stable snapshot when data is unchanged", () => {
    writeGuideProgress("bb-lsm6dsv", "0-overview", { completed: 0, total: 2 });

    const first = getProgressSnapshot("bb-lsm6dsv", "0-overview");
    const second = getProgressSnapshot("bb-lsm6dsv", "0-overview");

    expect(first).toBe(second);
  });

  it("returns a stable null snapshot when no progress is stored", () => {
    const first = getProgressSnapshot("bb-lsm6dsv", "missing");
    const second = getProgressSnapshot("bb-lsm6dsv", "missing");

    expect(first).toBeNull();
    expect(first).toBe(second);
  });
});

describe("clearGuideProgress", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("removes stored progress", () => {
    writeGuideProgress("bb-lsm6dsv", "0-overview", { completed: 2, total: 2, steps: { "1": true, "2": true } });
    clearGuideProgress("bb-lsm6dsv", "0-overview");
    expect(readGuideProgress("bb-lsm6dsv", "0-overview")).toBeNull();
  });
});

describe("clearProjectProgress", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("removes stored progress for every subguide", () => {
    writeGuideStepCompletion("bb-lsm6dsv", "0-overview", { 1: true }, 2);
    writeGuideStepCompletion("bb-lsm6dsv", "1-3d-prints", { 1: true }, 3);

    clearProjectProgress("bb-lsm6dsv", ["0-overview", "1-3d-prints"]);

    expect(readGuideProgress("bb-lsm6dsv", "0-overview")).toBeNull();
    expect(readGuideProgress("bb-lsm6dsv", "1-3d-prints")).toBeNull();
  });
});

describe("step completion helpers", () => {
  it("round-trips completed steps through storage format", () => {
    const steps = { 1: true, 2: false, 3: true };
    expect(stepCompletionFromStorage(stepCompletionToStorage(steps))).toEqual({
      1: true,
      3: true,
    });
  });

  it("builds aggregate counts from step completion", () => {
    expect(buildGuideProgressRecord({ 1: true, 2: false, 3: true }, 3)).toEqual({
      completed: 2,
      total: 3,
      steps: { "1": true, "3": true },
    });
  });
});

describe("getFirstIncompleteStep", () => {
  it("returns the first incomplete step number", () => {
    expect(
      getFirstIncompleteStep(
        { completed: 1, total: 3, steps: { "1": true } },
        3,
      ),
    ).toBe(2);
  });

  it("returns null when every step is complete", () => {
    expect(
      getFirstIncompleteStep(
        { completed: 2, total: 2, steps: { "1": true, "2": true } },
        2,
      ),
    ).toBeNull();
  });
});
