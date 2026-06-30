import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * React Router updates the hash through the History API, which does not emit
 * `hashchange`. `GuideStepList` listens for that event to scroll to the step —
 * dispatch it when the router hash changes after the initial render.
 */
export function useRouterHashChangeBridge() {
  const { hash } = useLocation();
  const isInitialRenderRef = useRef(true);

  useEffect(() => {
    if (isInitialRenderRef.current) {
      isInitialRenderRef.current = false;
      return;
    }

    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }, [hash]);
}
