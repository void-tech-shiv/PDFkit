# PDFKit - Deployment Guide

## 1. Local Development
```bash
# Install root, backend, and frontend dependencies
npm install

# Start both backend and frontend concurrently
npm run dev

# Frontend runs on: http://localhost:5173
# Backend API runs on: http://localhost:3001
```

---

## 2. Docker Deployment
A production-ready multi-stage Dockerfile is provided in `docker/Dockerfile`.

### Build & Run Container
```bash
# Build Docker image
docker build -t pdfkit:latest -f docker/Dockerfile .

# Run container on port 3000
docker run -d -p 3000:3000 --name pdfkit pdfkit:latest
```

### Docker Compose
```bash
docker-compose -f docker/docker-compose.yml up -d
```

---

## 3. Cloud Platform Deployment

### Frontend on Vercel / Netlify
- Build Command: `npm run build:frontend`
- Output Directory: `frontend/dist`
- Environment Variables: `VITE_API_URL=https://api.yourdomain.com`

### Backend on Render / Railway / Fly.io / AWS ECS
- Build Command: `npm run build:backend`
- Start Command: `npm run start:backend`
- Environment Variables:
  - `PORT=3001`
  - `NODE_ENV=production`
  - `CORS_ORIGIN=https://yourdomain.com`
  - `MAX_FILE_SIZE_MB=100`
