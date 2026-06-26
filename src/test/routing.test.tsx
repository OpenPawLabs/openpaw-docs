import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AppRoutes } from "../App";

describe("routing", () => {
  it("renders the homepage", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "DIY Projects" }),
    ).toBeInTheDocument();
    expect(screen.getByText("DIY SlimeVR Trackers")).toBeInTheDocument();
  });

  it("renders a project collection page", () => {
    render(
      <MemoryRouter initialEntries={["/projects/bb-lsm6dsv"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "DIY SlimeVR Trackers" }),
    ).toBeInTheDocument();
    expect(screen.getByText("3D Print Parts")).toBeInTheDocument();
  });

  it("shows breadcrumbs and project progress on the collection page", () => {
    render(
      <MemoryRouter initialEntries={["/projects/bb-lsm6dsv"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Project progress" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Start project/i })).toHaveAttribute(
      "href",
      "/projects/bb-lsm6dsv/0-overview",
    );
  });

  it("renders guide navigation landmarks on a guide page", () => {
    render(
      <MemoryRouter initialEntries={["/projects/bb-lsm6dsv/2-tracker-assembly"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Guides in this project" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Guide navigation" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Guide 3 of 6/i })).toBeInTheDocument();
  });
});
