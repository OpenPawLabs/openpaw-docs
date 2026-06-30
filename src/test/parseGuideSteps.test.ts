import { describe, expect, it } from "vitest";
import { parseGuideSteps } from "../lib/guides/parseGuideSteps";

const sampleMdx = `
<GuideLayout>
  <GuideLayout.Header title="Overview Guide" />
  <GuideLayout.Content>
    <GuideStepList>
      <GuideStep title="First step in the guide">
        <GuideStep.Bullets>
          <GuideStep.Bullet>Do something.</GuideStep.Bullet>
        </GuideStep.Bullets>
      </GuideStep>
      <GuideStep title="Second step in the guide">
        <GuideStep.Bullets>
          <GuideStep.Bullet>Do something else.</GuideStep.Bullet>
        </GuideStep.Bullets>
      </GuideStep>
    </GuideStepList>
  </GuideLayout.Content>
</GuideLayout>
`;

describe("parseGuideSteps", () => {
  it("extracts GuideStep titles in order", () => {
    expect(parseGuideSteps(sampleMdx)).toEqual([
      { title: "First step in the guide" },
      { title: "Second step in the guide" },
    ]);
  });

  it("returns an empty array when GuideStepList is missing", () => {
    expect(parseGuideSteps("<GuideLayout><GuideLayout.Content /></GuideLayout>")).toEqual(
      [],
    );
  });

  it("returns an empty array when GuideLayout is missing", () => {
    expect(parseGuideSteps("<p>No guide here</p>")).toEqual([]);
  });
});
