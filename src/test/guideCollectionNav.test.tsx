import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getProject } from "../catalog/projects";
import { GuideCollectionNav } from "../components/GuideCollectionNav";
import { notifyProgressChange, writeGuideProgress } from "../lib/progress/storage";

const project = getProject("bb-lsm6dsv")!;

describe("GuideCollectionNav", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("lists every subguide with the current item marked", () => {
    render(
      <MemoryRouter>
        <GuideCollectionNav currentSlug="2-tracker-assembly" project={project} />
      </MemoryRouter>,
    );

    const nav = screen.getByRole("navigation", { name: "Guides in this project" });
    expect(nav).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(project.subguides.length);

    const current = screen.getByRole("link", { name: /Tracker Assembly/i });
    expect(current).toHaveAttribute("aria-current", "page");
    expect(current).toHaveAttribute("href", "/projects/bb-lsm6dsv/2-tracker-assembly");
  });

  it("shows optional and shared labels", () => {
    render(
      <MemoryRouter>
        <GuideCollectionNav currentSlug="0-overview" project={project} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Optional")).toBeInTheDocument();
    expect(screen.getAllByText("Shared")).toHaveLength(2);
  });

  it("calls onNavigate when a guide link is activated", () => {
    const onNavigate = vi.fn();

    render(
      <MemoryRouter>
        <GuideCollectionNav
          currentSlug="0-overview"
          onNavigate={onNavigate}
          project={project}
        />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("link", { name: /3D Print Parts/i }));
    expect(onNavigate).toHaveBeenCalledOnce();
  });

  it("reflects completed guide status from progress storage", () => {
    writeGuideProgress("bb-lsm6dsv", "0-overview", { completed: 3, total: 3 });
    notifyProgressChange();

    render(
      <MemoryRouter>
        <GuideCollectionNav currentSlug="1-3d-prints" project={project} />
      </MemoryRouter>,
    );

    const overviewLink = screen.getByRole("link", { name: /Overview/i });
    expect(overviewLink.querySelector("svg")).toBeTruthy();
  });
});
