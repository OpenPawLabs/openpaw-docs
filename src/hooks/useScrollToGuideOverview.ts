import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const GUIDE_STEP_HASH_PATTERN = /^#step-\d+$/;

/**
 * Scroll the reader to the top of the current guide and clear any `#step-N` hash.
 * Reuses `GuideStepList` URL-sync scroll handling via a synthetic `hashchange`.
 */
export function useScrollToGuideOverview() {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    (href: string) => {
      const onSameGuide = location.pathname === href;
      const hasStepHash = GUIDE_STEP_HASH_PATTERN.test(location.hash);

      if (!onSameGuide) {
        navigate(href);
        return;
      }

      if (hasStepHash) {
        navigate({ pathname: href, hash: "" }, { replace: true });
        return;
      }

      window.dispatchEvent(new HashChangeEvent("hashchange"));
    },
    [location.hash, location.pathname, navigate],
  );
}
