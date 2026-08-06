import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { remarkRewriteGuideAssets } from "./src/lib/mdx/remarkRewriteGuideAssets";
import { remarkStripGuideUiImports } from "./src/lib/mdx/remarkStripGuideUiImports";

export default defineConfig({
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
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
  },
});
