FROM node:22-alpine AS base

# Stage 1: Install all dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --verbose

# Stage 2: Build + prune to prod-only deps
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN if [ ! -f .env ]; then cp .env.example .env; fi
RUN npx prisma generate
RUN npm run build && npm prune --omit=dev

# Stage 3: Final production image
FROM base AS runner
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/.env .

RUN chmod +x scripts/entrypoint.sh

ENTRYPOINT ["/bin/sh", "scripts/entrypoint.sh"]