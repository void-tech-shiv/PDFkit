# PDFKit - QA Verification Checklist

## 1. Baseline System Checks
- [ ] Backend Fastify service starts cleanly on configured port.
- [ ] Frontend Vite development server starts with zero compiler warnings.
- [ ] Production build succeeds (`npm run build`) with clean bundle stats.
- [ ] `.env.example` is complete and synchronized with code references.

---

## 2. Core Functional Tests

### 2.1 PDF Compression
- [ ] Low compression produces high visual fidelity.
- [ ] Medium compression achieves balanced file reduction (~40-60%).
- [ ] High compression achieves significant size reduction (>60%).
- [ ] Extreme compression applies 72 DPI and aggressive stream optimization.
- [ ] Target-size mode converges to user-specified MB target.
- [ ] Compression stats (Original, New Size, Saved %) display correctly.

### 2.2 PDF Conversion
- [ ] Word (DOCX) converts to formatted PDF preserving headings & tables.
- [ ] Text to PDF editor formats fonts, sizes, alignments, and exports valid PDF.
- [ ] Images to PDF accepts JPG, PNG, WebP, reorders, and generates PDF.
- [ ] PDF to Images renders crisp PNG/JPEG and downloads individual or ZIP.
- [ ] PDF to Text extracts selectable text with word/char counters.

### 2.3 PDF Management
- [ ] Merge correctly sequences multiple PDFs into one document.
- [ ] Split extracts specified page ranges or all pages to ZIP.
- [ ] Rotate adjusts angles (90°, 180°, 270°) and saves correct orientation.
- [ ] Delete pages removes chosen thumbnails and reconstructs document.
- [ ] Reorder pages updates page sequence in generated output.

### 2.4 Security & Annotation
- [ ] Protect encrypts PDF with password.
- [ ] Unlock decrypts valid password and displays clear error for wrong password.
- [ ] Watermark renders rotated semi-transparent text across pages.
- [ ] Signature canvas records drawing and embeds cleanly onto PDF.

---

## 3. UI & Responsive Checks
- [ ] Desktop layout (1440x900) has no visual overlapping or horizontal scroll.
- [ ] Laptop layout (1280x720) aligns controls and cards cleanly.
- [ ] Tablet layout (768x1024) wraps tool grids smoothly.
- [ ] Mobile layout (390x844) renders full-width buttons, accessible dropzones, and readable modals.
- [ ] Dark / Light theme toggle switches colors with proper contrast.
- [ ] Browser console has zero uncaught exceptions or React warnings.
