# MEDORA — production container (canonical main only)
FROM node:22-alpine AS build
WORKDIR /app

# Use the repository's canonical package manager and lockfile.
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* .pnpmfile.cjs ./
COPY patches ./patches
RUN pnpm install --frozen-lockfile --prod=false

COPY . .
RUN pnpm build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN corepack enable
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/shared ./shared

EXPOSE 3000

# Managed platforms can use this endpoint as a safe process readiness probe.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# The Vite build produces dist/public; it does not produce dist/index.js.
# Run the canonical Express/tRPC server entrypoint directly with tsx.
CMD ["pnpm", "exec", "tsx", "server/_core/index.ts"]
