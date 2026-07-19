import type { ProjectEntry, SubguideEntry } from "./types";

/** Raw guide entry as authored in diy-guides `<projectId>/project.json`. */
export interface ProjectManifestGuide {
  /** Project-relative path, or repo-root-relative for shared guides (`common/…`). */
  path: string;
  description: string;
  /** Route slug override; defaults to the final path segment. */
  slug?: string;
  shared?: boolean;
  optional?: boolean;
}

/** Raw project manifest as authored in diy-guides. */
export interface ProjectManifest {
  id: string;
  title: string;
  description: string;
  /** Project-relative path of the overview guide (hero source). */
  overview: string;
  guides: ProjectManifestGuide[];
}

/** Resolve a manifest guide path to a repo-root path under `public/guides/`. */
export function resolveGuidePath(projectId: string, guidePath: string): string {
  const normalized = guidePath.replace(/\\/g, "/").replace(/^\/+/, "");

  if (normalized.includes("..")) {
    throw new Error(`Guide path must not contain '..': ${guidePath}`);
  }

  if (normalized.startsWith(`${projectId}/`) || !normalized.includes("/")) {
    // Project-local: bare slug (`0-overview`) or already-prefixed.
    return normalized.includes("/")
      ? normalized
      : `${projectId}/${normalized}`;
  }

  // Shared / other top-level folders (e.g. `common/0-onetime-tracker-setup`).
  return normalized;
}

/** Default route slug from a resolved or relative guide path. */
export function defaultGuideSlug(guidePath: string): string {
  const normalized = guidePath.replace(/\\/g, "/").replace(/\/+$/, "");
  const segment = normalized.split("/").pop();
  if (!segment) {
    throw new Error(`Cannot derive slug from empty path: ${guidePath}`);
  }
  return segment;
}

/** Humanized fallback title when MDX metadata is unavailable. */
export function humanizeSlug(slug: string): string {
  return slug
    .replace(/^\d+-/, "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** Convert a validated project manifest into a catalog `ProjectEntry`. */
export function projectManifestToEntry(manifest: ProjectManifest): ProjectEntry {
  if (!manifest.id?.trim()) {
    throw new Error("Project manifest is missing id");
  }
  if (!manifest.title?.trim()) {
    throw new Error(`Project ${manifest.id}: missing title`);
  }
  if (!manifest.description?.trim()) {
    throw new Error(`Project ${manifest.id}: missing description`);
  }
  if (!manifest.overview?.trim()) {
    throw new Error(`Project ${manifest.id}: missing overview`);
  }
  if (!Array.isArray(manifest.guides) || manifest.guides.length === 0) {
    throw new Error(`Project ${manifest.id}: guides must be a non-empty array`);
  }

  const overviewPath = resolveGuidePath(manifest.id, manifest.overview);
  const subguides: SubguideEntry[] = manifest.guides.map((guide, index) => {
    if (!guide.path?.trim()) {
      throw new Error(`Project ${manifest.id}: guides[${index}] is missing path`);
    }
    if (!guide.description?.trim()) {
      throw new Error(
        `Project ${manifest.id}: guides[${index}] (${guide.path}) is missing description`,
      );
    }

    const path = resolveGuidePath(manifest.id, guide.path);
    const slug = guide.slug?.trim() || defaultGuideSlug(path);

    return {
      slug,
      path,
      description: guide.description,
      ...(guide.shared ? { shared: true } : {}),
      ...(guide.optional ? { optional: true } : {}),
    };
  });

  if (!subguides.some((entry) => entry.path === overviewPath)) {
    throw new Error(
      `Project ${manifest.id}: overview "${manifest.overview}" is not listed in guides`,
    );
  }

  return {
    id: manifest.id,
    title: manifest.title,
    description: manifest.description,
    overviewPath,
    subguides,
  };
}
