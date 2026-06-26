import { describe, expect, it } from "vitest";
import { rewriteAssetUrls } from "../lib/mdx/rewriteAssetUrls";

const BASE = "http://localhost/guides/bb-lsm6dsv/0-overview/";

describe("rewriteAssetUrls", () => {
  it("rewrites heroImage on GuideLayout.Header to an absolute URL", () => {
    const source = `<GuideLayout>
  <GuideLayout.Header
    title="Overview Guide"
    heroImage="./images/trackers-with-dock-wip-1.png"
    heroImageAlt="Trackers on a dock"
  />
</GuideLayout>`;

    const output = rewriteAssetUrls(source, BASE);

    expect(output).toContain(
      'heroImage="http://localhost/guides/bb-lsm6dsv/0-overview/images/trackers-with-dock-wip-1.png"',
    );
    expect(output).toContain('heroImageAlt="Trackers on a dock"');
  });
});
