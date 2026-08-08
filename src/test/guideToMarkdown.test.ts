import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { guideToMarkdown } from "../lib/guides/guideToMarkdown";

const overviewSource = readFileSync(
  join(__dirname, "../../public/guides/bb-lsm6dsv/0-overview/guide.mdx"),
  "utf8",
);

describe("guideToMarkdown", () => {
  const markdown = guideToMarkdown(overviewSource, {
    description: "Gather the tools and materials you'll need.",
    canonicalUrl: "https://docs.openpawlabs.com/projects/bb-lsm6dsv/0-overview",
  });

  it("renders the header, facts, and canonical link", () => {
    expect(markdown).toMatch(/^# Project Overview\n/);
    expect(markdown).toContain("Difficulty: easy · Time: 15 minutes");
    expect(markdown).toContain(
      "> Illustrated web version: https://docs.openpawlabs.com/projects/bb-lsm6dsv/0-overview",
    );
  });

  it("renders intro prose and tool/material lists with quantity, price, and links", () => {
    expect(markdown).toContain("Building your own trackers is very simple");
    expect(markdown).toContain("## Tools");
    expect(markdown).toContain("## Materials");
    expect(markdown).toContain("- 3D Printer ×1");
    expect(markdown).toContain(
      "- Tracker Boards ×8 — $25/ea — [source](https://openpawlabs.com/products/diy-slimevr-tracker#kit)",
    );
  });

  it("renders numbered steps with bullets, preserving inline markdown", () => {
    expect(markdown).toContain("## Step 1: Gather Tools");
    expect(markdown).toContain("## Step 2: Get Tracker & Charging Dock Boards");
    expect(markdown).toContain("**#1 tip**");
    expect(markdown).toContain("[local Makerspace](https://makerspace.com/map/)");
  });

  it("renders semantic bullet variants as bold prefixes and LinkButtons as links", () => {
    expect(markdown).toContain("- **Note:**");
    expect(markdown).toContain(
      "- [Find a Makerspace here!](https://makerspace.com/map/)",
    );
  });

  it("emits no JSX", () => {
    expect(markdown).not.toMatch(/<[A-Z]/);
    expect(markdown).not.toContain("MediaFigure");
  });

  it("returns an empty string for non-guide sources", () => {
    expect(guideToMarkdown("# Just markdown\n\nNo layout here.")).toBe("");
  });
});
