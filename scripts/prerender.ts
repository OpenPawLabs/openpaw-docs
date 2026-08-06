import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { listPrerenderPaths } from "../src/lib/seo/pageMeta";

const rootDir = resolve(import.meta.dirname, "..");
const distDir = join(rootDir, "dist");
const ssrEntry = join(rootDir, "dist-ssr", "entry-server.js");

interface RenderResult {
  html: string;
  head: string;
}

async function main() {
  const template = readFileSync(join(distDir, "index.html"), "utf8");
  const { render } = (await import(pathToFileURL(ssrEntry).href)) as {
    render: (url: string) => Promise<RenderResult>;
  };

  const paths = listPrerenderPaths();
  console.log(`Prerendering ${paths.length} routes…`);

  for (const path of paths) {
    const { html, head } = await render(path);
    const documentHtml = injectRenderedApp(template, html, head);
    const outFile =
      path === "/" ? join(distDir, "index.html") : join(distDir, path.slice(1), "index.html");

    mkdirSync(dirname(outFile), { recursive: true });
    writeFileSync(outFile, documentHtml, "utf8");
    console.log(`  ${path} → ${outFile.replace(rootDir + "\\", "").replace(rootDir + "/", "")}`);
  }

  console.log("Prerender complete.");
}

function injectRenderedApp(template: string, appHtml: string, head: string): string {
  let output = template
    // Drop the Vite-dev fallback title/description; prerendered head replaces them.
    .replace(/<title>[^<]*<\/title>\s*/i, "")
    .replace(/<meta\s+name="description"[^>]*>\s*/i, "");

  if (output.includes("<!--app-head-->")) {
    output = output.replace("<!--app-head-->", head);
  } else {
    output = output.replace("</head>", `    ${head}\n  </head>`);
  }

  if (output.includes('<div id="root"></div>')) {
    output = output.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
  } else if (output.includes('<div id="root">')) {
    output = output.replace(
      /<div id="root">[\s\S]*?<\/div>/,
      `<div id="root">${appHtml}</div>`,
    );
  } else {
    throw new Error('Could not find <div id="root"> in dist/index.html');
  }

  return output;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
