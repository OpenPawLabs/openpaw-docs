import { useEffect, useState } from "react";

/** Reads the measured site header height in px from the DOM. */
export function useSiteHeaderHeightPx(): number {
  const [heightPx, setHeightPx] = useState(0);

  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) {
      return;
    }

    const update = () => {
      setHeightPx(header.offsetHeight + 8); // 8px of extra padding
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(header);

    return () => {
      observer.disconnect();
    };
  }, []);

  return heightPx;
}
