# Production image for @browserscape/web (TanStack Start SSR).
#
# Build context MUST be the repository root (the build needs the pnpm lockfile
# and the workspace manifest), e.g.:
#   docker build -f apps/web/Dockerfile \
#     --build-arg VITE_API_BASE=https://api.browserscape.davidrojom.com \
#     -t browserscape-web .
# In Coolify: set the Dockerfile to apps/web/Dockerfile, leave the base
# directory at the repo root, and set the VITE_API_BASE build argument.

# ---------- builder ----------
FROM node:22-bookworm-slim AS builder

ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    CI=1
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

# The web app calls the API from the browser, so the API base is inlined at
# build time by Vite. Override per environment via the build arg.
ARG VITE_API_BASE=https://api.browserscape.davidrojom.com
ENV VITE_API_BASE=$VITE_API_BASE

COPY tsconfig.base.json ./
COPY apps/web apps/web
RUN pnpm --filter @browserscape/web build

# Self-contained, production-only bundle (server.mjs + dist + prod deps such as
# react and @tanstack/* that the SSR build externalises) at /app.
RUN pnpm --filter @browserscape/web deploy --legacy --prod /app

# ---------- runner ----------
FROM node:22-bookworm-slim AS runner

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

WORKDIR /app
COPY --from=builder /app /app

# Drop to the non-root user that ships with the node image.
USER node

EXPOSE 3000
CMD ["node", "server.mjs"]
