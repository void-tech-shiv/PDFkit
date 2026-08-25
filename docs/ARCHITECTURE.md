# PDFKit - System Architecture

```text
                               ┌─────────────────────────────────────────┐
                               │             Client Browser              │
                               │  React 18 + Vite + Tailwind + PDF.js    │
                               └────────────────────┬────────────────────┘
                                                    │
                                         HTTP / REST (FormData)
                                                    │
                               ┌────────────────────▼────────────────────┐
                               │           Node.js Fastify API           │
                               │           Port 3001 (or proxy)          │
                               └───────┬────────────┬────────────┬───────┘
                                       │            │            │
             ┌─────────────────────────▼──┐  ┌──────▼──────┐  ┌──▼────────────────────────┐
             │    Compression Engine      │  │ Converters  │  │ Security & PDF Management │
             │  • Stream & Image Analyzer │  │ • Mammoth   │  │ • PDF-Lib Encrypt/Decrypt │
             │  • Sharp Image Resampler   │  │ • PDF.js    │  │ • Merge / Split / Rotate  │
             │  • Multi-Pass Target Engine│  │ • Text2Pdf  │  │ • Watermark & Signature   │
             │  • Stream Deflation / Xref │  │ • Canvas2Pdf│  │ • Delete / Reorder        │
             └────────────────────────────┘  └─────────────┘  └───────────────────────────┘
                                       │            │            │
                               ┌───────▼────────────▼────────────▼───────┐
                               │          Ephemeral Storage              │
                               │      /temp/<uuid>/ - Auto TTL           │
                               └─────────────────────────────────────────┘
```

---

## 1. Core Principles
1. **Hybrid Execution Model:**
   - Lightweight preview rendering, interactive page selection, canvas drawing, and client-side validations happen instantly in the browser using PDF.js and standard Canvas APIs.
   - Resource-intensive operations (multi-pass image downsampling, DOCX AST conversion, stream compression, encryption/decryption, high-throughput zip packaging) are processed by the Node.js Fastify backend.
2. **Ephemeral Stateless Operation:**
   - Every file upload is assigned a unique cryptographic UUID namespace inside `./temp/<uuid>`.
   - The response streams the output file directly with cleanup hooks triggered on response finish or via a 15-minute background scavenger.
3. **Resilience & Fault Tolerance:**
   - Zod validation at the boundary for all incoming multipart parameters and headers.
   - Comprehensive error wrapping ensuring no raw internal stack traces are returned to the client.

---

## 2. Directory Structure

```text
pdfkit/
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI (Navbar, Footer, Dropzone, Modal, etc.)
│   │   ├── layouts/          # RootLayout, ToolLayout
│   │   ├── pages/            # HomePage, NotFoundPage
│   │   ├── tools/            # Tool implementations
│   │   │   ├── compress/
│   │   │   ├── merge/
│   │   │   ├── split/
│   │   │   ├── rotate/
│   │   │   ├── delete-pages/
│   │   │   ├── reorder-pages/
│   │   │   ├── word-to-pdf/
│   │   │   ├── text-to-pdf/
│   │   │   ├── image-to-pdf/
│   │   │   ├── pdf-to-image/
│   │   │   ├── pdf-to-text/
│   │   │   ├── protect/
│   │   │   ├── unlock/
│   │   │   ├── watermark/
│   │   │   └── signature/
│   │   ├── lib/              # API client, PDF.js helpers, utils, types
│   │   └── styles/           # Tailwind CSS tokens & global styles
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/           # Fastify tool endpoints
│   │   ├── services/         # Business logic modules
│   │   ├── compression/      # Multi-pass PDF optimization engine
│   │   ├── converters/       # Mammoth, Text2Pdf, Sharp image pipelines
│   │   ├── middleware/       # Upload validation, error handler, temp cleanup
│   │   ├── utils/            # Stream helpers, file system manager
│   │   └── server.ts         # Fastify entrypoint
│   ├── tsconfig.json
│   └── package.json
│
├── tests/
│   ├── unit/                 # Vitest algorithmic tests
│   └── integration/          # API endpoint tests
│
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── docs/                     # Comprehensive documentation
├── .env.example
└── README.md
```
