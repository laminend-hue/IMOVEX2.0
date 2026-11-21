# ==============================================================
# IMOVEX — Dockerfile multi-stage
# Stage 1 : build (Node 22 LTS + pnpm)
# Stage 2 : serve (image minimale, sans devDependencies)
# ==============================================================

# ---- Build stage ----
FROM node:22-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Install dependencies (uses pnpm lockfile for reproducibility)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build Vite frontend + esbuild server bundle
RUN pnpm build

# ---- Serve stage ----
FROM node:22-alpine AS runner

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/firebase-applet-config.json ./firebase-applet-config.json

# Create uploads directory (used as local fallback if Firebase Storage is not configured)
RUN mkdir -p /app/public/uploads

EXPOSE 3000

# Health check — relies on the /api/system/health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/system/health || exit 1

CMD ["node", "dist/server.js"]
