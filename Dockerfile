FROM node:22-alpine AS base
RUN corepack enable

# Stage 1: Install all dependencies for building
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
RUN pnpm install --frozen-lockfile

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build
# Install only production dependencies to keep the image small
RUN pnpm install --prod --frozen-lockfile

# Stage 3: Final production image
FROM base AS runner
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/scripts ./scripts

RUN chmod +x scripts/entrypoint.sh

ENTRYPOINT ["/bin/sh", "scripts/entrypoint.sh"]