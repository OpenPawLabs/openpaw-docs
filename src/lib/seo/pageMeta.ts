import { projects } from "../../catalog/projects";
import type { ProjectEntry } from "../../catalog/types";
import { getGuideMetadata, resolveHeroImage } from "../guides/metadata";
import { subguideTitle } from "../guides/navigation";

export const SITE_ORIGIN = "https://docs.openpawlabs.com";
export const DEFAULT_DESCRIPTION =
  "OpenPaw Labs DIY guides — step-by-step maker projects for VR and hardware.";
export const DEFAULT_TITLE = "Docs | OpenPaw Labs";

export interface PageMeta {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  /** Site path of the plain-Markdown mirror of this page (guide pages only). */
  markdownPath?: string;
  /** schema.org JSON-LD embedded in the page head (HowTo for guide pages). */
  structuredData?: Record<string, unknown>;
}

export function absoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_ORIGIN}${normalized}`;
}

export function listPrerenderPaths(): string[] {
  const paths = ["/"];

  for (const project of projects) {
    paths.push(`/projects/${project.id}`);
    for (const subguide of project.subguides) {
      paths.push(`/projects/${project.id}/${subguide.slug}`);
    }
  }

  return paths;
}

export function getPageMeta(path: string): PageMeta {
  if (path === "/") {
    return {
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      path: "/",
    };
  }

  const projectMatch = /^\/projects\/([^/]+)(?:\/([^/]+))?$/.exec(path);
  if (!projectMatch) {
    return {
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      path,
    };
  }

  const projectId = projectMatch[1];
  const guideSlug = projectMatch[2];
  const project = projects.find((entry) => entry.id === projectId);

  if (!project) {
    return {
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      path,
    };
  }

  if (!guideSlug) {
    const hero = resolveHeroImage(
      project.overviewPath,
      getGuideMetadata(project.overviewPath),
    );
    return {
      title: `${project.title} | OpenPaw Labs Docs`,
      description: project.description || DEFAULT_DESCRIPTION,
      path: `/projects/${project.id}`,
      image: hero.src ? absoluteUrl(hero.src) : undefined,
      imageAlt: hero.alt || project.title,
    };
  }

  return guidePageMeta(project, guideSlug);
}

function guidePageMeta(project: ProjectEntry, guideSlug: string): PageMeta {
  const subguide = project.subguides.find((entry) => entry.slug === guideSlug);
  const path = `/projects/${project.id}/${guideSlug}`;

  if (!subguide) {
    return {
      title: `${project.title} | OpenPaw Labs Docs`,
      description: project.description || DEFAULT_DESCRIPTION,
      path,
    };
  }

  const metadata = getGuideMetadata(subguide.path);
  const title = subguideTitle(subguide);
  const hero = resolveHeroImage(subguide.path, metadata);
  const description = subguide.description || project.description || DEFAULT_DESCRIPTION;
  const image = hero.src ? absoluteUrl(hero.src) : undefined;
  const steps = metadata?.steps ?? [];

  return {
    title: `${title} | ${project.title}`,
    description,
    path,
    image,
    imageAlt: hero.alt || title,
    markdownPath: `${path}.md`,
    structuredData:
      steps.length > 0
        ? howToStructuredData(title, description, path, steps, image, metadata?.timeEstimate)
        : undefined,
  };
}

function howToStructuredData(
  name: string,
  description: string,
  path: string,
  steps: Array<{ title?: string }>,
  image: string | undefined,
  timeEstimate: string | undefined,
): Record<string, unknown> {
  const totalTime = isoDuration(timeEstimate);
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    ...(image ? { image } : {}),
    ...(totalTime ? { totalTime } : {}),
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.title ?? `Step ${index + 1}`,
      url: `${absoluteUrl(path)}#step-${index + 1}`,
    })),
  };
}

/** "15 minutes" → "PT15M", "1-2 hours" → "PT2H"; undefined when unparseable. */
function isoDuration(timeEstimate: string | undefined): string | undefined {
  const match = /(?:(\d+)\s*-\s*)?(\d+)\s*(minute|min|hour|hr)/i.exec(timeEstimate ?? "");
  if (!match) {
    return undefined;
  }

  const amount = Number(match[2]);
  return /^h/i.test(match[3]) ? `PT${amount}H` : `PT${amount}M`;
}

/** Serialize page meta into tags injected into the HTML shell. */
export function renderPageHead(meta: PageMeta): string {
  const url = absoluteUrl(meta.path);
  const tags = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<link rel="canonical" href="${escapeHtml(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(url)}" />`,
    `<meta name="twitter:card" content="${meta.image ? "summary_large_image" : "summary"}" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
  ];

  if (meta.image) {
    tags.push(`<meta property="og:image" content="${escapeHtml(meta.image)}" />`);
    tags.push(`<meta name="twitter:image" content="${escapeHtml(meta.image)}" />`);
    if (meta.imageAlt) {
      tags.push(
        `<meta property="og:image:alt" content="${escapeHtml(meta.imageAlt)}" />`,
      );
    }
  }

  if (meta.markdownPath) {
    tags.push(
      `<link rel="alternate" type="text/markdown" href="${escapeHtml(absoluteUrl(meta.markdownPath))}" />`,
    );
  }

  if (meta.structuredData) {
    // Escape "<" so a "</script>" inside string values cannot break out of the tag.
    const json = JSON.stringify(meta.structuredData).replaceAll("<", "\\u003c");
    tags.push(`<script type="application/ld+json">${json}</script>`);
  }

  return tags.join("\n    ");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
