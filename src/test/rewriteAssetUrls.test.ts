import { describe, expect, it } from "vitest";
import { rewriteAssetUrls } from "../lib/mdx/rewriteAssetUrls";
import { guidePathFromFile } from "../lib/mdx/remarkRewriteGuideAssets";

const GUIDE_PATH = "bb-lsm6dsv/0-overview";

describe("rewriteAssetUrls", () => {
  it("rewrites heroImage on GuideLayout.Header to a site-absolute path", () => {
    const source = `<GuideLayout>
  <GuideLayout.Header
    title="Overview Guide"
    heroImage="./images/trackers-with-dock-wip-1.png"
    heroImageAlt="Trackers on a dock"
  />
</GuideLayout>`;

    const output = rewriteAssetUrls(source, GUIDE_PATH);

    expect(output).toContain(
      'heroImage="/guides/bb-lsm6dsv/0-overview/images/trackers-with-dock-wip-1.png"',
    );
    expect(output).toContain('heroImageAlt="Trackers on a dock"');
  });

  it("rewrites LinkButton.Item href to a site-absolute path", () => {
    const source = `<GuideStep.Bullet variant="button">
  <LinkButton>
    <LinkButton.Item href="./files/openpaw-tracker-case-v7.stl" download>
      Download STL
    </LinkButton.Item>
  </LinkButton>
</GuideStep.Bullet>`;

    const output = rewriteAssetUrls(source, GUIDE_PATH);

    expect(output).toContain(
      'href="/guides/bb-lsm6dsv/0-overview/files/openpaw-tracker-case-v7.stl"',
    );
    expect(output).toContain("download");
  });
});

describe("guidePathFromFile", () => {
  it("extracts the guide path from a content MDX file path", () => {
    expect(
      guidePathFromFile(
        "C:/repo/openpaw-docs/src/content/guides/common/0-onetime-tracker-setup/guide.mdx",
      ),
    ).toBe("common/0-onetime-tracker-setup");
  });
});
