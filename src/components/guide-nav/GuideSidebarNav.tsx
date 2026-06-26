import { cn } from "@heroui/react";
import { Link as RouterLink } from "react-router-dom";
import type { ProjectEntry } from "../../catalog/types";
import { GuideNavStatusMarker } from "./GuideNavStatusMarker";
import { useGuideNavItems } from "./useGuideNavItems";

interface GuideSidebarNavProps {
  project: ProjectEntry;
  currentSlug: string;
  className?: string;
}

/** Vertical guide list for the desktop sticky aside. */
export function GuideSidebarNav({
  project,
  currentSlug,
  className,
}: GuideSidebarNavProps) {
  const items = useGuideNavItems(project, currentSlug);

  return (
    <nav aria-label="Guides in this project" className={className}>
      <ol className="flex flex-col gap-1">
        {items.map((item) => (
          <li key={item.slug}>
            <RouterLink
              aria-current={item.isCurrent ? "page" : undefined}
              className={cn(
                "flex items-start gap-3 rounded-lg px-3 py-2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary-300",
                item.isCurrent
                  ? "bg-primary-50 text-default-950"
                  : "text-default-600 hover:bg-default-100 hover:text-default-900",
              )}
              to={item.href}
            >
              <GuideNavStatusMarker
                isCurrent={item.isCurrent}
                status={item.status}
                step={item.step}
              />
              <span className="min-w-0 flex-1 pt-0.5">
                <span
                  className={cn(
                    "block text-sm leading-snug",
                    item.isCurrent && "font-semibold",
                  )}
                >
                  {item.title}
                </span>
                {(item.optional || item.shared) && (
                  <span className="mt-0.5 block text-xs text-default-400">
                    {item.optional ? "Optional" : "Shared"}
                  </span>
                )}
              </span>
            </RouterLink>
          </li>
        ))}
      </ol>
    </nav>
  );
}
