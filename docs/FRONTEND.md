# PDFKit - Frontend Architecture

## 1. Overview
The PDFKit frontend is built with **React 18 / Vite / TypeScript / Tailwind CSS**, designed for sub-100ms client interactions, zero unnecessary bundle bloat, and maximum accessibility.

---

## 2. Key Modules & State Management

### 2.1 Router & Page Navigation
- Lightweight client-side hash / history router handling all tool routes:
  - `/` (Home page)
  - `/tools/compress`
  - `/tools/word-to-pdf`
  - `/tools/text-to-pdf`
  - `/tools/image-to-pdf`
  - `/tools/pdf-to-image`
  - `/tools/pdf-to-text`
  - `/tools/merge`
  - `/tools/split`
  - `/tools/rotate`
  - `/tools/delete-pages`
  - `/tools/reorder-pages`
  - `/tools/protect`
  - `/tools/unlock`
  - `/tools/watermark`
  - `/tools/signature`

### 2.2 Client-Side PDF Engine (`pdfjs-dist` & `pdf-lib`)
- **PDF.js Worker Integration:** Renders high-fidelity thumbnails inside web workers, preventing UI thread blocking when loading large multi-page documents.
- **Thumbnail Grid Hook (`usePdfThumbnails`):** Generates thumbnail data URLs on demand with memoization and cancellation tokens.
- **Signature Canvas:** HTML5 2D canvas with Bezier curve smoothing for crisp vector-like signature drawing.

### 2.3 File Upload System (`FileDropzone.tsx`)
- Drag-and-drop zone with visual hover cues, format tag filters, and size validation (`MAX_FILE_SIZE = 100MB`).
- Multiple file batch management with reorder cards and remove buttons.
- Real-time progress bar with animated transitions during network upload and server processing.

### 2.4 Error Handling & User Feedback
- Humanized error boundary catching and formatting client-side exceptions.
- Toast notifications for clipboard copying, file additions, and completion events.
- Animated result cards displaying file size reduction percentages and direct download triggers.
