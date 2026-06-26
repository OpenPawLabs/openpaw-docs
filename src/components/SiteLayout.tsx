import { Link } from "@heroui/react";
import { Link as RouterLink, Outlet } from "react-router-dom";

interface SiteLayoutProps {
  children?: React.ReactNode;
}

export function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-default-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <RouterLink
            className="flex flex-col gap-0.5 outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
            to="/"
          >
            <span className="text-sm font-semibold uppercase tracking-wide text-primary">
              OpenPaw Labs
            </span>
            <span className="text-lg font-bold tracking-tight text-default-950">
              DIY Guides
            </span>
          </RouterLink>
          <nav aria-label="Site">
            <RouterLink
              className="text-sm font-medium text-default-600 hover:text-default-900"
              to="/"
            >
              Projects
            </RouterLink>
          </nav>
        </div>
      </header>

      <div className="flex-1">{children ?? <Outlet />}</div>

      <footer className="border-t border-default-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-8 text-sm text-default-500">
          Open-source DIY guides for makers. Content lives in{" "}
          <Link
            href="https://github.com/OpenPawLabs/diy-guides"
            rel="noreferrer"
            target="_blank"
          >
            OpenPawLabs/diy-guides
          </Link>
          .
        </div>
      </footer>
    </div>
  );
}
