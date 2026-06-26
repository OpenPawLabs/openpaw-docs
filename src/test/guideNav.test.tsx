import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { getProject } from "../catalog/projects";
import { GuideSidebarNav } from "../components/guide-nav/GuideSidebarNav";
import { GuideSwitcher } from "../components/guide-nav/GuideSwitcher";
import { notifyProgressChange, writeGuideProgress } from "../lib/progress/storage";

const project = getProject("bb-lsm6dsv")!;

describe("GuideSidebarNav", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("lists every subguide with the current item marked", () => {
    render(
      <MemoryRouter>
        <GuideSidebarNav currentSlug="2-tracker-assembly" project={project} />
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
        <GuideSidebarNav currentSlug="0-overview" project={project} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Optional")).toBeInTheDocument();
    expect(screen.getAllByText("Shared")).toHaveLength(2);
  });

  it("reflects completed guide status from progress storage", () => {
    writeGuideProgress("bb-lsm6dsv", "0-overview", { completed: 3, total: 3 });
    notifyProgressChange();

    render(
      <MemoryRouter>
        <GuideSidebarNav currentSlug="1-3d-prints" project={project} />
      </MemoryRouter>,
    );

    const overviewLink = screen.getByRole("link", { name: /Overview/i });
    expect(overviewLink.querySelector("svg")).toBeTruthy();
  });
});

describe("GuideSwitcher", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("opens the guide list and calls onNavigate when a link is chosen", () => {
    render(
      <MemoryRouter>
        <GuideSwitcher currentSlug="0-overview" project={project} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Guide 1 of 6/i }));

    const nav = screen.getByRole("navigation", { name: "Guides in this project" });
    expect(nav).toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: /3D Print Parts/i }));
    expect(nav).not.toBeInTheDocument();
  });
});
