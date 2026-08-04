import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { initAnalytics, trackAnalyticsPageView } from "../lib/analytics";

/**
 * Loads GA4 / Clarity when measurement IDs are set, and sends a GA4 page_view
 * on every React Router location change (SPA navigations do not reload the page).
 */
export function Analytics() {
  const location = useLocation();
  const path = `${location.pathname}${location.search}${location.hash}`;

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    trackAnalyticsPageView(path);
  }, [path]);

  return null;
}
