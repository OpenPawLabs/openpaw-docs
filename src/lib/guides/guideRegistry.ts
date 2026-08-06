import type { GuideMdxComponent } from "../mdx/guideComponents";

const guideModules = import.meta.glob<{ default: GuideMdxComponent }>(
  "../../content/guides/**/guide.mdx",
);

const guideCache = new Map<string, GuideMdxComponent>();

function moduleKey(guidePath: string): string {
  return `../../content/guides/${guidePath}/guide.mdx`;
}

/** Guide paths that have a compiled MDX module (content-relative, no `guide.mdx`). */
export function listGuidePaths(): string[] {
  return Object.keys(guideModules).map((key) =>
    key
      .replace(/^\.\.\/\.\.\/content\/guides\//, "")
      .replace(/\/guide\.mdx$/, ""),
  );
}

export function hasGuideModule(guidePath: string): boolean {
  return moduleKey(guidePath) in guideModules;
}

export function getCachedGuide(guidePath: string): GuideMdxComponent | undefined {
  return guideCache.get(guidePath);
}

/** Load (and cache) a guide MDX module by diy-guides path. */
export async function loadGuideModule(guidePath: string): Promise<GuideMdxComponent> {
  const cached = guideCache.get(guidePath);
  if (cached) {
    return cached;
  }

  const loader = guideModules[moduleKey(guidePath)];
  if (!loader) {
    throw new Error(`No compiled guide module for "${guidePath}".`);
  }

  const mod = await loader();
  guideCache.set(guidePath, mod.default);
  return mod.default;
}
