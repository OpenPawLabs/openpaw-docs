import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { getProject } from "../catalog/projects";
import { useProjectProgress } from "../hooks/useProjectProgress";
import { notifyProgressChange, writeGuideProgress } from "../lib/progress/storage";

const project = getProject("bb-lsm6dsv")!;

function complete(slug: string) {
  act(() => {
    writeGuideProgress("bb-lsm6dsv", slug, { completed: 3, total: 3 });
    notifyProgressChange();
  });
}

describe("useProjectProgress", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("reports zero progress and the first guide as the resume target", () => {
    const { result } = renderHook(() => useProjectProgress(project));
    expect(result.current.completedGuides).toBe(0);
    expect(result.current.totalGuides).toBe(project.subguides.length);
    expect(result.current.percent).toBe(0);
    expect(result.current.firstIncompleteSlug).toBe("0-overview");
  });

  it("aggregates completed guides and advances the resume target", () => {
    const { result } = renderHook(() => useProjectProgress(project));

    complete("0-overview");

    expect(result.current.completedGuides).toBe(1);
    expect(result.current.statusBySlug["0-overview"]).toBe("complete");
    expect(result.current.firstIncompleteSlug).toBe("1-3d-prints");
    expect(result.current.percent).toBe(Math.round((1 / project.subguides.length) * 100));
  });

  it("returns a referentially stable snapshot when nothing changes", () => {
    const { result, rerender } = renderHook(() => useProjectProgress(project));
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});
