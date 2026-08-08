import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { projects } from "../catalog/projects";
import {
  buildLlmsFullTxt,
  buildLlmsTxt,
  buildSitemap,
  collectProjectDocs,
} from "../lib/seo/llms";
import { listPrerenderPaths } from "../lib/seo/pageMeta";

const sections = collectProjectDocs((guidePath) =>
  readFileSync(join(__dirname, "../../public/guides", guidePath, "guide.mdx"), "utf8"),
);

describe("collectProjectDocs", () => {
  it("produces a Markdown doc for every catalog guide", () => {
    const expected = projects.reduce((sum, project) => sum + project.subguides.length, 0);
    const docs = sections.flatMap((section) => section.guides);
    expect(docs.length).toBe(expected);
    for (const doc of docs) {
      expect(doc.path).toMatch(/^\/projects\/[^/]+\/[^/]+$/);
      expect(doc.markdown).toMatch(/^# /);
    }
  });
});

describe("buildLlmsTxt", () => {
  it("indexes every guide as a .md link with its description", () => {
    const llms = buildLlmsTxt(sections);
    expect(llms).toMatch(/^# OpenPaw Labs DIY Guides\n/);
    expect(llms).toContain("## DIY SlimeVR Trackers");
    expect(llms).toContain(
      "(https://docs.openpawlabs.com/projects/bb-lsm6dsv/0-overview.md)",
    );
    for (const guide of sections.flatMap((section) => section.guides)) {
      expect(llms).toContain(`[${guide.title}]`);
    }
  });
});

describe("buildLlmsFullTxt", () => {
  it("concatenates every guide's full markdown", () => {
    const full = buildLlmsFullTxt(sections);
    expect(full).toContain("# Project Overview");
    expect(full).toContain("\n\n---\n\n");
    expect(full).not.toMatch(/<[A-Z]/);
  });
});

describe("buildSitemap", () => {
  it("lists an absolute URL for every prerendered route", () => {
    const paths = listPrerenderPaths();
    const sitemap = buildSitemap(paths);
    expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    for (const path of paths) {
      expect(sitemap).toContain(`<loc>https://docs.openpawlabs.com${path === "/" ? "/" : path}</loc>`);
    }
  });
});
