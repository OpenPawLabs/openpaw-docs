import { cn } from "@heroui/react";

function CheckIcon() {
  return (
    <svg aria-hidden className="size-3" fill="none" viewBox="0 0 24 24">
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

export function GuideNavStepMarker({
  step,
  completed,
  isActive,
}: {
  step: number;
  completed: boolean;
  isActive: boolean;
}) {
  if (completed) {
    return (
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-success text-white">
        <CheckIcon />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-full text-[14px]",
        isActive
          ? "bg-primary font-bold"
          : "bg-default-100 text-default-500",
      )}
    >
      {step}
    </span>
  );
}
