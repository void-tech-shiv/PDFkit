# PDFKit - PDF Engine Specification

## 1. Engine Core & Dependencies
PDFKit utilizes a multi-layered PDF manipulation architecture combining `pdf-lib`, `pdfjs-dist`, `pdf-parse`, and `sharp` to provide full manipulation capabilities.

---

## 2. Operations & Pipeline Details

### 2.1 Merge PDF Pipeline
1. Load multiple incoming PDF buffers into `PDFDocument` instances via `pdf-lib`.
2. Create an empty target document.
3. Sequentially copy all pages from each source document (`target.copyPages(src, src.getPageIndices())`).
4. Rebuild unified catalog, preserving page orientation, form fields, and content streams.
5. Save compressed target bytes.

### 2.2 Split PDF Pipeline
1. Parse page range syntax (e.g. `1-3, 5, 8-12` or `all`).
2. Load source PDF.
3. If single extracted PDF requested:
   - Extract selected page indices into a new `PDFDocument`.
   - Output single PDF buffer.
4. If individual page split requested:
   - Generate individual single-page `PDFDocument` files.
   - Bundle into an in-memory ZIP archive using `archiver`.

### 2.3 Rotate & Page Transformations
1. Load PDF document.
2. For each specified page index, calculate new rotation angle: `(currentRotation + deltaAngle) % 360`.
3. Set page rotation in `pdf-lib` via `page.setRotation(degrees(newRotation))`.
4. Serialize and output updated document.

### 2.4 Watermarking Pipeline
1. Load target PDF document.
2. Embed standard Helvetica / Times Roman font or custom vector text.
3. For each target page, compute geometric center / offset coordinates.
4. Draw rotated text with specified alpha transparency (`opacity`), RGB color, and scale.
5. Serialize and return modified PDF.

### 2.5 Signature Placement Pipeline
1. Load document and signature image (PNG/JPEG) buffer.
2. Embed image into `pdf-lib` (`pdfDoc.embedPng` or `pdfDoc.embedJpg`).
3. Compute exact coordinates `(x, y, width, height)` on the target page based on the client placement canvas.
4. Draw signature image stream onto the page graphics context.
5. Serialize and return signed PDF.
