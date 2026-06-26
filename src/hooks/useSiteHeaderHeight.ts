import { useEffect, useRef } from "react";

/** Keeps `--site-header-height` in sync with the measured sticky header. */
export function useSiteHeaderHeight() {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = headerRef.current;
    if (!element) {
      return;
    }

    const update = () => {
      document.documentElement.style.setProperty(
        "--site-header-height",
        `${element.offsetHeight}px`,
      );
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(element);

    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--site-header-height");
    };
  }, []);

  return headerRef;
}
