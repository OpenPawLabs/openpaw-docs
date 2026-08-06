import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { resolveGuideAssetPathname } from "../guides/assetPaths";

const URL_ATTRIBUTES = new Set(["src", "href", "thumbnail", "poster", "heroImage"]);

/**
 * Rewrite relative asset attributes in MDX source to site-absolute `/guides/…` paths.
 * Prefer the remark plugin at compile time; this remains for unit tests and tooling.
 */
export function rewriteAssetUrls(source: string, guidePath: string): string {
  const tree = unified().use(remarkParse).use(remarkMdx).parse(source) as MdxNode;
  const edits: Edit[] = [];

  collectAttributeEdits(tree, guidePath, edits);

  edits.sort((a, b) => b.start - a.start);
  let output = source;
  for (const edit of edits) {
    output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
  }

  return output;
}

interface Edit {
  start: number;
  end: number;
  text: string;
}

interface MdxAttribute {
  type: string;
  name?: string;
  value?: unknown;
  position?: { start: { offset: number }; end: { offset: number } };
}

interface MdxNode {
  type: string;
  children?: MdxNode[];
  attributes?: MdxAttribute[];
}

function collectAttributeEdits(
  node: MdxNode,
  guidePath: string,
  edits: Edit[],
): void {
  for (const attribute of node.attributes ?? []) {
    if (
      attribute.type !== "mdxJsxAttribute" ||
      !attribute.name ||
      !URL_ATTRIBUTES.has(attribute.name) ||
      typeof attribute.value !== "string" ||
      !attribute.position
    ) {
      continue;
    }

    const resolved = resolveGuideAssetPathname(guidePath, attribute.value);
    if (resolved === attribute.value) {
      continue;
    }

    edits.push({
      start: attribute.position.start.offset,
      end: attribute.position.end.offset,
      text: `${attribute.name}="${resolved.replaceAll('"', "%22")}"`,
    });
  }

  for (const child of node.children ?? []) {
    collectAttributeEdits(child, guidePath, edits);
  }
}
