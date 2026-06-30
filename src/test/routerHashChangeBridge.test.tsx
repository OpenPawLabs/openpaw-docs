import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { describe, expect, it, vi } from "vitest";
import { useRouterHashChangeBridge } from "../hooks/useRouterHashChangeBridge";

function BridgeHarness() {
  useRouterHashChangeBridge();
  return null;
}

function NavigateToHash({ hash }: { hash: string }) {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ hash }, { replace: true });
  }, [hash, navigate]);

  return null;
}

describe("useRouterHashChangeBridge", () => {
  it("does not dispatch hashchange on the initial render", () => {
    const onHashChange = vi.fn();
    window.addEventListener("hashchange", onHashChange);

    render(
      <MemoryRouter initialEntries={["/guide#step-1"]}>
        <BridgeHarness />
      </MemoryRouter>,
    );

    expect(onHashChange).not.toHaveBeenCalled();
    window.removeEventListener("hashchange", onHashChange);
  });

  it("dispatches hashchange when React Router updates the hash", () => {
    const onHashChange = vi.fn();
    window.addEventListener("hashchange", onHashChange);

    render(
      <MemoryRouter initialEntries={["/guide"]}>
        <Routes>
          <Route
            path="/guide"
            element={
              <>
                <BridgeHarness />
                <NavigateToHash hash="step-2" />
              </>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(onHashChange).toHaveBeenCalledTimes(1);
    window.removeEventListener("hashchange", onHashChange);
  });
});
