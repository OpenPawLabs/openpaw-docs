import { projects } from "../../catalog/projects";
import type { ProjectEntry } from "../../catalog/types";
import { guideToMarkdown } from "../guides/guideToMarkdown";
import { subguideTitle } from "../guides/navigation";
import { absoluteUrl } from "./pageMeta";

const SITE_TITLE = "OpenPaw Labs DIY Guides";
const SITE_SUMMARY =
  "Step-by-step, beginner-friendly DIY hardware guides from OpenPaw Labs " +
  "(https://openpawlabs.com), including building SlimeVR-compatible full-body " +
  "VR trackers from pre-assembled kit boards — no soldering needed when using " +
  "kit batteries. Each guide lists the " +
  "exact tools, parts, and prices, then walks through every step with photos. " +
  "Links below point to the plain-Markdown version of each guide; drop the " +
  "`.md` suffix for the illustrated web page.";

export interface GuideDoc {
  /** Route of the prerendered HTML page, e.g. `/projects/bb-lsm6dsv/0-overview`. */
  path: string;
  title: string;
  description: string;
  markdown: string;
}

export interface ProjectDocs {
  project: ProjectEntry;
  guides: GuideDoc[];
}

/** Build per-guide Markdown docs for every catalog guide. */
export function collectProjectDocs(
  readGuideSource: (guidePath: string) => string,
): ProjectDocs[] {
  return projects.map((project) => ({
    project,
    guides: project.subguides.map((subguide) => {
      const path = `/projects/${project.id}/${subguide.slug}`;
      const title = subguideTitle(subguide);
      return {
        path,
        title,
        description: subguide.description,
        markdown: guideToMarkdown(readGuideSource(subguide.path), {
          title,
          description: subguide.description,
          canonicalUrl: absoluteUrl(path),
        }),
      };
    }),
  }));
}

/** The llms.txt index: site summary plus one Markdown link per guide. */
export function buildLlmsTxt(sections: ProjectDocs[]): string {
  const lines = [`# ${SITE_TITLE}`, "", `> ${SITE_SUMMARY}`, ""];

  for (const { project, guides } of sections) {
    lines.push(`## ${project.title}`, "", project.description, "");
    for (const guide of guides) {
      lines.push(`- [${guide.title}](${absoluteUrl(`${guide.path}.md`)}): ${guide.description}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/** The llms-full.txt document: every guide's full Markdown, concatenated. */
export function buildLlmsFullTxt(sections: ProjectDocs[]): string {
  const docs = sections.flatMap(({ guides }) => guides.map((guide) => guide.markdown.trim()));
  return [`# ${SITE_TITLE}`, `> ${SITE_SUMMARY}`, ...docs].join("\n\n---\n\n") + "\n";
}

/** Minimal sitemap.xml for the prerendered routes. */
export function buildSitemap(paths: string[]): string {
  const urls = paths.map((path) => `  <url><loc>${absoluteUrl(path)}</loc></url>`);
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
}
