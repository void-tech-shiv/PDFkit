# PDFKit - Backend Architecture

## 1. Overview
The PDFKit backend is built with **Node.js** and **Fastify** in TypeScript, providing a high-performance HTTP microservice for PDF processing, image downsampling, document conversion, and security.

---

## 2. Server Configuration
- **Server Framework:** Fastify v4/v5
- **Plugins & Middleware:**
  - `@fastify/cors`: Strict origin validation with fallback for local dev.
  - `@fastify/multipart`: Streaming multipart upload handler with file size limit enforcement (default: 100MB).
  - `@fastify/static`: Serves frontend production build in single-container deployments.
  - Custom Request Logger & Error Serializer.

---

## 3. Service Layer Architecture

```text
backend/src/
├── routes/
│   ├── compress.routes.ts     # Compression endpoints (/api/compress, /api/compress/analyze)
│   ├── convert.routes.ts      # Word/Image/Text converters (/api/convert/*)
│   ├── manage.routes.ts       # Merge, Split, Rotate, Delete, Reorder (/api/pdf/*)
│   ├── security.routes.ts     # Protect, Unlock, Watermark, Sign (/api/security/*)
│   └── health.routes.ts       # Service health & version
├── services/
│   ├── compression.service.ts # Core PDF compression & target-size optimizer
│   ├── docx.service.ts        # Mammoth DOCX to PDF converter
│   ├── text.service.ts        # Dynamic text/typography to PDF renderer
│   ├── image.service.ts       # Sharp rasterizer & PDF packager
│   ├── pdf-manage.service.ts  # pdf-lib page manipulation
│   └── security.service.ts    # Encryption & digital signature stamping
├── utils/
│   ├── temp-manager.ts        # Ephemeral file manager with 15min TTL reaper
│   └── validator.ts           # Zod schemas for file & parameter validation
└── server.ts                  # Server initialization & lifecycle
```

---

## 4. Ephemeral Storage & Security
- Every request generates a temporary execution sandbox: `./temp/<uuid>/`.
- The response hooks cleanup handlers to unlink all temp artifacts on stream closure.
- A periodic scavenger task runs every 15 minutes to delete any stale directories older than 15 minutes.
- No database or persistent storage volume is attached.
