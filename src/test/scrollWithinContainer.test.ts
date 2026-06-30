import { describe, expect, it, vi } from "vitest";
import { scrollWithinContainer } from "../utils/scrollWithinContainer";

describe("scrollWithinContainer", () => {
  it("scrolls down when the element extends below the container", () => {
    const container = document.createElement("div");
    const element = document.createElement("a");
    container.appendChild(element);
    container.scrollTop = 0;

    vi.spyOn(container, "getBoundingClientRect").mockReturnValue({
      top: 100,
      bottom: 400,
    } as DOMRect);
    vi.spyOn(element, "getBoundingClientRect").mockReturnValue({
      top: 370,
      bottom: 420,
    } as DOMRect);

    scrollWithinContainer(element, container);

    expect(container.scrollTop).toBe(20);
  });

  it("scrolls up when the element extends above the container", () => {
    const container = document.createElement("div");
    const element = document.createElement("a");
    container.appendChild(element);
    container.scrollTop = 80;

    vi.spyOn(container, "getBoundingClientRect").mockReturnValue({
      top: 100,
      bottom: 400,
    } as DOMRect);
    vi.spyOn(element, "getBoundingClientRect").mockReturnValue({
      top: 70,
      bottom: 100,
    } as DOMRect);

    scrollWithinContainer(element, container);

    expect(container.scrollTop).toBe(50);
  });

  it("does not scroll when the element is fully visible", () => {
    const container = document.createElement("div");
    const element = document.createElement("a");
    container.appendChild(element);
    container.scrollTop = 12;

    vi.spyOn(container, "getBoundingClientRect").mockReturnValue({
      top: 100,
      bottom: 400,
    } as DOMRect);
    vi.spyOn(element, "getBoundingClientRect").mockReturnValue({
      top: 180,
      bottom: 210,
    } as DOMRect);

    scrollWithinContainer(element, container);

    expect(container.scrollTop).toBe(12);
  });
});
