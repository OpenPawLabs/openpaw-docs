import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { SiteLayout } from "../components/SiteLayout";

describe("usePageBreadcrumbs (via SiteLayout)", () => {
  it("renders breadcrumbs on a project collection page", () => {
    render(
      <MemoryRouter initialEntries={["/projects/bb-lsm6dsv"]}>
        <Routes>
          <Route element={<SiteLayout />} path="/projects/:projectId">
            <Route element={<div>Content</div>} index />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    const breadcrumb = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(breadcrumb).getByRole("link", { name: "Projects" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(within(breadcrumb).getByText("DIY SlimeVR Trackers")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("renders a three-level trail on a guide page", () => {
    render(
      <MemoryRouter initialEntries={["/projects/bb-lsm6dsv/2-tracker-assembly"]}>
        <Routes>
          <Route element={<SiteLayout />} path="/projects/:projectId/:guideSlug">
            <Route element={<div>Content</div>} index />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    const breadcrumb = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(breadcrumb).getByText("Tracker Assembly")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("omits breadcrumbs on the homepage", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route element={<SiteLayout />} path="/">
            <Route element={<div>Home</div>} index />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.queryByRole("navigation", { name: "Breadcrumb" })).toBeNull();
  });
});
