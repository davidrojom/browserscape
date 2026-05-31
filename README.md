# Browserscape

Analyze the CSS browser compatibility of a URL and all its same-origin subpages —
like [caniuse.com](https://caniuse.com/), but instead of looking up one feature it
scans **every** CSS feature a page actually uses and reports compatibility against
your target browsers.

## Monorepo layout

| Package | Stack | Responsibility |
|---|---|---|
| `packages/core` (`@browserscape/core`) | TypeScript | Pure CSS-analysis library. Takes CSS, returns a `CompatibilityReport`. No network/browser. |
| `apps/backend` (`@browserscape/backend`) | NestJS | `POST /analyze` — crawls a URL with Playwright, runs the core, returns the report + per-page breakdown. |
| `apps/web` (`@browserscape/web`) | TanStack Start + React | Single-page SaaS: URL bar + dashboard, calls the backend. |
| `apps/cli` (`@browserscape/cli`) | NestJS + nest-commander | Installable CLI that prompts for a URL, crawls locally (can hit `localhost`), prints a terminal report. |

The core does only analysis. Backend and CLI each own their own Playwright crawl/extract code.

## How analysis works

1. **Crawl** (backend/CLI): Playwright renders each page (same-origin, depth/page limits,
   backend also respects `robots.txt`) and captures all applied CSS — external stylesheets,
   `<style>` blocks, and JS-injected/CSS-in-JS rules. Cross-origin stylesheets are fetched
   server-side.
2. **Analyze** (`core`): [`doiuse`](https://www.npmjs.com/package/doiuse) detects unsupported
   CSS features against a [browserslist](https://github.com/browserslist/browserslist) query
   (default `> 0.5%, last 2 versions, not dead`). `browserslist` provides the global usage %
   affected per feature.
3. **Severity** by affected global usage %: Crítico ≥ 5%, Importante 1–5%, Medio 0.1–1%, Bajo < 0.1%.

## Setup

```bash
pnpm install
pnpm --filter @browserscape/cli exec playwright install chromium   # Chromium for crawling
pnpm -r build
```

## Run

**Backend** (default port 3001):
```bash
pnpm --filter @browserscape/backend start
# POST http://localhost:3001/analyze  { "url": "https://example.com" }
```

**Web** (default port 3000, expects backend at `http://localhost:3001` or `VITE_API_BASE`):
```bash
pnpm --filter @browserscape/web dev
```

**CLI:**
```bash
pnpm --filter @browserscape/cli build
node apps/cli/bin/browserscape.js                       # prompts for a URL
node apps/cli/bin/browserscape.js --url http://localhost:3000 --max-depth 1 --max-pages 25
```

## Test

```bash
pnpm -r test     # 33 tests across all packages
```

## Design & plans

See `docs/superpowers/specs/` and `docs/superpowers/plans/`.
