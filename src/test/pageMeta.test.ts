import { describe, expect, it } from "vitest";
import {
  getPageMeta,
  listPrerenderPaths,
  renderPageHead,
} from "../lib/seo/pageMeta";
import { listGuidePaths } from "../lib/guides/guideRegistry";
import { projects } from "../catalog/projects";

describe("pageMeta", () => {
  it("lists home, project, and guide paths from the catalog", () => {
    const paths = listPrerenderPaths();
    expect(paths[0]).toBe("/");
    expect(paths).toContain("/projects/bb-lsm6dsv");
    expect(paths).toContain("/projects/bb-lsm6dsv/0-overview");
    expect(paths).toContain("/projects/bb-lsm6dsv/onetime-setup");

    const expectedGuideRoutes = projects.flatMap((project) =>
      project.subguides.map((subguide) => `/projects/${project.id}/${subguide.slug}`),
    );
    expect(paths.length).toBe(1 + projects.length + expectedGuideRoutes.length);
  });

  it("builds guide meta with title, description, and og image when available", () => {
    const meta = getPageMeta("/projects/bb-lsm6dsv/0-overview");
    expect(meta.title).toContain("Project Overview");
    expect(meta.description.length).toBeGreaterThan(10);
    expect(meta.path).toBe("/projects/bb-lsm6dsv/0-overview");
    expect(meta.image).toMatch(/^https:\/\/docs\.openpawlabs\.com\/guides\//);

    const head = renderPageHead(meta);
    expect(head).toContain("<title>");
    expect(head).toContain('property="og:image"');
    expect(head).toContain('rel="canonical"');
  });
});

describe("guideRegistry", () => {
  it("registers a compiled module for every catalog guide path", () => {
    const modulePaths = new Set(listGuidePaths());
    for (const project of projects) {
      for (const subguide of project.subguides) {
        expect(modulePaths.has(subguide.path)).toBe(true);
      }
    }
  });
});
