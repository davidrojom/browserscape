# Deploying to Coolify

Browserscape is a pnpm monorepo with two deployable services. Each ships a
production `Dockerfile` that builds from the **repository root** as context.

| Service | Dockerfile | Domain | Container port |
| --- | --- | --- | --- |
| Web (TanStack Start SSR) | `apps/web/Dockerfile` | `browserscape.davidrojom.com` | `3000` |
| Backend (NestJS + Playwright) | `apps/backend/Dockerfile` | `api.browserscape.davidrojom.com` | `3001` |

Create **two applications** in Coolify from the same Git repository.

## Backend — `api.browserscape.davidrojom.com`

- **Build pack:** Dockerfile
- **Dockerfile location:** `apps/backend/Dockerfile`
- **Base directory:** `/` (the build needs the lockfile + `packages/core`)
- **Port:** `3001`
- **Domain:** `https://api.browserscape.davidrojom.com`
- **Environment variables:** none required. `PORT` defaults to `3001`;
  `PLAYWRIGHT_NO_SANDBOX=1` and `PLAYWRIGHT_BROWSERS_PATH=/ms-playwright` are
  already set in the image.
- **Resources:** Chromium is memory-hungry. Give the container **at least 1 GB**
  of RAM (2 GB is comfortable for multi-page crawls).

CORS is open (`origin: true` in `main.ts`), so the browser-side calls from the
web domain work without extra configuration.

## Web — `browserscape.davidrojom.com`

- **Build pack:** Dockerfile
- **Dockerfile location:** `apps/web/Dockerfile`
- **Base directory:** `/`
- **Port:** `3000`
- **Domain:** `https://browserscape.davidrojom.com`
- **Build argument (required):**
  `VITE_API_BASE=https://api.browserscape.davidrojom.com`

  This is a **build-time** value: Vite inlines it into the client bundle, so it
  must be set as a *build argument*, not a runtime environment variable. In
  Coolify add it under the application's **Build → Build Variables** (mark it as
  available at build time). The Dockerfile already defaults to this URL, so a
  default build works even if you forget, but setting it explicitly is clearest.

## Deploy order

Deploy the **backend first** so its domain resolves, then the web. If you ever
change the API domain, rebuild the web image (the URL is baked at build time).

## Local image checks

```bash
# from the repo root
docker build -f apps/backend/Dockerfile -t browserscape-backend .
docker build -f apps/web/Dockerfile \
  --build-arg VITE_API_BASE=https://api.browserscape.davidrojom.com \
  -t browserscape-web .

docker run --rm -p 3001:3001 browserscape-backend
docker run --rm -p 3000:3000 browserscape-web
```
