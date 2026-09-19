# PDFKit

<div align="center">
  <h3><strong>Your PDFs. Simplified.</strong></h3>
  <p>An enterprise-grade, privacy-first PDF utility suite for conversion, compression, and PDF management.</p>
</div>

---

## 🚀 Features

- ⚡ **Compression Engine:**
  - 4 Preset modes: Low, Medium (Recommended), High, Extreme.
  - Multi-pass **Target-Size Compression** (e.g. 8.7 MB → 2.0 MB).
  - Stream deflation, JPEG Lanczos downsampling via Sharp, object deduplication, and metadata removal.
- 🔄 **Document Conversion:**
  - **Word to PDF:** High-fidelity DOCX converter preserving headings, formatting, and tables.
  - **Text to PDF:** Rich typography editor with live PDF preview, margin, and font controls.
  - **Images to PDF:** Batch JPG/PNG/WebP layout with fit/contain modes and page size selection.
  - **PDF to Images:** High-resolution page rasterization (PNG, JPEG) with single & ZIP export.
  - **PDF to Text:** Clean text extraction with word & character statistics.
- 📑 **PDF Management:**
  - **Merge PDF:** Multi-file drag-and-drop sequencing.
  - **Split PDF:** Visual page thumbnail range extraction.
  - **Rotate PDF:** 90°, 180°, 270° per-page or whole-document rotation.
  - **Delete Pages:** Visual selection grid to strip unwanted pages.
  - **Reorder Pages:** Visual drag-and-drop page reorganization.
- 🔒 **Security & Annotation:**
  - **Protect PDF:** Password encryption.
  - **Unlock PDF:** Decrypt protected documents with password verification.
  - **Watermark PDF:** Custom rotated semi-transparent text watermarks.
  - **Signature PDF:** Interactive HTML5 drawing pad or signature upload with page placement.
- 🛡️ **Privacy Guarantee:** Zero permanent storage. Automatic 15-minute garbage collection and instant post-response cleanup.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, PDF.js (`pdfjs-dist`), `pdf-lib`
- **Backend:** Node.js, Fastify, TypeScript, Sharp, Mammoth, `pdf-lib`, `pdf-parse`, Archiver, Zod
- **Testing:** Vitest, Browser Subagent / Chrome DevTools MCP QA Automation
- **Containerization:** Docker, Docker Compose

---

## 📦 Project Structure

```text
pdfkit/
├── frontend/             # React 18 + Vite + Tailwind UI
│   ├── src/
│   │   ├── components/   # Shared UI components
│   │   ├── layouts/      # Root and Tool layouts
│   │   ├── pages/        # Home, NotFound
│   │   ├── tools/        # 15+ PDF tool implementations
│   │   └── lib/          # PDF.js utilities, API client
├── backend/              # Node.js Fastify API server
│   ├── src/
│   │   ├── compression/  # Multi-pass PDF compression engine
│   │   ├── converters/   # DOCX, Image, Text converters
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic & PDF manipulation
│   │   └── utils/        # Temporary file manager, validators
├── docker/               # Dockerfile & Docker Compose
├── docs/                 # 18 comprehensive documentation specs
├── tests/                # Unit and Integration test suites
└── README.md
```

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/void-tech-shiv/PDFkit.git
cd pdfkit

# Install dependencies
npm install
```

### 3. Run Development Servers
```bash
# Start both backend (port 3001) and frontend (port 5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing

```bash
# Run unit tests with Vitest
npm test

# Run production build validation
npm run build
```

---

## 🐳 Docker Setup

```bash
# Build and run containerized application
docker-compose -f docker/docker-compose.yml up --build -d
```

The application will be accessible at [http://localhost:3000](http://localhost:3000).

---

## 📄 License
MIT License. Free for personal and commercial use.
