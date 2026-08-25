# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# Stage 3: Production Runtime
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Install runtime dependencies for sharp / canvas if needed
RUN apk add --no-cache vips-dev

COPY backend/package*.json ./
RUN npm ci --only=production

COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=frontend-builder /app/frontend/dist ./public

EXPOSE 3000

CMD ["node", "dist/server.js"]
