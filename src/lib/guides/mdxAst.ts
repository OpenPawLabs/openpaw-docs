export interface MdxNode {
  type: string;
  name?: string;
  children?: MdxNode[];
  attributes?: Array<{ name?: string; value?: unknown }>;
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
