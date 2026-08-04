export type GtagCommand = (...args: unknown[]) => void;

export interface ClarityCommand {
  (...args: unknown[]): void;
  q?: unknown[];
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagCommand;
    clarity?: ClarityCommand;
  }
}

export {};
