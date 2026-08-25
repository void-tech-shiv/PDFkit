# PDFKit - UI/UX Specification

## 1. Design Philosophy
PDFKit adheres to modern, clean, distraction-free SaaS design principles. The interface prioritizes speed, clarity of action, and high-trust aesthetics.

### Key Tenets:
- **Zero Clutter:** No ads, no popups, no distracting animations or oversized decorative elements.
- **Predictable 4-Step Lifecycle:**
  1. **Select/Drop Tool:** Clear entry point with supported format guidance.
  2. **Configure/Preview:** Instant visual thumbnail feedback and tool parameters.
  3. **Process:** Real progress indication with human-readable status notes.
  4. **Result:** Before/after file metrics, prominent download button, and secondary actions ("Start Over", "Try Another Tool").
- **Visual Confidence:** Real PDF thumbnails rendered in the browser before sending requests, giving users full certainty over which pages they are operating on.

---

## 2. Layout Structure

### 2.1 Navigation Bar (Header)
- **Brand Identity:** PDFKit logo with gradient badge and tagline tooltip.
- **Categorized Menu:**
  - *Convert* (Word to PDF, Image to PDF, PDF to Image, Text to PDF, PDF to Text)
  - *Organize* (Merge, Split, Rotate, Delete Pages, Reorder Pages)
  - *Optimize* (Compress PDF)
  - *Security* (Protect, Unlock, Watermark, Signature)
- **Quick Search (⌘K / Ctrl+K):** Modal search overlay to jump instantly to any tool.
- **Theme Switcher:** Dark and Light mode toggle with automatic system preference detection.
- **Privacy Indicator:** Direct indicator highlighting zero-retention ephemeral processing.

### 2.2 Home Page
- **Hero Section:** Clean title (*Your PDFs. Simplified.*), dynamic search input, and high-contrast primary upload zone.
- **Featured Tools:** Card grid with icon badges, description, and direct links.
- **Tool Categories Tabs:** Seamless filtering between All, Convert, Organize, Optimize, and Security.
- **Feature Highlights:** Privacy, Speed, High-Fidelity Compression, Cross-Platform.

### 2.3 Universal Tool Layout (`ToolLayout.tsx`)
Every tool follows a unified, responsive structure:
- **Breadcrumb:** `Home > Convert > Word to PDF`
- **Header:** Icon, Title, Subtitle with concise usage instructions.
- **State Machine UI:**
  - `Idle`: Large animated drag-and-drop zone with file picker button and size limits.
  - `Configuring`: Visual document preview, page grid, options sidebar or controls bar.
  - `Processing`: Non-blocking progress indicator with stage description (e.g. *Optimizing stream 3 of 8...*).
  - `Success`: Results panel with size savings, download button, copy link, and reset.
  - `Error`: Inline contextual error alert with actionable resolution.

---

## 3. Responsive Breakpoints
- **Desktop (1440px+):** Full multi-column preview with persistent sidebar controls.
- **Laptop (1024px - 1439px):** Optimized 3-column page thumbnail grid and compact controls.
- **Tablet (768px - 1023px):** 2-column layout, bottom sticky action bar for primary actions.
- **Mobile (320px - 767px):** Single-column stacked layout, full-width touch-friendly dropzones (min 48px touch targets), bottom action sheet.
