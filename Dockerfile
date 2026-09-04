# =====================================================================
# Dockerfile — UKM iKRAAMUL QUR'AN Dashboard
# Target: Railway (Linux/amd64)
# =====================================================================

FROM node:20-slim AS builder

WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# =====================================================================
# Production stage — hanya runtime yang diperlukan
# =====================================================================
FROM node:20-slim AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy package files and install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built artifacts from builder stage
COPY --from=builder /app/dist ./dist

# Copy static assets if they exist
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["npm", "run", "start"]
