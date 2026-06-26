import { cn } from "@heroui/react";
import { Fragment } from "react";
import { Link as RouterLink } from "react-router-dom";

export interface BreadcrumbItem {
  label: string;
  /** Router path. Omit for the current page (rendered as plain text). */
  to?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

function Separator() {
  return (
    <span aria-hidden className="text-default-300">
      /
    </span>
  );
}

/**
 * Semantic breadcrumb trail. The last item is the current page (no link,
 * `aria-current="page"`). Long labels truncate so the trail stays on one line
 * on narrow screens.
 */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-default-500">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={`${item.label}-${index}`}>
              <li className="flex min-w-0 items-center">
                {item.to && !isLast ? (
                  <RouterLink
                    className="max-w-[12rem] truncate rounded outline-none hover:text-default-900 focus-visible:ring-2 focus-visible:ring-primary-300"
                    to={item.to}
                  >
                    {item.label}
                  </RouterLink>
                ) : (
                  <span
                    aria-current={isLast ? "page" : undefined}
                    className={cn(
                      "max-w-[16rem] truncate",
                      isLast && "font-medium text-default-700",
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast && (
                <li aria-hidden className="flex items-center">
                  <Separator />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
