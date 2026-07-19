import { describe, expect, it } from "vitest";
import {
  defaultGuideSlug,
  humanizeSlug,
  projectManifestToEntry,
  resolveGuidePath,
  type ProjectManifest,
} from "../catalog/manifest";

const baseManifest = (): ProjectManifest => ({
  id: "bb-lsm6dsv",
  title: "DIY SlimeVR Trackers",
  description: "Build trackers.",
  overview: "0-overview",
  guides: [
    { path: "0-overview", description: "Overview blurb." },
    { path: "1-3d-prints", description: "Prints blurb." },
    {
      path: "common/0-onetime-tracker-setup",
      slug: "onetime-setup",
      description: "Setup blurb.",
      shared: true,
    },
  ],
});

describe("resolveGuidePath", () => {
  it("prefixes project-local bare paths", () => {
    expect(resolveGuidePath("bb-lsm6dsv", "0-overview")).toBe(
      "bb-lsm6dsv/0-overview",
    );
  });

  it("keeps shared repo-root paths", () => {
    expect(
      resolveGuidePath("bb-lsm6dsv", "common/0-onetime-tracker-setup"),
    ).toBe("common/0-onetime-tracker-setup");
  });

  it("rejects parent-segment paths", () => {
    expect(() => resolveGuidePath("bb-lsm6dsv", "../common/x")).toThrow(
      /\.\./,
    );
  });
});

describe("defaultGuideSlug", () => {
  it("uses the final path segment", () => {
    expect(defaultGuideSlug("bb-lsm6dsv/1-3d-prints")).toBe("1-3d-prints");
    expect(defaultGuideSlug("common/0-onetime-tracker-setup")).toBe(
      "0-onetime-tracker-setup",
    );
  });
});

describe("humanizeSlug", () => {
  it("strips a numeric prefix and title-cases segments", () => {
    expect(humanizeSlug("0-overview")).toBe("Overview");
    expect(humanizeSlug("onetime-setup")).toBe("Onetime Setup");
  });
});

describe("projectManifestToEntry", () => {
  it("resolves paths, slugs, and overview", () => {
    const entry = projectManifestToEntry(baseManifest());
    expect(entry.overviewPath).toBe("bb-lsm6dsv/0-overview");
    expect(entry.subguides).toHaveLength(3);
    expect(entry.subguides[0]).toMatchObject({
      slug: "0-overview",
      path: "bb-lsm6dsv/0-overview",
    });
    expect(entry.subguides[2]).toMatchObject({
      slug: "onetime-setup",
      path: "common/0-onetime-tracker-setup",
      shared: true,
    });
    expect(entry.subguides[0]?.title).toBeUndefined();
  });

  it("rejects an overview not listed in guides", () => {
    const manifest = baseManifest();
    manifest.overview = "missing-guide";
    expect(() => projectManifestToEntry(manifest)).toThrow(/overview/);
  });

  it("rejects an empty guides list", () => {
    const manifest = baseManifest();
    manifest.guides = [];
    expect(() => projectManifestToEntry(manifest)).toThrow(/non-empty/);
  });
});
