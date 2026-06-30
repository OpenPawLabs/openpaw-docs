import { cn, Separator } from "@heroui/react";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import type { ProjectEntry } from "../../catalog/types";
import { useScrollToGuideOverview } from "../../hooks/useScrollToGuideOverview";
import { GuideNavStatusMarker } from "./GuideNavStatusMarker";
import { GuideResetButton } from "./GuideResetButton";
import { useGuideNavItems } from "./useGuideNavItems";

interface GuideSwitcherProps {
  project: ProjectEntry;
  currentSlug: string;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      className={cn("size-5 shrink-0 transition-transform", open && "rotate-180")}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Collapsible guide picker shown in the site header on tablet and mobile. */
export function GuideSwitcher({ project, currentSlug }: GuideSwitcherProps) {
  const [open, setOpen] = useState(false);
  const items = useGuideNavItems(project, currentSlug);
  const scrollToGuideOverview = useScrollToGuideOverview();
  const current = items.find((item) => item.isCurrent);

  return (
    <div>
      <button
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-default-200 bg-surface px-4 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span className="min-w-0">
          <span className="block text-xs font-medium uppercase tracking-wide text-default-400">
            Guide {current?.step ?? 1} of {items.length}
          </span>
          <span className="block truncate font-semibold text-default-900">
            {current?.title ?? "Select guide"}
          </span>
        </span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <nav
          aria-label="Guides in this project"
          className="mt-2 rounded-xl border border-default-200 bg-surface p-2"
        >
          <ol className="flex flex-col gap-0.5">
            {items.map((item) => (
              <li key={item.slug}>
                <RouterLink
                  aria-current={item.isCurrent ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary-300",
                    item.isCurrent
                      ? "bg-primary-50 text-default-950"
                      : "text-default-600 hover:bg-default-100 hover:text-default-900",
                  )}
                  onClick={(event) => {
                    if (item.isCurrent) {
                      event.preventDefault();
                      scrollToGuideOverview(item.href);
                    }
                    setOpen(false);
                  }}
                  to={item.href}
                >
                  <GuideNavStatusMarker
                    isCurrent={item.isCurrent}
                    status={item.status}
                    step={item.step}
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block truncate text-sm",
                        item.isCurrent && "font-semibold",
                      )}
                    >
                      {item.title}
                    </span>
                  </span>
                </RouterLink>
              </li>
            ))}
          </ol>

          <Separator />

          <GuideResetButton
            className="mt-2 w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-danger outline-none transition-colors hover:bg-danger-50 focus-visible:ring-2 focus-visible:ring-danger-300"
            project={project}
          />
        </nav>
      )}
    </div>
  );
}
