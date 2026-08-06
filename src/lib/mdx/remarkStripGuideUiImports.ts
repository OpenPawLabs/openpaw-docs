import type { Root } from "mdast";
import type { Plugin } from "unified";

const GUIDE_UI_PACKAGE = "@openpawlabs/diy-guides-ui";

interface MdxEsmNode {
  type: string;
  value?: string;
}

/**
 * Drop ESM import declarations for the guide UI package so JSX tags resolve
 * through the MDX `components` prop (site wrappers) instead of bare imports.
 */
export const remarkStripGuideUiImports: Plugin<[], Root> = () => {
  return (tree) => {
    tree.children = tree.children.filter((node) => {
      const candidate = node as MdxEsmNode;
      if (candidate.type !== "mdxjsEsm") {
        return true;
      }

      return !candidate.value?.includes(GUIDE_UI_PACKAGE);
    });
  };
};
