import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { getProject } from "../catalog/projects";
import { ProjectProgressBar } from "../components/ProjectProgressBar";
import { writeGuideProgress, writeGuideStepCompletion } from "../lib/progress/storage";

const project = getProject("bb-lsm6dsv")!;

describe("ProjectProgressBar resume link", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("links to the first incomplete step when a guide is in progress", () => {
    writeGuideStepCompletion("bb-lsm6dsv", "0-overview", { 1: true }, 6);

    render(
      <MemoryRouter>
        <ProjectProgressBar project={project} variant="inline" />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /Resume project/i })).toHaveAttribute(
      "href",
      "/projects/bb-lsm6dsv/0-overview#step-2",
    );
  });

  it("links to the guide overview when the project has not started", () => {
    render(
      <MemoryRouter>
        <ProjectProgressBar project={project} variant="inline" />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /Start project/i })).toHaveAttribute(
      "href",
      "/projects/bb-lsm6dsv/0-overview",
    );
  });

  it("links to the first guide without a step hash when the project is complete", () => {
    for (const subguide of project.subguides) {
      writeGuideProgress("bb-lsm6dsv", subguide.slug, { completed: 1, total: 1 });
    }

    render(
      <MemoryRouter>
        <ProjectProgressBar project={project} variant="inline" />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /Review project/i })).toHaveAttribute(
      "href",
      "/projects/bb-lsm6dsv/0-overview",
    );
  });
});
