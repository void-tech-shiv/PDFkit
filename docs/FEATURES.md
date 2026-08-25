# PDFKit - Features Specification

This document details all supported tools and capabilities in PDFKit.

---

## 1. Document Conversion Suite

### 1.1 Word to PDF (`/tools/word-to-pdf`)
- **Input:** Microsoft Word `.docx` documents.
- **Engine:** Mammoth parser extracting structure, headings, bold/italic inline text, lists, and tables, rendered into clean formatted PDF.
- **Options:** Standard page orientation (Portrait/Landscape), margin padding.
- **Output:** Standard `.pdf` download.

### 1.2 Text to PDF (`/tools/text-to-pdf`)
- **Input:** Direct typing / rich formatting or `.txt` file upload.
- **Editor Controls:**
  - Font Family: Sans-serif (Inter), Serif (Merriweather), Monospace (JetBrains Mono).
  - Font Size: 10pt to 32pt.
  - Formatting: Bold, Italic, Underline, Strikethrough.
  - Alignment: Left, Center, Right, Justify.
  - Spacing: 1.0, 1.15, 1.5, 2.0 line height.
  - Page Configuration: A4, US Letter, Legal; Margin size (Compact, Normal, Wide).
- **Preview:** Real-time client-side page layout preview.
- **Output:** Generated `.pdf`.

### 1.3 Images to PDF (`/tools/image-to-pdf`)
- **Input:** JPEG, PNG, WebP, GIF, BMP, TIFF.
- **Batch Processing:** Multi-image upload, visual drag-to-reorder cards, delete specific image.
- **Page Options:**
  - Page Size: Fit to Image Dimensions, Standard A4, US Letter.
  - Image Layout: Fit (contain with margins), Fill (cover full page), Center without stretch.
  - Margin: None, Small (10pt), Medium (25pt), Large (40pt).
- **Output:** Combined multi-page `.pdf`.

### 1.4 PDF to Images (`/tools/pdf-to-image`)
- **Input:** Multi-page `.pdf`.
- **Render Engine:** PDF.js high-resolution canvas rasterizer.
- **Format Options:** PNG (Lossless), JPEG (Adjustable Quality 60-100%), WebP.
- **DPI Options:** Standard 72 DPI (1x), Crisp 150 DPI (2x), Ultra 300 DPI (Print quality).
- **Output:** Individual image download or complete document bundled into a `.zip`.

### 1.5 PDF to Text (`/tools/pdf-to-text`)
- **Input:** Text-based `.pdf`.
- **Extraction Engine:** Sequential text stream extraction preserving paragraph breaks and page demarcations.
- **Features:** Word and character counter, search highlight, copy-all-to-clipboard, export as `.txt`.

---

## 2. PDF Management Suite

### 2.1 Compress PDF (`/tools/compress`)
- **Presets:**
  - **Low:** Minimal compression, preserves ultra-high image quality (>200 DPI).
  - **Medium (Recommended):** Balanced file reduction for web and email (150 DPI, 75% quality).
  - **High:** Significant reduction for strict attachment limits (100 DPI, 55% quality).
  - **Extreme:** Maximum file shrinking with 72 DPI downsampling, stream deflation, and metadata stripping.
- **Target Size Mode:**
  - User enters target size (e.g. `2.0 MB`).
  - Adaptive multi-pass pipeline iteratively calculates downscale matrix and compresses until target is achieved.
- **Metrics Display:** Original Size, Compressed Size, Space Saved Percentage, Pass Count, Time elapsed.

### 2.2 Merge PDF (`/tools/merge`)
- **Input:** Multiple PDF files.
- **Sequencing:** Visual list reordering via drag-and-drop or move buttons.
- **Summary:** Total pages, combined raw size.
- **Output:** Unified consolidated `.pdf`.

### 2.3 Split PDF (`/tools/split`)
- **Input:** Multi-page PDF.
- **Visual Interface:** PDF.js page thumbnail gallery with page numbers.
- **Modes:**
  - Custom Ranges: e.g. `1-3, 5, 8-10` into a single extracted PDF.
  - All Pages: Split every single page into an individual PDF bundled in a ZIP.
- **Output:** Extracted `.pdf` or `.zip`.

### 2.4 Rotate PDF (`/tools/rotate`)
- **Input:** Multi-page PDF.
- **Interface:** Thumbnail grid with individual 90° clockwise and counter-clockwise rotate buttons.
- **Bulk Controls:** Rotate All 90° Right, Rotate All 90° Left, Rotate All 180°.
- **Output:** Download PDF with updated transformation matrix.

### 2.5 Delete Pages (`/tools/delete-pages`)
- **Input:** Multi-page PDF.
- **Interface:** Interactive page selection grid with hover trash indicators.
- **Output:** New PDF with selected pages omitted.

### 2.6 Reorder Pages (`/tools/reorder-pages`)
- **Input:** Multi-page PDF.
- **Interface:** Drag-and-drop visual page tiles with live order numbering.
- **Output:** New PDF with reorganized page tree.

---

## 3. Security & Annotation Suite

### 3.1 Protect PDF (`/tools/protect`)
- **Input:** Unprotected PDF.
- **Security:** Standard PDF encryption with user password and owner permissions.
- **UI:** Password visibility toggle, password strength meter, confirmation validation.

### 3.2 Unlock PDF (`/tools/unlock`)
- **Input:** Password-protected PDF.
- **Decryption:** Attempts decryption with provided passphrase; provides clear human-readable error messages on incorrect password.
- **Output:** Unlocked, freely editable PDF.

### 3.3 Watermark PDF (`/tools/watermark`)
- **Input:** Multi-page PDF.
- **Customization:** Watermark text, font size, angle (-90° to 90°), opacity (10% to 100%), color, layer (Over content / Behind content).
- **Target Pages:** All pages, Odd pages only, Even pages only.

### 3.4 Signature PDF (`/tools/signature`)
- **Input:** Multi-page PDF.
- **Signature Modes:**
  - Draw: Smooth HTML5 canvas signature pad with pen width and color selector.
  - Upload: PNG/JPG signature image with automatic transparent background option.
- **Placement:** Interactive canvas overlays allowing drag, resize, and positioning on any target page.
- **Output:** Stamped, finalized signed document.
