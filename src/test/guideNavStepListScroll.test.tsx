import { render, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GuideNavStepList } from "../components/guide-nav/GuideNavStepList";
import type { GuideStepMetadata } from "../catalog/types";
import * as scrollWithinContainerModule from "../utils/scrollWithinContainer";

const steps: GuideStepMetadata[] = [
  { title: "First step in the guide" },
  { title: "Second step in the guide" },
  { title: "Third step in the guide" },
];

describe("GuideNavStepList scroll", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("scrolls within the sidebar container when activeStep changes", async () => {
    const scrollContainerRef = createRef<HTMLDivElement>();
    const scrollWithinContainer = vi.spyOn(
      scrollWithinContainerModule,
      "scrollWithinContainer",
    );

    render(
      <MemoryRouter>
        <div ref={scrollContainerRef} style={{ height: 120, overflow: "auto" }}>
          <GuideNavStepList
            activeStep={3}
            href="/projects/bb-lsm6dsv/0-overview"
            scrollContainerRef={scrollContainerRef}
            stepCompletion={{ 1: true, 2: true, 3: false }}
            steps={steps}
          />
        </div>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(scrollWithinContainer).toHaveBeenCalledTimes(1);
    });

    const [element, container] = scrollWithinContainer.mock.calls[0] ?? [];
    expect(container).toBe(scrollContainerRef.current);
    expect(element?.textContent).toContain("Third step in the guide");
  });
});
