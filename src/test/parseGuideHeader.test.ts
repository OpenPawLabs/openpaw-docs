import { describe, expect, it } from "vitest";
import { parseGuideHeader } from "../lib/guides/parseGuideHeader";

const sampleMdx = `
<GuideLayout>
  <GuideLayout.Header
    title="Overview Guide"
    heroImage="./images/trackers-with-dock-wip-1.png"
    heroImageAlt="Assembled trackers on a dock"
    difficulty="easy"
    timeEstimate="30 minutes"
    meta="Draft"
  />
</GuideLayout>
`;

describe("parseGuideHeader", () => {
  it("extracts GuideLayout.Header attributes including heroImage", () => {
    const header = parseGuideHeader(sampleMdx);

    expect(header).toEqual({
      title: "Overview Guide",
      heroImage: "./images/trackers-with-dock-wip-1.png",
      heroImageAlt: "Assembled trackers on a dock",
      difficulty: "easy",
      timeEstimate: "30 minutes",
      meta: "Draft",
    });
  });

  it("returns null when GuideLayout.Header is missing", () => {
    expect(parseGuideHeader("<p>No guide here</p>")).toBeNull();
  });
});
