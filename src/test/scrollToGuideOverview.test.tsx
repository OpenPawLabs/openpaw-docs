import { act, renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { useScrollToGuideOverview } from "../hooks/useScrollToGuideOverview";

const href = "/projects/bb-lsm6dsv/0-overview";

function renderScrollHook(initialEntry: string) {
  let latestPathname = "";
  let latestHash = "";

  function LocationProbe() {
    const location = useLocation();
    latestPathname = location.pathname;
    latestHash = location.hash;
    return null;
  }

  const hook = renderHook(() => useScrollToGuideOverview(), {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route
            path="/projects/:projectId/:guideSlug"
            element={
              <>
                {children}
                <LocationProbe />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    ),
  });

  return {
    ...hook,
    getLocation: () => ({ pathname: latestPathname, hash: latestHash }),
  };
}

describe("useScrollToGuideOverview", () => {
  it("clears the step hash when the active guide has one", async () => {
    const onHashChange = vi.fn();
    window.addEventListener("hashchange", onHashChange);

    const { result, getLocation } = renderScrollHook(`${href}#step-2`);

    act(() => {
      result.current(href);
    });

    await waitFor(() => {
      expect(getLocation().pathname).toBe(href);
      expect(getLocation().hash).toBe("");
    });

    window.removeEventListener("hashchange", onHashChange);
  });

  it("dispatches hashchange when already at the guide top", () => {
    const onHashChange = vi.fn();
    window.addEventListener("hashchange", onHashChange);

    const { result, getLocation } = renderScrollHook(href);

    act(() => {
      result.current(href);
    });

    expect(getLocation().hash).toBe("");
    expect(onHashChange).toHaveBeenCalledTimes(1);

    window.removeEventListener("hashchange", onHashChange);
  });
});
