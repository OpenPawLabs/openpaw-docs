import "./types";

let initialized = false;

function ensureGtag(): NonNullable<Window["gtag"]> {
  window.dataLayer ??= [];
  if (typeof window.gtag !== "function") {
    // Must push `arguments` (not a rest-param Array). gtag.js only treats
    // Arguments objects as commands when draining the pre-load queue.
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params -- required by gtag.js
      window.dataLayer?.push(arguments);
    };
  }
  return window.gtag;
}

/** Load GA4 once. Does not send a page_view — callers use {@link trackPageView}. */
export function initGa(measurementId: string): void {
  if (!measurementId || initialized || typeof document === "undefined") {
    return;
  }

  const gtag = ensureGtag();
  gtag("js", new Date());
  gtag("config", measurementId, { send_page_view: false });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);

  initialized = true;
}

export function trackPageView(measurementId: string, path: string): void {
  if (!measurementId || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}

export function resetGaForTests(): void {
  initialized = false;
  delete window.gtag;
  delete window.dataLayer;
}
