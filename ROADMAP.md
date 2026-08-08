# OpenPaw Docs — Roadmap

Documentation website for [OpenPaw Labs](https://openpawlabs.com) DIY guide collections, hosted at [docs.openpawlabs.com](https://docs.openpawlabs.com).

This roadmap tracks work beyond the initial skeleton. See [README.md](./README.md) for development setup.

## Phase 0 — Skeleton (complete)

- Vite + React + TypeScript + Tailwind + HeroUI + `@openpawlabs/diy-guides-ui` ^1.6.0
- Build-time sync from `diy-guides` → `public/guides/`
- Metadata extraction from `GuideLayout.Header` (`heroImage`, title, difficulty, …)
- Routes: homepage, project collection, guide reader
- Hero cards driven by authored `heroImage` in guide MDX
- localStorage progress stub + CI deploy to GitHub Pages

## Phase 1 — Site chrome & hero UX (complete)

- **Breadcrumbs** — route-derived trail in `SiteLayout` header
- **Inter-guide navigation** — desktop sidebar (`GuideSidebarNav`), mobile header switcher (`GuideSwitcher`), and bottom prev/next pager (`GuidePager`)
- **Project progress** — aggregate progress bar and Start/Resume CTA on collection pages; header-embedded below md, fixed Alert card on md+ (`ProjectProgressBar`, `useProjectProgress`)
- **Hero polish** — branded gradient placeholder (`HeroImage`) when guides lack `heroImage`; full-card links and completion checks on hero cards
- **Site chrome** — sticky responsive header with active-project context; footer with GitHub links

## Phase 2 — Completion persistence (Complete)

- Controlled `GuideStep` / `GuideStepList` completion driven by localStorage
- Restore per-step completion when reopening a guide
- Subguide cards reflect live step counts; "Continue where you left off" CTA
- Cross-tab progress sync

## Phase 3 — Catalog & content pipeline

- [x] Add `project.json` to diy-guides as source of truth for project order and shared guides
- [x] Auto-generate catalog entries from manifests (`pnpm generate-catalog` → `projects.generated.json`)
- Authoring tool validation that required files exist before publish

## Phase 4 — Multi-project & content

- Additional project heroes beyond `bb-lsm6dsv`
- Homepage scales to multiple full-width project cards
- Shared `common/` guides referenced from multiple projects

## Phase 5 — Production hardening

- [x] **Static HTML + hydration** — build-time MDX compile (`src/content/guides/`), SSR prerender of every catalog route to `dist/**/index.html`, client `hydrateRoot` + React Router soft nav
- [x] **SEO** — per-page `<title>`, description, canonical, Open Graph / Twitter tags (`og:image` from `heroImage`)
- [x] **Responsive guide images** — `diy-guide-images` CLI (from `@openpawlabs/diy-guides-ui`, optional peer `sharp`) runs after `sync-guides` to emit AVIF width variants under `images/thumbnails/` + `variants.json` (skips via `sourceHash`); CI restores/saves that folder with Actions cache; catalog heroes prefer 480w; guide reader loads the manifest for `srcset`
- [x] Analytics — GA4 + Microsoft Clarity via `VITE_GA_MEASUREMENT_ID` / `VITE_CLARITY_PROJECT_ID` (GitHub Actions secrets at build time; SPA pageviews on route change)
- [x] Dark mode (HeroUI class strategy)
- Error boundaries, resilient loading states
- Accessibility audit, Lighthouse pass

## Future considerations

- Search across projects and guides
- Internationalization
- View Transitions for soft guide-to-guide navigation
- Promote reusable docs-site components into `@openpawlabs/diy-guides-ui` if a second consumer appears
- Single-guide embed via [`diy-guide-embedder`](https://github.com/OpenPawLabs/diy-guide-embedder) on external pages
