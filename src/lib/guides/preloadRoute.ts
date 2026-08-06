import { getProject, getSubguide } from "../../catalog/projects";
import { loadGuideModule } from "./guideRegistry";
import { loadVariantsManifest } from "./variants";

/** Match `/projects/:projectId/:guideSlug` and return the content guide path. */
export function guidePathFromRoute(pathname: string): string | null {
  const match = /^\/projects\/([^/]+)\/([^/]+)\/?$/.exec(pathname);
  if (!match) {
    return null;
  }

  const project = getProject(match[1]);
  if (!project) {
    return null;
  }

  return getSubguide(project, match[2])?.path ?? null;
}

/** Warm guide + variants caches before SSR render or client hydration. */
export async function preloadRouteData(pathname: string): Promise<void> {
  const guidePath = guidePathFromRoute(pathname);
  if (!guidePath) {
    return;
  }

  await Promise.all([loadGuideModule(guidePath), loadVariantsManifest(guidePath)]);
}
