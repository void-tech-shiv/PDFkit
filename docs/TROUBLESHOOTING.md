# PDFKit - Troubleshooting & Diagnostics

## 1. Common Issues & Solutions

### 1.1 "Uploaded file exceeds maximum size limit"
- **Cause:** Input document is larger than the configured multipart limit (default 100MB).
- **Fix:** Adjust `MAX_FILE_SIZE_MB` in backend `.env` file or compress large media files beforehand.

### 1.2 "PDF appears corrupted or unreadable"
- **Cause:** The input file has missing EOF markers, corrupted xref tables, or unsupported proprietary DRM.
- **Fix:** Open the document in a standard viewer and re-save, or run through PDFKit's Repair / Rebuild pipeline.

### 1.3 "Password is incorrect" on Unlock
- **Cause:** User entered wrong decryption passphrase.
- **Fix:** Re-enter the exact password. PDFKit strictly avoids brute-force attacks to protect document privacy.

### 1.4 PDF Thumbnail generation is slow in browser
- **Cause:** Massive PDF with hundreds of pages or high-res vector graphics.
- **Fix:** PDFKit uses Web Workers for thumbnail rasterization; ensure hardware acceleration is enabled in Chrome/Edge.

### 1.5 Word to PDF styling discrepancies
- **Cause:** Complex Word macros, WordArt, or unsupported proprietary fonts.
- **Fix:** PDFKit standardizes layout using semantic document ASTs; save complex macros as standard Word `.docx` documents.
