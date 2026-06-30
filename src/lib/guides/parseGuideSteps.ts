import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";
import type { GuideStepMetadata } from "../../catalog/types";
import {
  childElements,
  findChildElement,
  findJsxElement,
  isJsxElement,
  stringAttribute,
  type MdxNode,
} from "./mdxAst";

export function parseGuideSteps(source: string): GuideStepMetadata[] {
  const tree = unified().use(remarkParse).use(remarkMdx).parse(source) as MdxNode;
  const layout = findJsxElement(tree, "GuideLayout");
  if (!layout) {
    return [];
  }

  const content = findChildElement(layout, "GuideLayout.Content");
  if (!content) {
    return [];
  }

  const stepList = findChildElement(content, "GuideStepList");
  if (!stepList) {
    return [];
  }

  return childElements(stepList, "GuideStep").map((step) => ({
    title: stringAttribute(step, "title"),
  }));
}

export { isJsxElement };
