# PDFkit Backend Architecture

## 1. Overview

The backend uses Node.js, Fastify, and TypeScript for PDF processing, document conversion, image handling, and PDF security operations.

## 2. Server configuration

- **HTTP framework:** Fastify.
- **Multipart uploads:** `@fastify/multipart`; the configured default maximum file size is 100 MB through `MAX_FILE_SIZE_MB`.
- **Static frontend:** `@fastify/static` serves the built frontend when the expected build directory is present.
- **Logging:** Fastify logging is enabled outside test mode.

### CORS deployment warning

The server reads `CORS_ORIGIN` as a comma-separated list of exact HTTP(S) origins. It rejects malformed entries, paths, credentials, and wildcard values at startup. The default is `http://localhost:5173`; set the exact production frontend origin(s) in the deployment environment. Requests without an Origin header (for example, server-to-server calls) are not controlled by browser CORS. CORS is a browser access policy, not authentication or API authorization.

## 3. Service layout

```text
backend/src/
├── routes/
│   ├── compress.routes.ts
│   ├── convert.routes.ts
│   ├── manage.routes.ts
│   ├── security.routes.ts
│   └── health.routes.ts
├── services/
│   ├── compression.service.ts
│   ├── docx.service.ts
│   ├── text.service.ts
│   ├── image.service.ts
│   ├── pdf-manage.service.ts
│   └── security.service.ts
├── utils/
│   ├── temp-manager.ts
│   └── validator.ts
└── server.ts
```

## 4. File processing and temporary storage

- The current upload routes generally read uploaded files into Node.js buffers before processing.
- The password-protection and password-unlock operations create a per-operation directory under `TEMP_DIR` (default: `./temp`) and write intermediate PDF files there.
- Those operations call `TempManager.cleanSandbox()` in a `finally` block.
- If cleanup does not run (for example, after an abrupt process termination), the background collector is intended to remove stale sandbox directories.
- `TEMP_FILE_TTL_MINUTES` defaults to 15 minutes. The collector is scheduled every 5 minutes and removes directories whose modification age exceeds the configured TTL. This is a cleanup target, not a guaranteed maximum retention time.
- Docker Compose mounts a named volume at `/app/temp`. That volume can persist across container restarts until files are removed; it is not accurate to describe the deployment as having no persistent storage volume.
- The repository does not implement database-backed document history or user accounts.

For deployment and privacy limitations, see [PRIVACY.md](./PRIVACY.md) and [DEPLOYMENT.md](./DEPLOYMENT.md).
