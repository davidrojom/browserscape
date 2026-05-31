# Browserscape — Design Spec

**Date:** 2026-05-31
**Status:** Approved (design phase)

## Purpose

Browserscape receives a URL, crawls the page and its same-origin subpages, extracts
**all** the CSS actually applied to each page, and analyzes its compatibility against
target browsers. It is conceptually like [caniuse.com](https://caniuse.com/), but instead
of looking up a single CSS feature it analyzes every CSS feature found on a real page and
produces a compatibility report / dashboard.

## High-level architecture (pnpm monorepo)

```
browserscape/
├── packages/
│   └── core/          @browserscape/core  — pure CSS-analysis logic (TypeScript)
└── apps/
    ├── backend/       NestJS — imports core, fetch+crawl with Playwright
    ├── cli/           NestJS (nest-commander) — imports core, local fetch+crawl
    └── web/           TanStack Start — calls the backend, renders the dashboard
```

- Package manager: **pnpm workspaces** (pnpm 10.17, Node 22).
- **core** has NO network and NO browser dependencies. It is pure analysis.
- **backend** and **cli** each implement **their own** fetch + crawl logic using Playwright
  (the user explicitly accepted this duplication rather than a shared fetcher package).

## Component: `@browserscape/core`

Pure, side-effect-free analysis library.

### Public API

```ts
interface CssSource {
  css: string;
  origin: string; // which page/stylesheet this CSS came from
}

interface AnalyzeOptions {
  browserslist?: string | string[]; // default: "> 0.5%, last 2 versions, not dead"
  severityThresholds?: SeverityThresholds; // overridable global-usage % cutoffs
}

function analyzeCss(sources: CssSource[], options?: AnalyzeOptions): CompatibilityReport;
```

### Third-party analysis engine

- **doiuse** (PostCSS-based) detects CSS features used and which target browsers lack support,
  using the caniuse database. This satisfies the "use a third-party package, do not build the
  compatibility logic by hand" requirement.
- **browserslist** + **caniuse-lite** resolve the target browser set and provide the
  **global usage %** for each browser, used to compute severity.

> doiuse is in low-maintenance mode but functional and the de-facto standard. If it proves
> unworkable during implementation, the fallback is browserslist + caniuse-lite feature data
> matched against doiuse's feature list directly. This is an implementation-time contingency,
> not a design change.

### Severity model — by global usage % affected

For each unsupported feature, sum the global usage % of the target browsers that do NOT
support it. Map to severity with configurable thresholds (defaults):

| Severity   | Affected global usage % |
|------------|-------------------------|
| Crítico    | ≥ 5%                    |
| Importante | 1% – 5%                 |
| Medio      | 0.1% – 1%               |
| Bajo       | < 0.1%                  |

### `CompatibilityReport` shape

```ts
interface CompatibilityReport {
  overallScore: number;        // 0–100, usage-weighted compatibility
  targetBrowsers: BrowserRef[];
  features: FeatureFinding[];
  byBrowser: BrowserSupport[];
  bySeverity: Record<Severity, number>; // counts
}

interface FeatureFinding {
  featureId: string;           // doiuse/caniuse feature id
  title: string;               // human-readable
  severity: Severity;          // critico | importante | medio | bajo
  affectedUsage: number;       // global usage % affected
  missingIn: BrowserRef[];     // browsers lacking support
  occurrences: Occurrence[];   // { origin, selector?, line?, column? }
}

interface BrowserSupport {
  browser: BrowserRef;         // { id, name, version }
  supportedFeatures: number;
  unsupportedFeatures: number;
  supportRatio: number;        // 0–1
}
```

### Testing

TDD with **Vitest**. Fixtures of CSS with known-unsupported features (e.g. `gap` in old
flexbox, `:has()`, container queries) assert exact findings, severities, and scores.

## Component: backend (NestJS)

- Endpoint: `POST /analyze`
  - Body: `{ url: string, browserslist?: string|string[], crawl?: { maxDepth?: number, maxPages?: number } }`
- Crawl: **same-origin only**, defaults `maxDepth: 2`, `maxPages: 50`, respects `robots.txt`.
- Per page: Playwright (Chromium) renders the page and captures all applied CSS —
  external stylesheets, `<style>` blocks, inline styles, and JS-injected / CSS-in-JS rules.
- Aggregates per-page CSS into the core and returns one `CompatibilityReport` plus a
  per-page breakdown.
- Deployable as a server consumed by the web app.

## Component: web (TanStack Start)

Single page (SaaS, analyzes public pages):

- **Top bar:** URL input + "Analyze" button.
- **Dashboard** (after analysis):
  - Overall compatibility score (gauge/donut).
  - Summary cards per severity (Crítico / Importante / Medio / Bajo).
  - Highlighted list of **critical** unsupported properties.
  - Filterable ranking table of features (browsers missing support + affected usage %).
  - Per-browser support breakdown (bars).
  - Per-subpage breakdown (which pages have the most problems).

## Component: CLI (NestJS + nest-commander)

- Installable via npm; running it launches an interactive CLI that **prompts for a URL**.
- Runs fetch + crawl **locally** with Playwright, so it can analyze dev servers
  (e.g. `localhost:3000`).
- Prints a terminal report equivalent to the dashboard: overall score, per-severity counts,
  critical-features table, per-browser breakdown.

## Build order

1. **core** (unblocks everything; TDD)
2. **CLI** (validates core end-to-end without a server)
3. **backend** (wraps core behind HTTP)
4. **web** (consumes the backend)

## Out of scope (YAGNI for now)

- Authentication / user accounts / multi-tenant SaaS billing.
- Persistence of past analyses / history.
- JS API compatibility (only CSS is analyzed).
- Non-same-origin crawling.
