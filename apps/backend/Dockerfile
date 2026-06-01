# Production image for @browserscape/backend (NestJS + Playwright/Chromium).
#
# Build context MUST be the repository root (the build needs the pnpm lockfile,
# the workspace manifest and packages/core), e.g.:
#   docker build -f apps/backend/Dockerfile -t browserscape-backend .
# In Coolify: set the Dockerfile to apps/backend/Dockerfile and leave the base
# directory at the repo root.

# ---------- builder ----------
# Pinned to the Playwright npm version below so the browsers baked into the
# runtime image match exactly.
FROM node:22-bookworm-slim AS builder

ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    CI=1 \
    # We use the browsers from the Playwright runtime image, so skip the
    # ~150MB browser download during install.
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
RUN corepack enable

WORKDIR /repo

# Install deps first, keyed only on the manifests for better layer caching.
# All workspace manifests are required for a frozen-lockfile install to pass.
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/core/package.json packages/core/
COPY apps/backend/package.json apps/backend/
COPY apps/web/package.json apps/web/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# Build core (a runtime dependency of the backend) then the backend.
COPY tsconfig.base.json ./
COPY packages/core packages/core
COPY apps/backend apps/backend
RUN pnpm --filter @browserscape/core build \
    && pnpm --filter @browserscape/backend build

# Produce a self-contained, production-only bundle (backend + its prod deps,
# including the built @browserscape/core) at /app.
RUN pnpm --filter @browserscape/backend deploy --legacy --prod /app

# ---------- runner ----------
# Official Playwright image: Chromium + all system libraries preinstalled at
# /ms-playwright, version-matched to the playwright npm package.
FROM mcr.microsoft.com/playwright:v1.60.0-noble AS runner

ENV NODE_ENV=production \
    PORT=3001 \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright \
    # Enable --no-sandbox / --disable-dev-shm-usage in the crawler (see stealth.ts).
    PLAYWRIGHT_NO_SANDBOX=1

WORKDIR /app
COPY --from=builder /app /app

# Run as the unprivileged user shipped with the Playwright image.
USER pwuser

EXPOSE 3001
CMD ["node", "dist/main.js"]
