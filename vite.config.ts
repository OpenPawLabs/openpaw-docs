import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { remarkRewriteGuideAssets } from "./src/lib/mdx/remarkRewriteGuideAssets";
import { remarkStripGuideUiImports } from "./src/lib/mdx/remarkStripGuideUiImports";

export default defineConfig({
  base: "/",
  plugins: [
    {
      enforce: "pre",
      ...mdx({
        jsxImportSource: "react",
        remarkPlugins: [remarkStripGuideUiImports, remarkRewriteGuideAssets],
      }),
    },
    react(),
    tailwindcss(),
  ],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  ssr: {
    noExternal: [
      "@openpawlabs/diy-guides-ui",
      "@heroui/react",
      "@heroui/styles",
      /@react-aria/,
      /@react-stately/,
      /@internationalized/,
    ],
  },
});
