import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";
import type { GuideHeaderMetadata } from "../../catalog/types";

interface MdxNode {
  type: string;
  name?: string;
  children?: MdxNode[];
  attributes?: Array<{ name?: string; value?: unknown }>;
}

export function parseGuideHeader(source: string): GuideHeaderMetadata | null {
  const tree = unified().use(remarkParse).use(remarkMdx).parse(source) as MdxNode;
  const layout = findJsxElement(tree, "GuideLayout");
  if (!layout) {
    return null;
  }

  const header = findChildElement(layout, "GuideLayout.Header");
  if (!header) {
    return null;
  }

  return {
    title: stringAttribute(header, "title"),
    difficulty: stringAttribute(header, "difficulty") as GuideHeaderMetadata["difficulty"],
    timeEstimate: stringAttribute(header, "timeEstimate"),
    meta: stringAttribute(header, "meta"),
    heroImage: stringAttribute(header, "heroImage"),
    heroImageAlt: stringAttribute(header, "heroImageAlt"),
  };
}

function findJsxElement(node: MdxNode, name: string): MdxNode | null {
  if (isJsxElement(node) && node.name === name) {
    return node;
  }

  for (const child of node.children ?? []) {
    const found = findJsxElement(child, name);
    if (found) {
      return found;
    }
  }

  return null;
}

function findChildElement(node: MdxNode, name: string): MdxNode | null {
  return childElements(node, name)[0] ?? null;
}

function childElements(node: MdxNode, name?: string): MdxNode[] {
  const children = (node.children ?? []).flatMap((child) => {
    if (isJsxElement(child)) {
      return [child];
    }

    if (child.type === "paragraph") {
      return (child.children ?? []).filter(isJsxElement);
    }

    return [];
  });

  return name ? children.filter((child) => child.name === name) : children;
}

function isJsxElement(node: MdxNode): boolean {
  return node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement";
}

function stringAttribute(node: MdxNode, attributeName: string): string | undefined {
  const attr = node.attributes?.find((candidate) => candidate.name === attributeName);
  return typeof attr?.value === "string" ? attr.value : undefined;
}
