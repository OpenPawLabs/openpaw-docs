import { describe, expect, it, beforeEach } from "vitest";
import {
  getProgressSnapshot,
  readGuideProgress,
  writeGuideProgress,
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
