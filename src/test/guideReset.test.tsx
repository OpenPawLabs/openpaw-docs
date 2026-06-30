import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { getProject } from "../catalog/projects";
import { GuideResetButton } from "../components/guide-nav/GuideResetButton";
import { GuideReaderProvider } from "../context/GuideReaderContext";
import { readGuideProgress, writeGuideStepCompletion } from "../lib/progress/storage";

const project = getProject("bb-lsm6dsv")!;

function renderResetButton() {
  return render(
    <MemoryRouter>
      <GuideReaderProvider guideSlug="0-overview" projectId={project.id}>
        <GuideResetButton project={project} />
      </GuideReaderProvider>
    </MemoryRouter>,
  );
}

describe("GuideResetButton", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("is hidden when no guide in the project has stored progress", () => {
    renderResetButton();
    expect(
      screen.queryByRole("button", { name: /reset project guides/i }),
    ).not.toBeInTheDocument();
  });

  it("clears stored progress for every subguide after confirmation", () => {
    writeGuideStepCompletion("bb-lsm6dsv", "0-overview", { 1: true }, 2);
    writeGuideStepCompletion("bb-lsm6dsv", "1-3d-prints", { 1: true, 2: true }, 2);
    renderResetButton();

    fireEvent.click(screen.getByRole("button", { name: /reset project guides/i }));
    expect(
      screen.getByRole("dialog", { name: /reset project guide progress/i }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^reset project guides$/i }));

    expect(readGuideProgress("bb-lsm6dsv", "0-overview")).toBeNull();
    expect(readGuideProgress("bb-lsm6dsv", "1-3d-prints")).toBeNull();
    expect(
      screen.queryByRole("button", { name: /reset project guides/i }),
    ).not.toBeInTheDocument();
  });

  it("keeps progress when the dialog is cancelled", () => {
    writeGuideStepCompletion("bb-lsm6dsv", "0-overview", { 1: true }, 2);
    writeGuideStepCompletion("bb-lsm6dsv", "1-3d-prints", { 1: true }, 3);
    renderResetButton();

    fireEvent.click(screen.getByRole("button", { name: /reset project guides/i }));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(readGuideProgress("bb-lsm6dsv", "0-overview")).toEqual({
      completed: 1,
      total: 2,
      steps: { "1": true },
    });
    expect(readGuideProgress("bb-lsm6dsv", "1-3d-prints")).toEqual({
      completed: 1,
      total: 3,
      steps: { "1": true },
    });
  });
});
