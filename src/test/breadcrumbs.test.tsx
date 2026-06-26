import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { Breadcrumbs } from "../components/Breadcrumbs";

describe("Breadcrumbs", () => {
  it("renders a labelled nav with links for non-current items", () => {
    render(
      <MemoryRouter>
        <Breadcrumbs
          items={[
            { label: "Projects", to: "/" },
            { label: "DIY SlimeVR Trackers", to: "/projects/bb-lsm6dsv" },
            { label: "Tracker Assembly" },
          ]}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute("href", "/");
    expect(
      screen.getByRole("link", { name: "DIY SlimeVR Trackers" }),
    ).toHaveAttribute("href", "/projects/bb-lsm6dsv");
  });

  it("marks the last item as the current page without a link", () => {
    render(
      <MemoryRouter>
        <Breadcrumbs
          items={[{ label: "Projects", to: "/" }, { label: "Tracker Assembly" }]}
        />
      </MemoryRouter>,
    );

    const current = screen.getByText("Tracker Assembly");
    expect(current).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("link", { name: "Tracker Assembly" })).toBeNull();
  });
});
