# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Install from the root workspace lockfile for reproducible Docker builds.
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/package.json
COPY backend/package.json ./backend/package.json
RUN npm ci --workspace=frontend --include-workspace-root=false

COPY frontend/ ./frontend/
RUN npm run build --workspace=frontend

# Stage 2: Build Backend
FROM node:20-alpine AS backend-builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/package.json
COPY backend/package.json ./backend/package.json
RUN npm ci --workspace=backend --include-workspace-root=false

COPY backend/ ./backend/
RUN npm run build --workspace=backend

# Stage 3: Production Runtime
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV TEMP_DIR=/app/temp

# Runtime libraries required by native image processing dependencies.
RUN apk add --no-cache vips-dev

COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/package.json
COPY backend/package.json ./backend/package.json
RUN npm ci --omit=dev --workspace=backend --include-workspace-root=false && npm cache clean --force

COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=frontend-builder /app/frontend/dist ./public

RUN mkdir -p /app/temp && chown -R node:node /app/temp

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "backend/dist/server.js"]
