export function getGaMeasurementId(): string {
  return (import.meta.env.VITE_GA_MEASUREMENT_ID ?? "").trim();
}

export function getClarityProjectId(): string {
  return (import.meta.env.VITE_CLARITY_PROJECT_ID ?? "").trim();
}
