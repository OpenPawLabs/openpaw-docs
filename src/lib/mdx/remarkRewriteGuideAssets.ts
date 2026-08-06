import type { Root } from "mdast";
import type { Plugin } from "unified";
import { resolveGuideAssetPathname } from "../guides/assetPaths";

const URL_ATTRIBUTES = new Set(["src", "href", "thumbnail", "poster", "heroImage"]);

interface MdxAttribute {
  type: string;
  name?: string;
  value?: unknown;
}

interface MdxNode {
  type: string;
  children?: MdxNode[];
  attributes?: MdxAttribute[];
}

/**
 * Rewrite relative guide media URLs to site-absolute `/guides/<path>/…` paths
 * using the MDX file location under `src/content/guides/`.
 */
export const remarkRewriteGuideAssets: Plugin<[], Root> = () => {
  return (tree, file) => {
    const guidePath = guidePathFromFile(String(file.path ?? file.history[0] ?? ""));
    if (!guidePath) {
      return;
    }

    rewriteAttributes(tree as unknown as MdxNode, guidePath);
  };
};

export function guidePathFromFile(filePath: string): string | null {
  const normalized = filePath.replace(/\\/g, "/");
  const marker = "/content/guides/";
  const index = normalized.lastIndexOf(marker);
  if (index === -1) {
    return null;
  }

  const rest = normalized.slice(index + marker.length);
  if (!rest.endsWith("/guide.mdx")) {
    return null;
  }

  return rest.slice(0, -"/guide.mdx".length);
}

function rewriteAttributes(node: MdxNode, guidePath: string): void {
  for (const attribute of node.attributes ?? []) {
    if (
      attribute.type !== "mdxJsxAttribute" ||
      !attribute.name ||
      !URL_ATTRIBUTES.has(attribute.name) ||
      typeof attribute.value !== "string"
    ) {
      continue;
    }

    attribute.value = resolveGuideAssetPathname(guidePath, attribute.value);
  }

  for (const child of node.children ?? []) {
    rewriteAttributes(child, guidePath);
  }
}
