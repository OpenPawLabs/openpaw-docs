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
      <GuideReaderProvider guideSlug={currentSlug} projectId="bb-lsm6dsv">
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

    const subguideLinks = screen.getAllByRole("link", {
      name: /Project Overview|3D Print|Tracker Assembly|Dock Assembly|Strap Assembly|DIY Straps|One-time|Daily VR|VRChat/i,
    });
    expect(subguideLinks).toHaveLength(project.subguides.length);

    expect(screen.getByRole("link", { name: /Tracker Assembly/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("links the active subguide without a step hash", () => {
    renderSidebar("0-overview", "/projects/bb-lsm6dsv/0-overview#step-2");

    const overviewLink = screen.getByRole("link", { name: /Project Overview/i });
    expect(overviewLink).toHaveAttribute("href", "/projects/bb-lsm6dsv/0-overview");
  });

  it("shows step links for the current subguide with hash hrefs", () => {
    renderSidebar("0-overview");

    const firstStep = screen.getByRole("link", { name: /Gather Tools/i });
    expect(firstStep).toHaveAttribute("href", "/projects/bb-lsm6dsv/0-overview#step-1");

    const secondStep = screen.getByRole("link", {
      name: /Get Tracker & Charging Dock Boards/i,
    });
    expect(secondStep).toHaveAttribute("href", "/projects/bb-lsm6dsv/0-overview#step-2");
  });

  it("does not show step links for non-current subguides", () => {
    renderSidebar("2-tracker-assembly");

    expect(screen.queryByRole("link", { name: /Gather Tools/i })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Get Tracker & Charging Dock Boards/i }),
    ).not.toBeInTheDocument();
  });

  it("shows optional and shared labels when catalog flags are set", () => {
    const labeledProject = {
      ...project,
      subguides: project.subguides.map((subguide) =>
        subguide.slug === "diy-straps"
          ? { ...subguide, optional: true }
          : subguide.path.startsWith("common/")
            ? { ...subguide, shared: true }
            : subguide,
      ),
    };

    render(
      <MemoryRouter initialEntries={["/projects/bb-lsm6dsv/0-overview"]}>
        <GuideReaderProvider guideSlug="0-overview" projectId="bb-lsm6dsv">
          <GuideSidebarNav currentSlug="0-overview" project={labeledProject} />
        </GuideReaderProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText("Optional")).toBeInTheDocument();
    expect(screen.getAllByText("Shared").length).toBeGreaterThanOrEqual(2);
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
        <GuideReaderProvider guideSlug="0-overview" projectId="bb-lsm6dsv">
          <GuideSwitcher currentSlug="0-overview" project={project} />
        </GuideReaderProvider>
      </MemoryRouter>,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: new RegExp(`Guide 1 of ${project.subguides.length}`, "i"),
      }),
    );

    const nav = screen.getByRole("navigation", { name: "Guides in this project" });
    expect(nav).toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: /3D Print Parts/i }));
    expect(nav).not.toBeInTheDocument();
  });
});
