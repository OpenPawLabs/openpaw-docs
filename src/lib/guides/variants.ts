import {
  GUIDE_IMAGE_VARIANTS_PATH,
  type GuideImageVariantsManifest,
} from "@openpawlabs/diy-guides-ui";

const variantsCache = new Map<string, GuideImageVariantsManifest | null>();

export function getCachedVariants(
  guidePath: string,
): GuideImageVariantsManifest | null | undefined {
  return variantsCache.has(guidePath) ? variantsCache.get(guidePath) : undefined;
}

export function guideVariantsUrl(guidePath: string): string {
  const base = `${import.meta.env.BASE_URL}guides/${guidePath}/`;
  return new URL(GUIDE_IMAGE_VARIANTS_PATH, `https://example.local${base}`).pathname;
}

/** Load (and cache) `variants.json` for a guide — filesystem on SSR, fetch in the browser. */
export async function loadVariantsManifest(
  guidePath: string,
): Promise<GuideImageVariantsManifest | null> {
  if (variantsCache.has(guidePath)) {
    return variantsCache.get(guidePath) ?? null;
  }

  if (import.meta.env.SSR) {
    const manifest = await loadVariantsFromDisk(guidePath);
    variantsCache.set(guidePath, manifest);
    return manifest;
  }

  try {
    const response = await fetch(guideVariantsUrl(guidePath));
    if (!response.ok) {
      variantsCache.set(guidePath, null);
      return null;
    }

    const manifest = (await response.json()) as GuideImageVariantsManifest;
    variantsCache.set(guidePath, manifest);
    return manifest;
  } catch {
    variantsCache.set(guidePath, null);
    return null;
  }
}

async function loadVariantsFromDisk(
  guidePath: string,
): Promise<GuideImageVariantsManifest | null> {
  try {
    const { existsSync, readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const filePath = join(
      process.cwd(),
      "public/guides",
      guidePath,
      GUIDE_IMAGE_VARIANTS_PATH,
    );

    if (!existsSync(filePath)) {
      return null;
    }

    return JSON.parse(readFileSync(filePath, "utf8")) as GuideImageVariantsManifest;
  } catch {
    return null;
  }
}
