import { Link } from "@heroui/react";
import { Link as RouterLink, Outlet, useParams } from "react-router-dom";
import { getProject } from "../catalog/projects";

interface SiteLayoutProps {
  children?: React.ReactNode;
}

export function SiteLayout({ children }: SiteLayoutProps) {
  const { projectId } = useParams();
  const activeProject = projectId ? getProject(projectId) : undefined;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-default-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <RouterLink
              className="flex shrink-0 flex-col gap-0.5 rounded outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
              to="/"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-primary sm:text-sm">
                OpenPaw Labs
              </span>
              <span className="text-base font-bold tracking-tight text-default-950 sm:text-lg">
                DIY Guides
              </span>
            </RouterLink>
            {activeProject && (
              <span className="hidden min-w-0 items-center gap-2 border-l border-default-200 pl-3 text-sm text-default-500 sm:flex">
                <span className="truncate">{activeProject.title}</span>
              </span>
            )}
          </div>

          <nav aria-label="Site" className="flex items-center gap-4">
            <RouterLink
              className="rounded text-sm font-medium text-default-600 outline-none hover:text-default-900 focus-visible:ring-2 focus-visible:ring-primary-300"
              to="/"
            >
              Projects
            </RouterLink>
            <Link
              className="text-sm font-medium"
              href="https://github.com/OpenPawLabs/diy-guides"
              rel="noreferrer"
              target="_blank"
            >
              GitHub
            </Link>
          </nav>
        </div>
      </header>

      <div className="flex-1">{children ?? <Outlet />}</div>

      <footer className="mt-12 border-t border-default-200 bg-white">
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
    </div>
  );
}
