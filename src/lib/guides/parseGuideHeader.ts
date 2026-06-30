import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";
import type { GuideHeaderMetadata } from "../../catalog/types";
import {
  findChildElement,
  findJsxElement,
  stringAttribute,
  type MdxNode,
} from "./mdxAst";

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
