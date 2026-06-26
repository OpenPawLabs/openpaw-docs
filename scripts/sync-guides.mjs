import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const defaultSource = resolve(rootDir, "../diy-guides");
const sourceDir = resolve(process.env.DIY_GUIDES_PATH ?? defaultSource);
const destDir = join(rootDir, "public/guides");

const SKIP_NAMES = new Set([".git", "node_modules"]);

function syncDirectory(source, destination) {
  mkdirSync(destination, { recursive: true });

  for (const entry of readdirSync(source, { withFileTypes: true })) {
    if (SKIP_NAMES.has(entry.name)) {
      continue;
    }

    const from = join(source, entry.name);
    const to = join(destination, entry.name);

    if (entry.isDirectory()) {
      syncDirectory(from, to);
      continue;
    }

    cpSync(from, to);
  }
}

function main() {
  if (!existsSync(sourceDir)) {
    console.error(
      `Guide source not found at ${sourceDir}. Clone diy-guides alongside openpaw-docs or set DIY_GUIDES_PATH.`,
    );
    process.exit(1);
  }

  if (!statSync(sourceDir).isDirectory()) {
    console.error(`DIY_GUIDES_PATH must be a directory: ${sourceDir}`);
    process.exit(1);
  }

  rmSync(destDir, { recursive: true, force: true });
  syncDirectory(sourceDir, destDir);

  const relativeSource = relative(rootDir, sourceDir) || sourceDir;
  console.log(`Synced guides from ${relativeSource} → public/guides/`);
}

main();
