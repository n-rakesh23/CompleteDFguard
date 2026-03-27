# ── Production Dockerfile — Backend ─────────────────────────
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production

# Final image
FROM base AS runner
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY src ./src

EXPOSE 8000
USER node
CMD ["node", "src/app.js"]
