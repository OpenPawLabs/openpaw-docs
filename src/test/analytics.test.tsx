import { fireEvent, render, screen } from "@testing-library/react";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Analytics } from "../components/Analytics";
import {
  initClarity,
  initGa,
  resetClarityForTests,
  resetGaForTests,
  trackPageView,
} from "../lib/analytics";

/** Normalize dataLayer rows (Arguments or Array) for assertions. */
function gtagCalls(): unknown[][] {
  return (window.dataLayer ?? []).flatMap((entry) => {
    if (Array.isArray(entry)) {
      return [entry];
    }
    if (
      entry != null &&
      typeof entry === "object" &&
      typeof (entry as { length?: unknown }).length === "number"
    ) {
      return [Array.from(entry as ArrayLike<unknown>)];
    }
    return [];
  });
}

function dataLayerCommandShapes(): string[] {
  return (window.dataLayer ?? []).map((entry) =>
    Object.prototype.toString.call(entry),
  );
}

function scriptSrcs(): string[] {
  return [...document.head.querySelectorAll("script")].map((el) => el.src);
}

describe("analytics helpers", () => {
  beforeEach(() => {
    resetGaForTests();
    resetClarityForTests();
    document.head.innerHTML = "";
  });

  afterEach(() => {
    resetGaForTests();
    resetClarityForTests();
    document.head.innerHTML = "";
  });

  it("does nothing when measurement ids are empty", () => {
    initGa("");
    initClarity("");
    trackPageView("", "/projects/demo");

    expect(window.gtag).toBeUndefined();
    expect(window.clarity).toBeUndefined();
    expect(scriptSrcs()).toEqual([]);
  });

  it("loads GA4 once and tracks page views", () => {
    initGa("G-TEST123");
    initGa("G-TEST123");

    expect(scriptSrcs()).toEqual([
      "https://www.googletagmanager.com/gtag/js?id=G-TEST123",
    ]);
    // gtag.js ignores plain Arrays in the pre-load queue — only Arguments.
    expect(dataLayerCommandShapes()).toEqual([
      "[object Arguments]",
      "[object Arguments]",
    ]);
    expect(gtagCalls()).toEqual(
      expect.arrayContaining([
        ["js", expect.any(Date)],
        ["config", "G-TEST123", { send_page_view: false }],
      ]),
    );

    trackPageView("G-TEST123", "/projects/demo#step-2");

    expect(dataLayerCommandShapes()).toContain("[object Arguments]");
    expect(gtagCalls()).toEqual(
      expect.arrayContaining([
        [
          "event",
          "page_view",
          expect.objectContaining({
            page_path: "/projects/demo#step-2",
          }),
        ],
      ]),
    );
  });

  it("loads Clarity once", () => {
    initClarity("clarity-project");
    initClarity("clarity-project");

    expect(typeof window.clarity).toBe("function");
    expect(scriptSrcs()).toEqual([
      "https://www.clarity.ms/tag/clarity-project",
    ]);
  });
});

describe("Analytics", () => {
  beforeEach(() => {
    resetGaForTests();
    resetClarityForTests();
    document.head.innerHTML = "";
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-TEST123");
    vi.stubEnv("VITE_CLARITY_PROJECT_ID", "clarity-project");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetGaForTests();
    resetClarityForTests();
    document.head.innerHTML = "";
  });

  it("initializes scripts and sends a page_view for the current route", () => {
    render(
      <MemoryRouter initialEntries={["/projects/bb-lsm6dsv"]}>
        <Analytics />
        <Link to="/">home</Link>
        <Routes>
          <Route path="/projects/:projectId" element={<div>project</div>} />
          <Route path="/" element={<div>home page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(scriptSrcs()).toEqual(
      expect.arrayContaining([
        "https://www.googletagmanager.com/gtag/js?id=G-TEST123",
        "https://www.clarity.ms/tag/clarity-project",
      ]),
    );
    expect(gtagCalls()).toEqual(
      expect.arrayContaining([
        [
          "event",
          "page_view",
          expect.objectContaining({
            page_path: "/projects/bb-lsm6dsv",
          }),
        ],
      ]),
    );

    fireEvent.click(screen.getByRole("link", { name: "home" }));

    expect(screen.getByText("home page")).toBeInTheDocument();
    expect(gtagCalls()).toEqual(
      expect.arrayContaining([
        [
          "event",
          "page_view",
          expect.objectContaining({
            page_path: "/",
          }),
        ],
      ]),
    );
  });
});
