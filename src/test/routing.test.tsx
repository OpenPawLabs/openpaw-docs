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

    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByText("3D Print Parts")).toBeInTheDocument();
  });
});
