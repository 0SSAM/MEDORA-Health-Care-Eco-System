# syntax=docker/dockerfile:1.7
# MEDORA | ميدورا — production image

FROM node:22-bookworm-slim AS build
WORKDIR /app

ENV COREPACK_HOME=/corepack
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm check && pnpm build
RUN pnpm prune --prod

FROM node:22-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

LABEL org.opencontainers.image.title="MEDORA Integrated Health System" \
      org.opencontainers.image.description="Bilingual healthcare operations platform with Arabic RTL and English LTR support" \
      org.opencontainers.image.source="https://github.com/0SSAM/MEDORA-Health-Care-Eco-System"

RUN groupadd --system --gid 1001 medora && \
    useradd --system --uid 1001 --gid medora --create-home --shell /usr/sbin/nologin medora

COPY --from=build --chown=medora:medora /app/dist ./dist
COPY --from=build --chown=medora:medora /app/node_modules ./node_modules
COPY --from=build --chown=medora:medora /app/package.json ./package.json

USER medora
EXPOSE 3000

# The application responds from the root route when runtime configuration is valid.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "dist/index.js"]
