import { useEffect, useRef } from "react";

/** Keeps `--site-header-height` in sync with the measured sticky header. */
export function useSiteHeaderHeight(remountKey = "") {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = headerRef.current;
    if (!element) {
      return;
    }

    const update = () => {
      const height = element.offsetHeight;
      if (height <= 0) {
        return;
      }

      document.documentElement.style.setProperty(
        "--site-header-height",
        `${Math.round(height)}px`,
      );
    };

    update();
    const raf = requestAnimationFrame(update);

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(update);
    });
    observer.observe(element);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [remountKey]);

  return headerRef;
}
