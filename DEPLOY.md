# Deploying to Coolify

Browserscape is a pnpm monorepo with two deployable services. Each ships a
production `Dockerfile` that builds from the **repository root** as context.

| Service | Dockerfile | Domain | Container port |
| --- | --- | --- | --- |
| Web (TanStack Start SSR) | `apps/web/Dockerfile` | `browserscape.davidrojom.com` | `3000` |
| Backend (NestJS + Playwright) | `apps/backend/Dockerfile` | `api.browserscape.davidrojom.com` | `3001` |

Create **two applications** in Coolify from the same Git repository.

> [!IMPORTANT]
> In Coolify the **Base Directory is the Docker build context**. These are
> monorepo Dockerfiles: they `COPY` the root lockfile, `pnpm-workspace.yaml`
> and `packages/core`, so the context **must be the repository root**.
>
> Set **Base Directory = `/`** (NOT `/apps/backend` or `/apps/web`) and put the
> service path in **Dockerfile Location**. If you point Base Directory at the
> service folder the build fails with `"/apps/backend": not found` /
> `"/pnpm-workspace.yaml": not found` — see Troubleshooting below.
>
> | Field | Backend | Web |
> | --- | --- | --- |
> | Base Directory | `/` | `/` |
> | Dockerfile Location | `/apps/backend/Dockerfile` | `/apps/web/Dockerfile` |

## Backend — `api.browserscape.davidrojom.com`

- **Build pack:** Dockerfile
- **Base Directory:** `/`  ← the build context; the build needs the root
  lockfile + `packages/core`
- **Dockerfile Location:** `/apps/backend/Dockerfile`
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
- **Base Directory:** `/`  ← the build context (repo root)
- **Dockerfile Location:** `/apps/web/Dockerfile`
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

## Troubleshooting

**`failed to compute cache key: "/apps/backend": not found` (or `/pnpm-workspace.yaml`, `/packages/core`, ...)**

The Base Directory is pointing at the service folder instead of the repo root,
so Docker only receives `apps/backend` as the build context and the monorepo
`COPY` paths don't exist. Fix it in the application's **Build** settings:

- Base Directory: `/`
- Dockerfile Location: `/apps/backend/Dockerfile` (or `/apps/web/Dockerfile`)

A tell-tale sign in the logs is a tiny `transferring context` (~1 kB) and an
empty `.dockerignore` (2B): Coolify is using the wrong directory as context.
