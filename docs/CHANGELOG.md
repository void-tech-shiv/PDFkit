# PDFKit - Changelog

All notable changes to the PDFKit project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-08-25

### Added
- **Core Product:** Launched PDFKit with tagline *"Your PDFs. Simplified."*
- **Compression Engine:**
  - 4 Preset optimization levels (Low, Medium, High, Extreme).
  - Multi-pass target-size adaptive compression engine.
  - Image downsampling with Lanczos resampling and DCT re-encoding via Sharp.
  - Stream deflation and object deduplication.
- **Conversion Suite:**
  - Word to PDF (DOCX parsing with Mammoth).
  - Text to PDF with rich typography and layout controls.
  - Images to PDF with multi-image reordering and layout modes.
  - PDF to Images with selectable DPI (72, 150, 300) and ZIP archive download.
  - PDF to Text extraction with word/char counters.
- **Management Suite:**
  - Merge PDF with visual ordering.
  - Split PDF with visual thumbnail range selection.
  - Rotate PDF with 90°/180°/270° transformations.
  - Delete Pages with interactive thumbnail removal.
  - Reorder Pages with drag-and-drop grid.
- **Security Suite:**
  - Protect PDF with password encryption.
  - Unlock PDF with decryption validation.
  - Watermark PDF with custom text, angle, opacity, and positioning.
  - Signature PDF with interactive canvas drawing and placement.
- **UI/UX & Design:**
  - Responsive SaaS layout for Desktop, Laptop, Tablet, and Mobile.
  - Dark / Light mode toggle.
  - Fast PDF.js client-side thumbnail rendering in Web Workers.
- **DevOps & QA:**
  - Automated temporary file garbage collection.
  - Docker multi-stage build.
  - Unit, integration, and browser QA test suites.
