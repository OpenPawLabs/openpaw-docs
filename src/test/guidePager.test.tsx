import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { getProject } from "../catalog/projects";
import { GuidePager } from "../components/GuidePager";

const project = getProject("bb-lsm6dsv")!;

describe("GuidePager", () => {
  it("renders prev and next links for a middle guide", () => {
    render(
      <MemoryRouter>
        <GuidePager currentSlug="2-tracker-assembly" project={project} />
      </MemoryRouter>,
    );

    const nav = screen.getByRole("navigation", { name: "Guide navigation" });
    expect(nav).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /Previous/i })).toHaveAttribute(
      "href",
      "/projects/bb-lsm6dsv/1-3d-prints",
    );
    expect(screen.getByRole("link", { name: /Next/i })).toHaveAttribute(
      "href",
      "/projects/bb-lsm6dsv/3-strap-assembly",
    );
    expect(screen.getByRole("link", { name: "Back to all guides" })).toHaveAttribute(
      "href",
      "/projects/bb-lsm6dsv",
    );
  });

  it("omits prev on the first guide", () => {
    render(
      <MemoryRouter>
        <GuidePager currentSlug="0-overview" project={project} />
      </MemoryRouter>,
    );

    expect(screen.queryByRole("link", { name: /Previous/i })).toBeNull();
    expect(screen.getByRole("link", { name: /Next/i })).toBeInTheDocument();
  });

  it("shows an end-of-collection message on the last guide", () => {
    render(
      <MemoryRouter>
        <GuidePager currentSlug="vrchat-use" project={project} />
      </MemoryRouter>,
    );

    expect(screen.queryByRole("link", { name: /Next/i })).toBeNull();
    expect(screen.getByText(/last guide in this project/i)).toBeInTheDocument();
  });

  it("renders nothing for an unknown slug", () => {
    const { container } = render(
      <MemoryRouter>
        <GuidePager currentSlug="missing" project={project} />
      </MemoryRouter>,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
