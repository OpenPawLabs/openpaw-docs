/** True for absolute URLs (`https:…`, `//…`) — leave those untouched. */
export function isAbsoluteAssetUrl(value: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(value) || value.startsWith("//");
}

/**
 * Resolve a guide-relative asset to a site-absolute pathname under `/guides/`.
 * Example: (`bb-lsm6dsv/0-overview`, `./images/a.webp`) → `/guides/bb-lsm6dsv/0-overview/images/a.webp`
 */
export function resolveGuideAssetPathname(guidePath: string, relativeUrl: string): string {
  if (!relativeUrl || isAbsoluteAssetUrl(relativeUrl) || relativeUrl.startsWith("/")) {
    return relativeUrl;
  }

  const base = `/guides/${guidePath}/`;
  return new URL(relativeUrl, `https://example.local${base}`).pathname;
}
