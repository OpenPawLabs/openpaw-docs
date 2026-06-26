import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { GuideHeaderMetadata } from "../src/catalog/types";
import { parseGuideHeader } from "../src/lib/guides/parseGuideHeader";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const guidesDir = join(rootDir, "public/guides");
const outputPath = join(rootDir, "src/guides-metadata.json");

function walkGuides(
  directory: string,
  metadata: Record<string, GuideHeaderMetadata>,
  prefix = "",
) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolutePath = join(directory, entry.name);

    if (entry.isDirectory()) {
      walkGuides(absolutePath, metadata, relativePath);
      continue;
    }

    if (entry.name !== "guide.mdx") {
      continue;
    }

    const source = readFileSync(absolutePath, "utf8");
    const header = parseGuideHeader(source);
    if (header) {
      metadata[relativePath.replace(/\/guide\.mdx$/, "")] = header;
    }
  }
}

function main() {
  if (!existsSync(guidesDir) || !statSync(guidesDir).isDirectory()) {
    console.error("public/guides/ not found. Run pnpm sync-guides first.");
    process.exit(1);
  }

  const metadata: Record<string, GuideHeaderMetadata> = {};
  walkGuides(guidesDir, metadata);

  writeFileSync(outputPath, `${JSON.stringify(metadata, null, 2)}\n`, "utf8");
  console.log(
    `Extracted metadata for ${Object.keys(metadata).length} guides → src/guides-metadata.json`,
  );
}

main();
