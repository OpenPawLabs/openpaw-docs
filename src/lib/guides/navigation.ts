import type { ProjectEntry, SubguideEntry } from "../../catalog/types";
import { getGuideMetadata } from "./metadata";

export interface GuideNavLink {
  slug: string;
  title: string;
  optional?: boolean;
  shared?: boolean;
}

export interface GuideNavigation {
  /** Zero-based position of the current subguide within the project. */
  index: number;
  /** Total number of subguides in the project. */
  total: number;
  prev?: GuideNavLink;
  next?: GuideNavLink;
}

/** Authored title (from MDX metadata) with catalog fallback. */
export function subguideTitle(subguide: SubguideEntry): string {
  return getGuideMetadata(subguide.path)?.title ?? subguide.title;
}

function toLink(subguide: SubguideEntry): GuideNavLink {
  return {
    slug: subguide.slug,
    title: subguideTitle(subguide),
    optional: subguide.optional,
    shared: subguide.shared,
  };
}

/** Adjacency (prev/next) for a subguide, derived from the ordered catalog. */
export function getGuideNavigation(
  project: ProjectEntry,
  slug: string,
): GuideNavigation | undefined {
  const index = project.subguides.findIndex((entry) => entry.slug === slug);
  if (index === -1) {
    return undefined;
  }

  const { subguides } = project;
  return {
    index,
    total: subguides.length,
    prev: index > 0 ? toLink(subguides[index - 1]) : undefined,
    next: index < subguides.length - 1 ? toLink(subguides[index + 1]) : undefined,
  };
}
