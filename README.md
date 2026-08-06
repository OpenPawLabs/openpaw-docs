# openpaw-docs

The documentation website for OpenPaw Labs DIY guide collections, hosted at [docs.openpawlabs.com](https://docs.openpawlabs.com).

Guide content lives in [OpenPawLabs/diy-guides](https://github.com/OpenPawLabs/diy-guides). This site syncs those guides at build time, compiles MDX into React modules, prerenders each catalog route to static HTML, and hydrates into a React Router client app for soft in-site navigation. Guides render with [@openpawlabs/diy-guides-ui](https://github.com/OpenPawLabs/diy-guides-ui-react).

## Prerequisites

- [pnpm](https://pnpm.io/) 10+
- Node.js 24+
- A local clone of `diy-guides` alongside this repo (or set `DIY_GUIDES_PATH`)

Expected layout:

```
OpenPawLabs/
  diy-guides/
  diy-guides-ui-react/   # optional — linked for local UI dev
  openpaw-docs/
```

## Development

```bash
pnpm install
pnpm dev      # syncs guides, extracts metadata, starts Vite on http://localhost:5173
pnpm test
pnpm typecheck
pnpm lint
pnpm build    # client bundle + SSR bundle + prerender catalog routes
```

### Guide sync

Before dev and build, scripts copy guide content, generate responsive image variants, extract header metadata, and generate the project catalog:

1. **`pnpm sync-guides`** — copies `../diy-guides` (or `DIY_GUIDES_PATH`) into `public/guides/` (images + assets) and each `guide.mdx` into `src/content/guides/` for Vite MDX compilation
2. **`pnpm generate-images`** — runs `diy-guide-images` (needs `sharp`) to emit AVIF width variants under `images/thumbnails/` + `variants.json` for each synced guide (skips when `sourceHash` in the manifest still matches; `sync-guides` preserves that cache across runs)
3. **`pnpm extract-metadata`** — parses each `guide.mdx` for `GuideLayout.Header` props (`scripts/extract-guide-metadata.ts`) and writes `src/guides-metadata.json`
4. **`pnpm generate-catalog`** — reads each `public/guides/*/project.json` (`scripts/generate-catalog.ts`) and writes `src/catalog/projects.generated.json`

Project membership and order come from diy-guides manifests (`<projectId>/project.json`), not from hand-authored TypeScript. Hero images on project and subguide cards prefer the generated **480w AVIF** when present.

### Static generation (production build)

`pnpm build` produces a hydrated static site:

1. Vite client build → `dist/`
2. Vite SSR build of `src/entry-server.tsx` → `dist-ssr/`
3. `scripts/prerender.ts` renders every catalog route and writes directory `index.html` files (clean URLs, no `.html` in the path):
   - `/` → `dist/index.html`
   - `/projects/:projectId` → `dist/projects/:projectId/index.html`
   - `/projects/:projectId/:guideSlug` → `dist/projects/:projectId/:guideSlug/index.html`

Each HTML file includes the full page body plus per-route `<title>`, description, canonical URL, and Open Graph / Twitter tags (`og:image` from the guide `heroImage` when present). The client bundle hydrates that HTML and React Router handles soft navigation between guides. Unknown paths still hit `public/404.html`, which sends visitors home.

### Local UI library link

`package.json` links `@openpawlabs/diy-guides-ui` to `../diy-guides-ui-react` for local development. CI builds against the published npm package.

## Routes

| Path | Page |
|------|------|
| `/` | Project homepage — full-width project hero cards |
| `/projects/:projectId` | Collection — ordered subguide hero cards, breadcrumbs, aggregate progress bar, Start/Resume CTA |
| `/projects/:projectId/:guideSlug` | Guide reader — breadcrumbs, collection nav rail (desktop), mobile guide switcher, compiled MDX, prev/next pager |

## Site components

Navigation and chrome live in this app (not in `@openpawlabs/diy-guides-ui`):

| Component | Role |
|-----------|------|
| `Breadcrumbs` | Route-derived breadcrumb trail rendered in `SiteLayout` |
| `GuideSidebarNav` / `GuideSwitcher` | Desktop sticky aside and mobile header guide picker; share `useGuideNavItems` |
| `ProjectProgressBar` | Project-wide completion summary on collection pages — header-embedded below md, fixed Alert card on md+ |
| `GuidePager` | Prev/next cards and "Back to all guides" at the bottom of each guide |
| `HeroImage` | Hero photo or branded gradient placeholder when no `heroImage` is authored |
| `useProjectProgress` | Aggregates per-subguide completion from localStorage for progress bars and status chips |

Pure helpers in `src/lib/guides/navigation.ts` (`getGuideNavigation`, `subguideTitle`) derive adjacency from the generated catalog order (from diy-guides `project.json` manifests).

## Analytics

The site loads [Google Analytics 4](https://analytics.google.com/) and [Microsoft Clarity](https://clarity.microsoft.com/) when measurement IDs are present at build time:

| Variable | Purpose |
|----------|---------|
| `VITE_GA_MEASUREMENT_ID` | GA4 measurement ID (`G-…`) |
| `VITE_CLARITY_PROJECT_ID` | Clarity project ID |

Vite inlines these into the client bundle. Production builds get them from GitHub Actions repository secrets (Settings → Secrets and variables → Actions). For local verification, copy [`.env.example`](.env.example) to `.env.local`.

GA4 pageviews are sent on every React Router navigation (including hash changes). Clarity uses the History API for heatmaps and session recordings without a separate pageview hook. When either ID is unset, that tool is skipped.

## Deployment

GitHub Actions (`.github/workflows/deploy-pages.yml`) checks out both `openpaw-docs` and `diy-guides`, builds (including prerender), and deploys `dist/` to GitHub Pages.

Configure the custom domain `docs.openpawlabs.com` in repository Pages settings. `public/CNAME` is included for GitHub Pages.

For analytics on the deployed site, add repository secrets `VITE_GA_MEASUREMENT_ID` and `VITE_CLARITY_PROJECT_ID` (see [Analytics](#analytics)).

## License

[AGPL-3.0-or-later](LICENSE)
