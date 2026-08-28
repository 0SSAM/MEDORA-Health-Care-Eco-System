FROM node:22-slim

WORKDIR /app

COPY . .

RUN npm install -g corepack@0.31.0 \
    && corepack pnpm install --frozen-lockfile \
    && corepack pnpm run build

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
