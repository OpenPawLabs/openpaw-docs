import { initClarity } from "./clarity";
import { getClarityProjectId, getGaMeasurementId } from "./config";
import { initGa, trackPageView } from "./ga";

export { getClarityProjectId, getGaMeasurementId } from "./config";
export { initClarity, resetClarityForTests } from "./clarity";
export { initGa, resetGaForTests, trackPageView } from "./ga";

export function initAnalytics(): void {
  initGa(getGaMeasurementId());
  initClarity(getClarityProjectId());
}

export function trackAnalyticsPageView(path: string): void {
  trackPageView(getGaMeasurementId(), path);
}
