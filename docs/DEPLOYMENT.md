# PDFkit Deployment Guide

## 1. Local development

Requirements: Node.js 18 or newer and npm 9 or newer.

```bash
npm install
npm run dev
```

The development frontend normally runs at `http://localhost:5173` and the backend at `http://localhost:3001`.

## 2. Docker

Build from the repository root:

```bash
docker build -t pdfkit:latest -f docker/Dockerfile .
docker run --rm -p 3000:3000 --name pdfkit pdfkit:latest
```

The container listens on port 3000. The one-off `docker run` example above does not mount a named volume. For Docker Compose:

```bash
docker compose -f docker/docker-compose.yml up --build -d
```

The Compose configuration mounts the named `pdfkit-temp` volume at `/app/temp`. Treat it as persistent storage: files may remain across container restarts until cleanup removes them. Back up or remove this volume only according to your deployment's retention requirements.

## 3. Separate frontend and backend deployments

### Frontend (Vercel, Netlify, or another static host)

From the repository root:

- Build command: `npm run build:frontend`
- Output directory: `frontend/dist`
- Set `VITE_API_URL` to the public backend URL used by the frontend.

### Backend

From the repository root:

- Build command: `npm run build:backend`
- Start command: `npm --prefix backend run start` (or `npm start` from the root after the backend has been built).
- Set `NODE_ENV=production`, `PORT`, `HOST`, `MAX_FILE_SIZE_MB`, and `TEMP_DIR` as appropriate for the host.

The previous `npm run start:backend` command is not defined in the root `package.json`; use the command above instead.

## 4. Production security checklist

- Put the service behind HTTPS/TLS. The application server does not configure TLS itself.
- Restrict the temporary directory to the service account and ensure it is not publicly served.
- Set upload limits appropriate to available memory and CPU.
- Review host logs, backups, volumes, and retention policies.
- **CORS warning:** the current backend uses `origin: true`; `CORS_ORIGIN` in `.env.example` is not currently enforced by the server. Do not rely on that variable as an allowlist. Implement and verify explicit CORS origin validation before exposing a cross-origin API publicly.
- Review [PRIVACY.md](./PRIVACY.md) before publishing a privacy statement for a hosted instance.

## 5. Environment reference

See [`.env.example`](../.env.example). Never commit production secrets or environment-specific credentials.
