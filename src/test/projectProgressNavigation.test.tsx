import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { AppRoutes } from "../App";
import { writeGuideStepCompletion } from "../lib/progress/storage";

describe("project progress on navigation", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows stored progress after navigating back from a guide", () => {
    writeGuideStepCompletion("bb-lsm6dsv", "0-overview", { 1: true, 2: true }, 2);

    render(
      <MemoryRouter initialEntries={["/projects/bb-lsm6dsv"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByRole("progressbar", { name: "Project progress" })).toBeInTheDocument();
    expect(screen.getByText("1 / 6 guides")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Resume project/i })).toBeInTheDocument();
  });

  it("keeps the project progress bar visible with in-progress subguides", () => {
    writeGuideStepCompletion("bb-lsm6dsv", "0-overview", { 1: true }, 6);

    render(
      <MemoryRouter initialEntries={["/projects/bb-lsm6dsv"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByRole("progressbar", { name: "Project progress" })).toBeInTheDocument();
    expect(screen.getByText("0 / 6 guides")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Resume project/i })).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();
  });
});
