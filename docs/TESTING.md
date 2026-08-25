# PDFKit - Testing Strategy & Automation

## 1. Multi-Tier Testing Pyramid

### 1.1 Unit Tests (Vitest)
- Compression ratio calculation algorithms.
- Target size convergence matrix & scaling factor math.
- Page range parsing (`"1-3, 5, 8-10"` → `[0, 1, 2, 4, 7, 8, 9]`).
- File validation, MIME type sanitization, and magic byte checking.

### 1.2 Integration Tests
- Fastify server route invocation using `supertest` / `inject`.
- Multipart payload ingestion and file conversion accuracy.
- Temporary file cleanup verification (checking that `./temp/<uuid>` is empty after response).

### 1.3 End-to-End & In-Browser Automation
- Desktop viewport (1440x900) and Mobile viewport (390x844).
- Testing every core flow:
  1. Home navigation and search filter.
  2. Compress PDF with Level and Target-Size modes.
  3. Merge multiple PDFs.
  4. Split PDF with visual thumbnail selection.
  5. Rotate PDF and verify orientation metadata.
  6. Word to PDF conversion.
  7. Images to PDF conversion.
  8. PDF to Images rendering and ZIP export.
  9. PDF to Text extraction and copy.
  10. Protect and Unlock PDF password workflows.
  11. Watermark & Signature drawing.
- Console error inspection (zero unhandled exceptions, zero 500 errors).
