export interface MdxNode {
  type: string;
  name?: string;
  value?: string;
  children?: MdxNode[];
  attributes?: Array<{ name?: string; value?: unknown }>;
  position?: { start: { offset?: number }; end: { offset?: number } };
}

export function isJsxElement(node: MdxNode): boolean {
  return node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement";
}

export function findJsxElement(node: MdxNode, name: string): MdxNode | null {
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

export function findChildElement(node: MdxNode, name: string): MdxNode | null {
  return childElements(node, name)[0] ?? null;
}

export function childElements(node: MdxNode, name?: string): MdxNode[] {
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

export function stringAttribute(node: MdxNode, attributeName: string): string | undefined {
  const attr = node.attributes?.find((candidate) => candidate.name === attributeName);
  return typeof attr?.value === "string" ? attr.value : undefined;
}

/** Attribute text for string literals *and* expressions (e.g. `quantity={8}` → "8"). */
export function attributeText(node: MdxNode, attributeName: string): string | undefined {
  const value = node.attributes?.find((candidate) => candidate.name === attributeName)?.value;
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object" && "value" in value) {
    const expression = (value as { value?: unknown }).value;
    return typeof expression === "string" ? expression : undefined;
  }

  return undefined;
}

/** Concatenated plain text of a node's text descendants. */
export function textContent(node: MdxNode): string {
  if (node.type === "text") {
    return node.value ?? "";
  }

  return (node.children ?? []).map(textContent).join("");
}

/** The original markdown source backing a node, via its parse position. */
export function sliceSource(source: string, node: MdxNode): string {
  const start = node.position?.start.offset;
  const end = node.position?.end.offset;
  return start != null && end != null ? source.slice(start, end) : "";
}
