# syntax=docker/dockerfile:1
#
# Three stages:
#   build   install deps and prerender the site with Nuxt
#   assets  print /resume to a PDF and screenshot /og with Playwright's Chromium
#   runtime a small Node image with only the built output, running as a non-root user
#
# Public settings are baked into the prerendered HTML, so they're build args, not env vars.
# Secrets (SMTP, Turnstile secret) are runtime env vars only and never enter the image.

ARG NODE_VERSION=24.22.0
# Keep in step with @playwright/test in package-lock.json
ARG PLAYWRIGHT_VERSION=1.64.1

FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --ignore-scripts

COPY . .

ARG NUXT_PUBLIC_SITE_URL=https://benduffaut.com
ARG NUXT_PUBLIC_BUILD_SHA=dev
ARG NUXT_PUBLIC_UMAMI_WEBSITE_ID=
ARG NUXT_PUBLIC_TURNSTILE_SITE_KEY=
ENV NUXT_PUBLIC_SITE_URL=${NUXT_PUBLIC_SITE_URL} \
    NUXT_PUBLIC_BUILD_SHA=${NUXT_PUBLIC_BUILD_SHA} \
    NUXT_PUBLIC_UMAMI_WEBSITE_ID=${NUXT_PUBLIC_UMAMI_WEBSITE_ID} \
    NUXT_PUBLIC_TURNSTILE_SITE_KEY=${NUXT_PUBLIC_TURNSTILE_SITE_KEY} \
    NUXT_TELEMETRY_DISABLED=1

RUN npx nuxt prepare && npm run build


FROM mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-noble AS assets
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.output ./.output
COPY --from=build /app/package.json ./
COPY scripts ./scripts
ARG CI=
ENV CI=${CI}
RUN node scripts/render-assets.mjs


FROM node:${NODE_VERSION}-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    GENERATED_ASSETS_DIR=/app/.output/generated

COPY --from=assets --chown=node:node /app/.output ./.output

ARG NUXT_PUBLIC_BUILD_SHA=dev
LABEL org.opencontainers.image.title="benduffaut.com" \
      org.opencontainers.image.description="Benjamin Duffaut's portfolio and resume site" \
      org.opencontainers.image.source="https://github.com/bduffaut/benduffaut.com" \
      org.opencontainers.image.revision="${NUXT_PUBLIC_BUILD_SHA}"

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/healthz > /dev/null || exit 1

CMD ["node", ".output/server/index.mjs"]
