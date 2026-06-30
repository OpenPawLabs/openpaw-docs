import { Accordion, cn } from "@heroui/react";
import { Link as RouterLink } from "react-router-dom";
import type { ProjectEntry } from "../../catalog/types";
import { useGuideReader } from "../../context/GuideReaderContext";
import { useScrollToGuideOverview } from "../../hooks/useScrollToGuideOverview";
import { GuideNavStatusMarker } from "./GuideNavStatusMarker";
import { GuideNavStepList } from "./GuideNavStepList";
import { useGuideNavItems } from "./useGuideNavItems";

interface GuideSidebarNavProps {
  project: ProjectEntry;
  currentSlug: string;
  className?: string;
}

/** Desktop sticky aside: accordion of subguides with step links for the active guide. */
export function GuideSidebarNav({
  project,
  currentSlug,
  className,
}: GuideSidebarNavProps) {
  const items = useGuideNavItems(project, currentSlug);
  const scrollToGuideOverview = useScrollToGuideOverview();
  const { activeStep, stepCompletion } = useGuideReader();

  return (
    <nav aria-label="Guides in this project" className={className}>
      <Accordion
        hideSeparator
        expandedKeys={new Set([currentSlug])}
        onExpandedChange={() => {
          /* expansion is route-driven */
        }}
      >
        {items.map((item) => (
          <Accordion.Item key={item.slug} id={item.slug}>
            <Accordion.Heading>
              {item.isCurrent ? (
                <RouterLink
                  aria-current="page"
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary-300",
                    "text-default-950",
                  )}
                  onClick={(event) => {
                    event.preventDefault();
                    scrollToGuideOverview(item.href);
                  }}
                  to={item.href}
                >
                  <GuideNavStatusMarker
                    isCurrent={item.isCurrent}
                    status={item.status}
                    step={item.step}
                  />
                  <span className="min-w-0 flex-1 pt-0.5">
                    <span className="block text-sm font-semibold leading-snug text-default-950">
                      {item.title}
                    </span>
                    {(item.optional || item.shared) && (
                      <span className="mt-0.5 block text-xs text-default-400">
                        {item.optional ? "Optional" : "Shared"}
                      </span>
                    )}
                  </span>
                  <Accordion.Indicator className="mt-1 shrink-0" />
                </RouterLink>
              ) : (
                <RouterLink
                  aria-current={undefined}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg px-3 py-2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary-300",
                    "text-default-600 hover:bg-default-100 hover:text-default-900",
                  )}
                  to={item.href}
                >
                  <GuideNavStatusMarker
                    isCurrent={false}
                    status={item.status}
                    step={item.step}
                  />
                  <span className="min-w-0 flex-1 pt-0.5">
                    <span className="block text-sm leading-snug">{item.title}</span>
                    {(item.optional || item.shared) && (
                      <span className="mt-0.5 block text-xs text-default-400">
                        {item.optional ? "Optional" : "Shared"}
                      </span>
                    )}
                  </span>
                </RouterLink>
              )}
            </Accordion.Heading>

            {item.isCurrent && item.steps.length > 0 && (
              <Accordion.Panel>
                <Accordion.Body className="pb-2 pt-0">
                  <GuideNavStepList
                    activeStep={activeStep}
                    href={item.href}
                    stepCompletion={stepCompletion}
                    steps={item.steps}
                  />
                </Accordion.Body>
              </Accordion.Panel>
            )}
          </Accordion.Item>
        ))}
      </Accordion>
    </nav>
  );
}
