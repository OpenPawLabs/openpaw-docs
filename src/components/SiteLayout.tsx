import { Link } from "@heroui/react";
import { type ReactNode } from "react";
import { Link as RouterLink, Outlet, useParams } from "react-router-dom";
import { getProject } from "../catalog/projects";
import { GuideReaderProvider } from "../context/GuideReaderContext";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { usePageBreadcrumbs } from "../hooks/usePageBreadcrumbs";
import { useSiteHeaderHeight } from "../hooks/useSiteHeaderHeight";
import { Breadcrumbs } from "./Breadcrumbs";
import { GuideSwitcher } from "./guide-nav/GuideSwitcher";
import { ProjectProgressBar } from "./ProjectProgressBar";
import { ThemeToggle } from "./ThemeToggle";

interface SiteLayoutProps {
  children?: React.ReactNode;
}

export function SiteLayout({ children }: SiteLayoutProps) {
  const { projectId, guideSlug } = useParams();
  const breadcrumbs = usePageBreadcrumbs();
  const project = projectId ? getProject(projectId) : undefined;
  const showProjectProgress = project && !guideSlug;
  const isMdUp = useMediaQuery("(min-width: 768px)");
  const headerRef = useSiteHeaderHeight(
    `${projectId ?? ""}:${guideSlug ?? ""}:${showProjectProgress}:${isMdUp}`,
  );
  const guideReaderShell = (content: ReactNode) =>
    projectId && guideSlug ? (
      <GuideReaderProvider guideSlug={guideSlug} projectId={projectId}>
        {content}
      </GuideReaderProvider>
    ) : (
      content
    );

  return guideReaderShell(
    <div className="flex min-h-screen flex-col">
      <header
        ref={headerRef}
        className="sticky top-0 z-40 border-b border-default-200 bg-background/95 backdrop-blur"
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
          <RouterLink
            className="flex shrink-0 items-center gap-4 rounded outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
            to="/"
          >
            <img
              src="/full-logo-purple.png"
              alt="OpenPaw Labs"
              className="block h-4 w-auto sm:h-6 dark:hidden"
            />
            <img
              src="/full-logo-white.png"
              alt=""
              aria-hidden
              className="hidden h-4 w-auto sm:h-6 dark:block"
            />
            <span className="hidden text-base font-bold leading-none tracking-tight text-default-950 sm:inline sm:text-lg">
              DIY Guides
            </span>
          </RouterLink>

          <nav aria-label="Site" className="flex items-center gap-4">
            <RouterLink
              className="rounded text-sm font-medium text-default-600 outline-none hover:text-default-900 focus-visible:ring-2 focus-visible:ring-primary-300"
              to="/"
            >
              Projects
            </RouterLink>
            <Link
              className="hidden sm:inline-block text-sm font-medium"
              href="https://github.com/OpenPawLabs/diy-guides"
              rel="noreferrer"
              target="_blank"
            >
              GitHub
            </Link>
            <ThemeToggle />
          </nav>
        </div>

        {breadcrumbs && (
          <div className="border-t border-default-200">
            <div className="mx-auto w-full max-w-7xl px-4 py-2 sm:px-6">
              <Breadcrumbs items={breadcrumbs} />
            </div>
          </div>
        )}

        {showProjectProgress && !isMdUp && (
          <div className="border-t border-default-200">
            <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6">
              <ProjectProgressBar project={project} variant="inline" />
            </div>
          </div>
        )}

        {project && guideSlug && (
          <div className="border-t border-default-200 lg:hidden">
            <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6">
              <GuideSwitcher currentSlug={guideSlug} project={project} />
            </div>
          </div>
        )}
      </header>

      {showProjectProgress && isMdUp && (
        <>
          <div
            aria-live="polite"
            className="pointer-events-none fixed inset-x-0 z-50"
            style={{ top: "var(--site-header-height)" }}
          >
            <div className="mx-auto flex max-w-7xl justify-end px-4 pt-3 sm:px-6">
              <div className="pointer-events-auto">
                <ProjectProgressBar project={project} variant="floating" />
              </div>
            </div>
          </div>
          <div className="sm:mt-15 lg:mt-5"></div>
        </>
      )}

      <div className="flex-1">{children ?? <Outlet />}</div>

      <footer className="mt-2 border-t border-default-200 bg-background">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-default-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="max-w-prose">
            Open-source DIY guides for makers, built by{" "}
            <Link href="https://openpawlabs.com" rel="noreferrer" target="_blank">
              OpenPaw Labs
            </Link>
            .
          </p>
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link
              href="https://github.com/OpenPawLabs/diy-guides"
              rel="noreferrer"
              target="_blank"
            >
              Guide content
            </Link>
            <Link
              href="https://github.com/OpenPawLabs/diy-guides-ui-react"
              rel="noreferrer"
              target="_blank"
            >
              UI library
            </Link>
          </nav>
        </div>
      </footer>
    </div>,
  );
}
