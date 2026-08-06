import { describe, expect, it } from "vitest";
import { getProject, getSubguide, projects } from "../catalog/projects";

describe("catalog", () => {
  it("lists at least one project", () => {
    expect(projects.length).toBeGreaterThan(0);
  });

  it("defines bb-lsm6dsv with ordered subguides", () => {
    const project = getProject("bb-lsm6dsv");
    expect(project).toBeDefined();
    expect(project?.subguides.length).toBeGreaterThanOrEqual(7);
    expect(project?.subguides[0]?.slug).toBe("0-overview");
    expect(project?.subguides[3]?.slug).toBe("3-dock-assembly");
    expect(project?.subguides.some((entry) => entry.slug === "diy-straps")).toBe(
      true,
    );
    expect(project?.subguides.at(-1)?.slug).toBe("vrchat-use");
  });

  it("resolves subguides by slug", () => {
    const project = getProject("bb-lsm6dsv");
    expect(getSubguide(project!, "1-3d-prints")?.path).toBe(
      "bb-lsm6dsv/1-3d-prints",
    );
    expect(getSubguide(project!, "3-dock-assembly")?.path).toBe(
      "bb-lsm6dsv/3-dock-assembly",
    );
  });
});
