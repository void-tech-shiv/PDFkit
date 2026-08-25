# PDFKit - PDF Compression Engine

## 1. Real Optimization Philosophy
PDFKit does **NOT** use fake compression (such as wrapping PDFs in zip files or simply renaming files). It executes a deep optimization pipeline directly modifying PDF streams, downsampling embedded bitmap images, recompressing DCTDecode streams via `sharp`, deduplicating objects, deflating content streams, and stripping redundant metadata.

---

## 2. Optimization Pipeline Architecture

```text
Incoming PDF Buffer
       │
       ▼
[ Step 1: Document Analysis ] ────► Analyze total byte size, object graph, stream count, image streams
       │
       ▼
[ Step 2: Stream & Image Extraction ]
       │  • Identify /XObject /Subtype /Image dictionaries
       │  • Detect image formats (DCTDecode JPEG, FlateDecode PNG/lossless)
       │  • Extract raw image buffers and dimensions (width, height, color space)
       │
       ▼
[ Step 3: Adaptive Image Downsampling & Recompression ]
       │  • Calculate target resolution (DPI) & scale factor
       │  • Re-encode with Sharp using MozJPEG/Lanczos resampling
       │  • Replace original high-res streams with optimized JPEG buffers
       │
       ▼
[ Step 4: Structural Stream Optimization ]
       │  • Deflate uncompressed text & vector streams using FlateDecode
       │  • Deduplicate repeated font descriptors and resources
       │  • Strip non-essential metadata (XMP metadata, thumbnails, piece info)
       │
       ▼
[ Step 5: Document Serialization & Cross-Reference Table Rebuild ]
       │  • Reconstruct cross-reference table (/XRef)
       │  • Apply object stream packing
       │
       ▼
[ Step 6: Integrity Verification ]
       │  • Validate that the resulting PDF opens without syntax errors
       │
       ▼
Optimized PDF Output
```

---

## 3. Compression Levels

| Preset | Target DPI | JPEG Quality | Stream Deflation | Metadata Stripping | Intended Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Low** | 220 DPI | 85% | Yes | Selective | High-quality archiving, legal documents |
| **Medium (Default)** | 150 DPI | 75% | Yes | Full | Standard email sharing, web distribution |
| **High** | 100 DPI | 55% | Yes | Full | Strict email file size limits (e.g. < 10MB) |
| **Extreme** | 72 DPI | 38% | Yes | Aggressive | Maximum size reduction for mobile messaging |

---

## 4. Multi-Pass Target Size Compression Engine

### How Target-Size Compression Works:
When a user requests a specific target size (e.g. **8.7 MB → 2.0 MB**), the engine executes an adaptive iterative feedback loop:

```text
Pass 0: Original File (8.7 MB) ── Target: 2.0 MB (Reduction needed: 77%)
  │
  ├─► Pass 1 (Medium-High Matrix): 150 DPI, 70% Quality ────► Output: 5.4 MB (Target not reached)
  │
  ├─► Pass 2 (Aggressive Matrix): 120 DPI, 55% Quality ─────► Output: 3.4 MB (Target not reached)
  │
  ├─► Pass 3 (Intense Matrix): 96 DPI, 45% Quality ─────────► Output: 2.3 MB (Target not reached)
  │
  └─► Pass 4 (Target Convergence): 80 DPI, 38% Quality ─────► Output: 1.94 MB (TARGET ACHIEVED ✓)
```

### Safety & Quality Bounds:
1. **Pass Limit:** Maximum of 5 iterative passes to prevent infinite compute cycles.
2. **Quality Floor:** Never drops below 50 DPI or 25% JPEG quality to prevent total unreadability. If a target is mathematically impossible without corrupting text, the engine returns the closest achievable size and explains the convergence limit in the status summary.
3. **Verification:** Each generated pass is validated using `pdf-lib` and `pdfjs-dist` to confirm it renders correctly before being selected.
