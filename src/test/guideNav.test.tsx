import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { getProject } from "../catalog/projects";
import { GuideReaderProvider } from "../context/GuideReaderContext";
import { GuideSidebarNav } from "../components/guide-nav/GuideSidebarNav";
import { GuideSwitcher } from "../components/guide-nav/GuideSwitcher";
import { notifyProgressChange, writeGuideProgress } from "../lib/progress/storage";

const project = getProject("bb-lsm6dsv")!;

function renderSidebar(currentSlug: string, initialEntry?: string) {
  const entry =
    initialEntry ?? `/projects/bb-lsm6dsv/${currentSlug}`;

  return render(
    <MemoryRouter initialEntries={[entry]}>
      <GuideReaderProvider key={currentSlug}>
        <GuideSidebarNav currentSlug={currentSlug} project={project} />
      </GuideReaderProvider>
    </MemoryRouter>,
  );
}

describe("GuideSidebarNav", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("lists every subguide with the current item expanded", () => {
    renderSidebar("2-tracker-assembly");

    const nav = screen.getByRole("navigation", { name: "Guides in this project" });
    expect(nav).toBeInTheDocument();

    const subguideLinks = screen.getAllByRole("link", { name: /Overview|3D Print|Tracker Assembly|Strap Assembly|One-time Setup|Daily VR/i });
    expect(subguideLinks).toHaveLength(project.subguides.length);

    expect(screen.getByRole("link", { name: /Tracker Assembly/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("links the active subguide without a step hash", () => {
    renderSidebar("0-overview", "/projects/bb-lsm6dsv/0-overview#step-2");

    const overviewLink = screen.getByRole("link", { name: /Overview Guide/i });
    expect(overviewLink).toHaveAttribute("href", "/projects/bb-lsm6dsv/0-overview");
  });

  it("shows step links for the current subguide with hash hrefs", () => {
    renderSidebar("0-overview");

    const firstStep = screen.getByRole("link", { name: /First step in the guide/i });
    expect(firstStep).toHaveAttribute("href", "/projects/bb-lsm6dsv/0-overview#step-1");

    const secondStep = screen.getByRole("link", { name: /Second step in the guide/i });
    expect(secondStep).toHaveAttribute("href", "/projects/bb-lsm6dsv/0-overview#step-2");
  });

  it("does not show step links for non-current subguides", () => {
    renderSidebar("2-tracker-assembly");

    expect(screen.queryByRole("link", { name: /First step in the guide/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Second step in the guide/i })).not.toBeInTheDocument();
  });

  it("shows optional and shared labels", () => {
    renderSidebar("0-overview");

    expect(screen.getByText("Optional")).toBeInTheDocument();
    expect(screen.getAllByText("Shared")).toHaveLength(2);
  });

  it("reflects completed guide status from progress storage", () => {
    writeGuideProgress("bb-lsm6dsv", "0-overview", { completed: 3, total: 3 });
    notifyProgressChange();

    renderSidebar("1-3d-prints");

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
