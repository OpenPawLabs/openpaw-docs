import type { GuideMetadata, GuideStepMetadata, GuidesMetadataMap } from "../../catalog/types";
import metadata from "../../guides-metadata.json";
import { resolveGuideAssetPathname } from "./assetPaths";

const guidesMetadata = metadata as GuidesMetadataMap;

export function getGuideMetadata(guidePath: string): GuideMetadata | undefined {
  return guidesMetadata[guidePath];
}

export function getGuideSteps(guidePath: string): GuideStepMetadata[] {
  return guidesMetadata[guidePath]?.steps ?? [];
}

/** Turn a guide-relative asset path into a site URL under `/guides/`. */
export function resolveGuideAsset(guidePath: string, relativeUrl: string): string {
  return resolveGuideAssetPathname(guidePath, relativeUrl);
}

export function resolveHeroImage(
  guidePath: string,
  header?: GuideMetadata,
): { src?: string; alt?: string } {
  if (!header?.heroImage) {
    return {};
  }

  return {
    src: resolveGuideAsset(guidePath, header.heroImage),
    alt: header.heroImageAlt ?? "",
  };
}

export { guidesMetadata };
