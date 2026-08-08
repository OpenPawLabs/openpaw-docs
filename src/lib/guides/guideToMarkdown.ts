import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";
import {
  attributeText,
  childElements,
  findChildElement,
  findJsxElement,
  isJsxElement,
  sliceSource,
  stringAttribute,
  textContent,
  type MdxNode,
} from "./mdxAst";

export interface GuideMarkdownOptions {
  /** Fallback when the MDX header has no title. */
  title?: string;
  /** One-line summary rendered under the title. */
  description?: string;
  /** Absolute URL of the rendered HTML page (with images), noted in the doc. */
  canonicalUrl?: string;
}

/**
 * Convert a `guide.mdx` source into plain, self-contained Markdown for AI
 * agents and text-only readers: header metadata, intro, tool/material lists,
 * and numbered steps with their instruction bullets. Media (images/video) and
 * purely visual affordances (bullet colors, annotations) are omitted.
 */
export function guideToMarkdown(source: string, options: GuideMarkdownOptions = {}): string {
  const tree = unified().use(remarkParse).use(remarkMdx).parse(source) as MdxNode;
  const layout = findJsxElement(tree, "GuideLayout");
  if (!layout) {
    return "";
  }

  const header = findChildElement(layout, "GuideLayout.Header");
  const title = (header && stringAttribute(header, "title")) || options.title || "Guide";
  const sections: string[] = [`# ${decodeEntities(title)}`];

  if (options.description) {
    sections.push(options.description);
  }

  const facts = [
    header && stringAttribute(header, "difficulty") && `Difficulty: ${stringAttribute(header, "difficulty")}`,
    header && stringAttribute(header, "timeEstimate") && `Time: ${stringAttribute(header, "timeEstimate")}`,
  ].filter(Boolean);
  if (facts.length > 0) {
    sections.push(facts.join(" · "));
  }

  if (options.canonicalUrl) {
    sections.push(`> Illustrated web version: ${options.canonicalUrl}`);
  }

  const intro = findChildElement(layout, "GuideLayout.Intro");
  if (intro) {
    const text = proseText(source, intro);
    if (text) {
      sections.push(text);
    }
  }

  const sidebar = findChildElement(layout, "GuideLayout.Sidebar");
  for (const toolList of sidebar ? childElements(sidebar, "ToolList") : []) {
    const items = childElements(toolList, "ToolList.Item").map((item) => toolItemLine(item));
    if (items.length > 0) {
      sections.push(`## ${stringAttribute(toolList, "title") ?? "Tools"}\n\n${items.join("\n")}`);
    }
  }

  const content = findChildElement(layout, "GuideLayout.Content");
  const stepList = content && findChildElement(content, "GuideStepList");
  if (stepList) {
    childElements(stepList, "GuideStep").forEach((step, index) => {
      sections.push(stepMarkdown(source, step, index + 1));
    });
  }

  return `${sections.join("\n\n")}\n`;
}

function stepMarkdown(source: string, step: MdxNode, number: number): string {
  const title = stringAttribute(step, "title") ?? `Step ${number}`;
  const bullets = findChildElement(step, "GuideStep.Bullets");
  const lines = (bullets ? childElements(bullets, "GuideStep.Bullet") : []).flatMap((bullet) =>
    bulletLines(source, bullet),
  );

  return [`## Step ${number}: ${decodeEntities(title)}`, ...lines].join("\n\n");
}

function bulletLines(source: string, bullet: MdxNode): string[] {
  const linkButton = findChildElement(bullet, "LinkButton");
  if (linkButton) {
    return childElements(linkButton, "LinkButton.Item").map((item) => {
      const href = stringAttribute(item, "href") ?? "";
      return `- [${textContent(item).trim()}](${href})`;
    });
  }

  const variant = stringAttribute(bullet, "variant");
  const prefix =
    variant && variant !== "dot" ? `**${variant[0].toUpperCase()}${variant.slice(1)}:** ` : "";
  const text = proseText(source, bullet).replace(/\s*\n\s*/g, " ");
  return text ? [`- ${prefix}${text}`] : [];
}

/** Markdown of an element's non-JSX block children, with JSX indentation removed. */
function proseText(source: string, node: MdxNode): string {
  return (node.children ?? [])
    .filter((child) => !isJsxElement(child))
    .map((child) => sliceSource(source, child).replace(/\n[ \t]+/g, "\n").trim())
    .filter(Boolean)
    .join("\n\n");
}

function toolItemLine(item: MdxNode): string {
  const name = stringAttribute(item, "name") ?? "Item";
  const quantity = attributeText(item, "quantity");
  const price = stringAttribute(item, "price");
  const href = stringAttribute(item, "href");

  let line = `- ${name}`;
  if (quantity) line += ` ×${quantity}`;
  if (price) line += ` — ${price}`;
  if (href) line += ` — [source](${href})`;
  return line;
}

function decodeEntities(value: string): string {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"');
}
