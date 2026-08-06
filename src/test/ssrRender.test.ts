import { describe, expect, it } from "vitest";
import { render } from "../entry-server";

describe("SSR render", () => {
  it("renders a guide route with authored content and no loading placeholder", async () => {
    const { html, head } = await render("/projects/bb-lsm6dsv/0-overview");

    expect(html).toContain("Project Overview");
    expect(html).toContain("Gather Tools");
    expect(html).not.toContain("Loading guide…");
    expect(head).toContain("<title>Project Overview");
    expect(head).toContain('property="og:image"');
  });

  it("renders the project collection page", async () => {
    const { html, head } = await render("/projects/bb-lsm6dsv");

    expect(html).toContain("DIY SlimeVR Trackers");
    expect(head).toContain("DIY SlimeVR Trackers");
  });
});
