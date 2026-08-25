# PDFKit - REST API Specification

Base URL: `http://localhost:3001/api`

All endpoints accept `multipart/form-data` uploads unless otherwise specified.

---

## 1. Compression Endpoints

### `POST /api/compress`
Compresses a PDF document according to level or target size.

**Parameters (FormData):**
- `file` (File, required): PDF document.
- `level` (string, optional): `"low"` | `"medium"` | `"high"` | `"extreme"` (default: `"medium"`).
- `targetSizeMB` (number, optional): Desired output size in megabytes (triggers multi-pass engine).

**Response (JSON / File Stream):**
- When `Accept: application/json` or requested via API:
```json
{
  "success": true,
  "originalSizeBytes": 9122611,
  "compressedSizeBytes": 2034210,
  "reductionPercent": 77.7,
  "passes": 4,
  "downloadUrl": "/api/download/b92df8-compressed.pdf",
  "message": "Compression successful. Target achieved."
}
```

---

## 2. Conversion Endpoints

### `POST /api/convert/docx-to-pdf`
- **Body:** `file` (DOCX).
- **Response:** PDF binary download.

### `POST /api/convert/images-to-pdf`
- **Body:**
  - `files` (Array of images).
  - `pageSize` (`"a4"` | `"letter"` | `"fit"`).
  - `fitMode` (`"contain"` | `"cover"` | `"stretch"`).
  - `margin` (number).
- **Response:** PDF binary download.

### `POST /api/convert/pdf-to-images`
- **Body:**
  - `file` (PDF).
  - `format` (`"png"` | `"jpeg"` | `"webp"`).
  - `dpi` (`72` | `150` | `300`).
- **Response:** ZIP archive of rasterized images or single image.

### `POST /api/convert/pdf-to-text`
- **Body:** `file` (PDF).
- **Response:**
```json
{
  "success": true,
  "text": "Extracted document text...",
  "pageCount": 4,
  "wordCount": 1420,
  "characterCount": 8940
}
```

---

## 3. PDF Management Endpoints

### `POST /api/pdf/merge`
- **Body:** `files` (Multiple PDF files in order).
- **Response:** Merged PDF binary.

### `POST /api/pdf/split`
- **Body:**
  - `file` (PDF).
  - `ranges` (string, e.g. `"1-3, 5, 8-10"`).
  - `mode` (`"single"` | `"zip"`).
- **Response:** Split PDF or ZIP archive.

### `POST /api/pdf/rotate`
- **Body:**
  - `file` (PDF).
  - `rotations` (JSON string mapping page numbers to rotation degrees, e.g. `{"1": 90, "2": 180}`).
- **Response:** Rotated PDF binary.

### `POST /api/pdf/delete-pages`
- **Body:**
  - `file` (PDF).
  - `pages` (Comma-separated page numbers to delete, e.g. `"2,4"`).
- **Response:** Modified PDF binary.

### `POST /api/pdf/reorder-pages`
- **Body:**
  - `file` (PDF).
  - `order` (Comma-separated 1-indexed page sequence, e.g. `"3,1,2,4"`).
- **Response:** Reordered PDF binary.

---

## 4. Security Endpoints

### `POST /api/security/protect`
- **Body:**
  - `file` (PDF).
  - `password` (string).
- **Response:** Password-protected PDF.

### `POST /api/security/unlock`
- **Body:**
  - `file` (Encrypted PDF).
  - `password` (string).
- **Response:** Unlocked PDF or `401 Unauthorized` with `{ "error": "Incorrect password provided." }`.

### `POST /api/security/watermark`
- **Body:**
  - `file` (PDF).
  - `text` (string).
  - `fontSize` (number).
  - `opacity` (number: 0.1 - 1.0).
  - `rotation` (number: -90 to 90).
  - `color` (hex string).
- **Response:** Watermarked PDF.

### `POST /api/security/sign`
- **Body:**
  - `file` (PDF).
  - `signature` (Base64 data URL or Image file).
  - `placements` (JSON array of `{ page: number, x: number, y: number, width: number, height: number }`).
- **Response:** Signed PDF.
