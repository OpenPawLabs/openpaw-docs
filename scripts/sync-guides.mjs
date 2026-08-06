import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const defaultSource = resolve(rootDir, "../diy-guides");
const sourceDir = resolve(process.env.DIY_GUIDES_PATH ?? defaultSource);
const destDir = join(rootDir, "public/guides");
const contentDir = join(rootDir, "src/content/guides");

const SKIP_NAMES = new Set([".git", "node_modules"]);

/** Build-time AVIF cache — keep across syncs so `generate-images` can skip. */
function isThumbnailsDir(destination, entryName) {
  return entryName === "thumbnails" && basename(destination) === "images";
}

/**
 * Mirror `source` → `destination`, preserving `images/thumbnails/` so responsive
 * derivatives survive `pnpm predev` / `prebuild` and can be skipped when fresh.
 */
function syncDirectory(source, destination) {
  mkdirSync(destination, { recursive: true });

  const sourceNames = new Set();

  for (const entry of readdirSync(source, { withFileTypes: true })) {
    if (SKIP_NAMES.has(entry.name)) {
      continue;
    }

    sourceNames.add(entry.name);
    const from = join(source, entry.name);
    const to = join(destination, entry.name);

    if (entry.isDirectory()) {
      syncDirectory(from, to);
      continue;
    }

    cpSync(from, to);
  }

  if (!existsSync(destination)) {
    return;
  }

  for (const entry of readdirSync(destination, { withFileTypes: true })) {
    if (sourceNames.has(entry.name) || SKIP_NAMES.has(entry.name)) {
      continue;
    }
    if (isThumbnailsDir(destination, entry.name)) {
      continue;
    }
    rmSync(join(destination, entry.name), { recursive: true, force: true });
  }
}

/** Copy each `guide.mdx` into `src/content/guides/` for Vite MDX compilation. */
function syncMdxContent(source, prefix = "", seen = new Set()) {
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    if (SKIP_NAMES.has(entry.name)) {
      continue;
    }

    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    const from = join(source, entry.name);

    if (entry.isDirectory()) {
      syncMdxContent(from, relativePath, seen);
      continue;
    }

    if (entry.name !== "guide.mdx") {
      continue;
    }

    const to = join(contentDir, prefix, "guide.mdx");
    mkdirSync(dirname(to), { recursive: true });
    cpSync(from, to);
    seen.add(prefix);
  }
}

function removeStaleContent(directory, prefix, seen) {
  if (!existsSync(directory)) {
    return;
  }

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolutePath = join(directory, entry.name);

    if (entry.isDirectory()) {
      removeStaleContent(absolutePath, relativePath, seen);
      if (readdirSync(absolutePath).length === 0) {
        rmSync(absolutePath, { recursive: true, force: true });
      }
      continue;
    }

    if (entry.name === "guide.mdx" && !seen.has(prefix)) {
      rmSync(absolutePath, { force: true });
    }
  }
}

function writeContentGitkeep() {
  mkdirSync(contentDir, { recursive: true });
  writeFileSync(join(contentDir, ".gitkeep"), "");
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

  mkdirSync(destDir, { recursive: true });
  syncDirectory(sourceDir, destDir);

  // Drop dest-only top-level project folders (except anything we intentionally keep)
  const sourceTop = new Set(
    readdirSync(sourceDir, { withFileTypes: true })
      .filter((e) => !SKIP_NAMES.has(e.name))
      .map((e) => e.name),
  );
  for (const entry of readdirSync(destDir, { withFileTypes: true })) {
    if (sourceTop.has(entry.name) || SKIP_NAMES.has(entry.name)) continue;
    rmSync(join(destDir, entry.name), { recursive: true, force: true });
  }

  mkdirSync(contentDir, { recursive: true });
  const seenMdx = new Set();
  syncMdxContent(sourceDir, "", seenMdx);
  removeStaleContent(contentDir, "", seenMdx);
  writeContentGitkeep();

  const relativeSource = relative(rootDir, sourceDir) || sourceDir;
  console.log(`Synced guides from ${relativeSource} → public/guides/`);
  console.log(`Synced ${seenMdx.size} guide.mdx → src/content/guides/`);
}

main();
