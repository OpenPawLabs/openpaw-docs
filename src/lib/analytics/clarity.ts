import type { ClarityCommand } from "./types";
import "./types";

let initialized = false;

/** Load Microsoft Clarity once when a project id is provided. */
export function initClarity(projectId: string): void {
  if (!projectId || initialized || typeof document === "undefined") {
    return;
  }

  if (!window.clarity) {
    const queue: unknown[] = [];
    const clarity: ClarityCommand = (...args: unknown[]) => {
      queue.push(args);
    };
    clarity.q = queue;
    window.clarity = clarity;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${encodeURIComponent(projectId)}`;
  document.head.appendChild(script);

  initialized = true;
}

export function resetClarityForTests(): void {
  initialized = false;
  delete window.clarity;
}
