import { cn } from "@heroui/react";
import { guideStepUrlId } from "@openpawlabs/diy-guides-ui";
import { useEffect, useRef, type RefObject } from "react";
import { Link as RouterLink } from "react-router-dom";
import type { GuideStepMetadata } from "../../catalog/types";
import { scrollWithinContainer } from "../../utils/scrollWithinContainer";
import { GuideNavStepMarker } from "./GuideNavStepMarker";

interface GuideNavStepListProps {
  steps: GuideStepMetadata[];
  href: string;
  activeStep: number | null;
  stepCompletion: Record<number, boolean>;
  /** Scrollable sidebar shell — active step scroll is confined here, not the page. */
  scrollContainerRef?: RefObject<HTMLElement | null>;
}

export function GuideNavStepList({
  steps,
  href,
  activeStep,
  stepCompletion,
  scrollContainerRef,
}: GuideNavStepListProps) {
  const activeLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const link = activeLinkRef.current;
    const container = scrollContainerRef?.current;

    if (link == null || container == null || activeStep == null) {
      return;
    }

    scrollWithinContainer(link, container);
  }, [activeStep, scrollContainerRef]);

  if (steps.length === 0) {
    return null;
  }

  return (
    <ol className="flex flex-col gap-0.5 pt-1">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = activeStep === stepNumber;
        const completed = stepCompletion[stepNumber] ?? false;
        const label = step.title?.trim() || `Step ${stepNumber}`;

        return (
          <li key={stepNumber}>
            <RouterLink
              ref={isActive ? activeLinkRef : undefined}
              aria-current={isActive ? "step" : undefined}
              className={cn(
                "flex items-start gap-1.5 rounded-md py-1.5 pl-4 pr-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary-300",
                isActive
                  ? "bg-primary-50 font-bold text-default-950"
                  : "text-default-600 hover:bg-default-100 hover:text-default-900",
              )}
              to={{ pathname: href, hash: guideStepUrlId(stepNumber) }}
            >
              <GuideNavStepMarker
                completed={completed}
                isActive={isActive}
                step={stepNumber}
              />
              <span className="min-w-0 flex-1 leading-snug">{label}</span>
            </RouterLink>
          </li>
        );
      })}
    </ol>
  );
}
