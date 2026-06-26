import { cn } from "@heroui/react";
import type { SubguideStatus } from "../../catalog/types";

function CheckIcon() {
  return (
    <svg aria-hidden className="size-3.5" fill="none" viewBox="0 0 24 24">
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GuideNavStatusMarker({
  status,
  step,
  isCurrent,
}: {
  status: SubguideStatus;
  step: number;
  isCurrent: boolean;
}) {
  if (status === "complete") {
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success text-white">
        <CheckIcon />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
        isCurrent
          ? "bg-primary text-white"
          : status === "in-progress"
            ? "bg-warning-100 text-warning-700 ring-1 ring-warning-400"
            : "bg-default-100 text-default-500",
      )}
    >
      {step}
    </span>
  );
}
