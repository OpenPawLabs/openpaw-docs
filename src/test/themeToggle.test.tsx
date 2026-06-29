import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { SiteLayout } from "../components/SiteLayout";
import { ThemeToggle } from "../components/ThemeToggle";

describe("ThemeToggle", () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    document.documentElement.removeAttribute("data-theme");
  });

  it("selects light, dark, and system themes", async () => {
    render(<ThemeToggle />);

    fireEvent.click(await screen.findByRole("button", { name: "dark" }));
    expect(localStorage.getItem("heroui-theme")).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "light" }));
    expect(localStorage.getItem("heroui-theme")).toBe("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "system" }));
    expect(localStorage.getItem("heroui-theme")).toBe("system");
  });

  it("highlights the active theme option", async () => {
    localStorage.setItem("heroui-theme", "dark");

    render(<ThemeToggle />);

    expect(await screen.findByRole("button", { name: "dark" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "light" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "system" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});

describe("SiteLayout theme toggle", () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    document.documentElement.removeAttribute("data-theme");
  });

  it("renders the theme toggle after the GitHub link", async () => {
    render(
      <MemoryRouter>
        <SiteLayout>
          <div>Home</div>
        </SiteLayout>
      </MemoryRouter>,
    );

    const siteNav = screen.getByRole("navigation", { name: "Site" });
    const githubLink = screen.getByRole("link", { name: "GitHub" });
    const themeToggle = await screen.findByRole("button", { name: "light" });

    expect(siteNav).toContainElement(githubLink);
    expect(siteNav).toContainElement(themeToggle.closest("[data-theme-toggle]"));
    expect(
      githubLink.compareDocumentPosition(themeToggle) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
