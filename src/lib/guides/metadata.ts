import type { GuideHeaderMetadata, GuidesMetadataMap } from "../../catalog/types";
import metadata from "../../guides-metadata.json";

const guidesMetadata = metadata as GuidesMetadataMap;

export function getGuideMetadata(guidePath: string): GuideHeaderMetadata | undefined {
  return guidesMetadata[guidePath];
}

/** Turn a guide-relative asset path into a site URL under `/guides/`. */
export function resolveGuideAsset(guidePath: string, relativeUrl: string): string {
  if (!relativeUrl) {
    return relativeUrl;
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(relativeUrl) || relativeUrl.startsWith("//")) {
    return relativeUrl;
  }

  const origin =
    typeof window !== "undefined" ? window.location.origin : "http://localhost";
  const base = new URL(
    `${import.meta.env.BASE_URL}guides/${guidePath}/`,
    origin,
  ).href;
  return new URL(relativeUrl, base).pathname;
}

export function resolveHeroImage(
  guidePath: string,
  header?: GuideHeaderMetadata,
): { src?: string; alt?: string } {
  if (!header?.heroImage) {
    return {};
  }

  return {
    src: resolveGuideAsset(guidePath, header.heroImage),
    alt: header.heroImageAlt ?? "",
  };
}

export function guideMdxUrl(guidePath: string): string {
  return `${import.meta.env.BASE_URL}guides/${guidePath}/guide.mdx`;
}

export function guideBaseUrl(guidePath: string): string {
  return new URL(`${import.meta.env.BASE_URL}guides/${guidePath}/`, window.location.origin)
    .href;
}

export { guidesMetadata };
