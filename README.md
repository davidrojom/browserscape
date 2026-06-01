<div align="center">

# 🧭 Browserscape

### Know which CSS features break your site — before your users do.

**caniuse, but in reverse.** Instead of looking up one feature, Browserscape crawls
your whole site, finds **every** CSS feature each page actually uses, and tells you
exactly where it breaks across your target browsers.

[Features](#-what-it-does) · [How it works](#-how-it-works) · [Quick start](#-quick-start) · [Deploy](DEPLOY.md)

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TanStack Start](https://img.shields.io/badge/TanStack_Start-FF4154?logo=react&logoColor=white)](https://tanstack.com/start)
[![Playwright](https://img.shields.io/badge/Playwright-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)
[![Tests](https://img.shields.io/badge/tests-54_passing-success)](#-testing)

</div>

---

## ✨ What it does

Paste a URL. Browserscape renders the page (and its same-origin subpages) in a real
browser, captures **all** the CSS that actually applies — external stylesheets,
`<style>` blocks, and JS-injected / CSS-in-JS rules — and produces a compatibility
report you can act on.

- 🔍 **Whole-site scan** — follows same-origin links with depth and page limits, not just the landing page.
- 🎯 **Real rendering** — Playwright executes JS, so CSS-in-JS and dynamically injected styles are caught.
- 📊 **Severity scoring** — every finding is ranked by the share of global traffic it affects: **Crítico ≥ 5%**, **Importante 1–5%**, **Medio 0.1–1%**, **Bajo < 0.1%**.
- 🧹 **No false positives** — features that degrade gracefully (e.g. `ui-sans-serif` font fallbacks) are filtered out, so the score reflects what actually breaks.
- 🤖 **Copy-an-AI-prompt** — one click turns the whole report into a ready-to-paste prompt: feature, where it's used, what it breaks, and a suggested fix. Hand it to your coding agent and ship.
- 🥷 **Polite stealth crawling** — looks like an ordinary Chrome user so a legit audit isn't blocked by trivial bot heuristics, while still honouring `robots.txt`.
- 💻 **Three ways to run it** — a polished web dashboard, a REST API, or an installable CLI (the CLI can even hit `localhost`).

## 🛠 How it works

```
   URL ──▶  Crawl (Playwright)  ──▶  Analyze (@browserscape/core)  ──▶  Report
            renders each page,        doiuse + browserslist detect       score, severity,
            captures applied CSS      unsupported features               per-browser & per-page
```

1. **Crawl** — Playwright renders each page (same-origin, depth/page limits; the backend also respects `robots.txt`) and captures every applied stylesheet. Cross-origin stylesheets are fetched server-side.
2. **Analyze** — [`doiuse`](https://www.npmjs.com/package/doiuse) detects unsupported CSS features against a [browserslist](https://github.com/browserslist/browserslist) query (default `> 0.5%, last 2 versions, not dead`), and `browserslist` supplies the global usage % affected per feature.
3. **Report** — findings are scored, ranked by severity, and broken down per browser and per page.

## 🚀 Quick start

```bash
pnpm install
pnpm --filter @browserscape/cli exec playwright install chromium   # Chromium for crawling
pnpm -r build
```

**Web dashboard** — `http://localhost:3000` (expects the backend at `http://localhost:3001` or `VITE_API_BASE`):
```bash
pnpm --filter @browserscape/web dev
```

**Backend API** — `http://localhost:3001`:
```bash
pnpm --filter @browserscape/backend start:dev     # hot reload
# POST /analyze  { "url": "https://example.com" }
```

**CLI:**
```bash
pnpm --filter @browserscape/cli build
node apps/cli/bin/browserscape.js                                   # prompts for a URL
node apps/cli/bin/browserscape.js --url http://localhost:3000 --max-depth 1 --max-pages 25
```

## 📦 Monorepo layout

| Package | Stack | Responsibility |
|---|---|---|
| `packages/core` (`@browserscape/core`) | TypeScript | Pure CSS-analysis library. CSS in → `CompatibilityReport` out. No network, no browser. |
| `apps/backend` (`@browserscape/backend`) | NestJS + Playwright | `POST /analyze` — crawls a URL, runs the core, returns the report + per-page breakdown. |
| `apps/web` (`@browserscape/web`) | TanStack Start + React | Single-page SaaS: landing page, URL bar, and the full report dashboard. |
| `apps/cli` (`@browserscape/cli`) | NestJS + nest-commander | Installable CLI — prompts for a URL, crawls locally (can hit `localhost`), prints a terminal report. |

The core does **only** analysis. Backend and CLI each own their own Playwright crawl/extract code.

## 🧪 Testing

```bash
pnpm -r test     # 54 tests across all packages
```

## ☁️ Deploy

Two production-ready `Dockerfile`s (web + backend) build from the repo root. See **[DEPLOY.md](DEPLOY.md)** for a step-by-step Coolify guide.

## 📐 Design & plans

See `docs/superpowers/specs/` and `docs/superpowers/plans/`.
