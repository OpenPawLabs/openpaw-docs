import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  projectManifestToEntry,
  type ProjectManifest,
} from "../src/catalog/manifest";
import type { ProjectEntry } from "../src/catalog/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const guidesDir = join(rootDir, "public/guides");
const outputPath = join(rootDir, "src/catalog/projects.generated.json");

function readManifest(filePath: string): ProjectManifest {
  const raw = JSON.parse(readFileSync(filePath, "utf8")) as ProjectManifest;
  return raw;
}

function assertGuideExists(guidesRoot: string, guidePath: string, label: string) {
  const mdxPath = join(guidesRoot, guidePath, "guide.mdx");
  if (!existsSync(mdxPath)) {
    throw new Error(`${label}: missing ${guidePath}/guide.mdx`);
  }
}

function loadProjects(guidesRoot: string): ProjectEntry[] {
  const entries = readdirSync(guidesRoot, { withFileTypes: true });
  const projects: ProjectEntry[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const manifestPath = join(guidesRoot, entry.name, "project.json");
    if (!existsSync(manifestPath)) {
      continue;
    }

    const manifest = readManifest(manifestPath);
    if (manifest.id !== entry.name) {
      throw new Error(
        `${manifestPath}: id "${manifest.id}" must match folder name "${entry.name}"`,
      );
    }

    const project = projectManifestToEntry(manifest);

    for (const subguide of project.subguides) {
      assertGuideExists(
        guidesRoot,
        subguide.path,
        `Project ${project.id} guide "${subguide.slug}"`,
      );
    }

    assertGuideExists(
      guidesRoot,
      project.overviewPath,
      `Project ${project.id} overview`,
    );

    projects.push(project);
  }

  projects.sort((a, b) => a.id.localeCompare(b.id));
  return projects;
}

function main() {
  if (!existsSync(guidesDir)) {
    console.error("public/guides/ not found. Run pnpm sync-guides first.");
    process.exit(1);
  }

  try {
    const projects = loadProjects(guidesDir);
    if (projects.length === 0) {
      throw new Error(
        "No project.json manifests found under public/guides/*/project.json",
      );
    }

    writeFileSync(outputPath, `${JSON.stringify(projects, null, 2)}\n`, "utf8");
    console.log(
      `Generated catalog for ${projects.length} project(s) → src/catalog/projects.generated.json`,
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
