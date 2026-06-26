import { describe, expect, it } from "vitest";
import { getProject } from "../catalog/projects";
import { getGuideNavigation } from "../lib/guides/navigation";

const project = getProject("bb-lsm6dsv")!;

describe("getGuideNavigation", () => {
  it("returns no prev for the first guide", () => {
    const nav = getGuideNavigation(project, "0-overview");
    expect(nav?.index).toBe(0);
    expect(nav?.total).toBe(project.subguides.length);
    expect(nav?.prev).toBeUndefined();
    expect(nav?.next?.slug).toBe("1-3d-prints");
  });

  it("returns no next for the last guide", () => {
    const last = project.subguides.at(-1)!.slug;
    const nav = getGuideNavigation(project, last);
    expect(nav?.index).toBe(project.subguides.length - 1);
    expect(nav?.next).toBeUndefined();
    expect(nav?.prev?.slug).toBe("onetime-setup");
  });

  it("links both neighbours for a middle guide", () => {
    const nav = getGuideNavigation(project, "2-tracker-assembly");
    expect(nav?.prev?.slug).toBe("1-3d-prints");
    expect(nav?.next?.slug).toBe("3-strap-assembly");
  });

  it("uses authored metadata titles for neighbours", () => {
    const nav = getGuideNavigation(project, "0-overview");
    expect(nav?.next?.title).toBe("3D Print Parts");
  });

  it("returns undefined for an unknown slug", () => {
    expect(getGuideNavigation(project, "nope")).toBeUndefined();
  });
});
