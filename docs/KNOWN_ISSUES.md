# PDFKit - Known Issues & Limitations

## 1. Current Known Behaviors

### 1.1 Extremely Corrupted PDFs
- PDFs with totally broken binary streams or missing font matrices cannot be parsed without raw byte reconstruction. PDFKit provides clear user-facing error messages when encountering unrecoverable corruptions.

### 1.2 Target Size Compression Limits
- If a document contains 50 pages of purely vector paths and embedded font subsets with no images, the maximum compression ratio is bounded by Flate stream deflation. The multi-pass engine will stop at maximum convergence without destroying text fidelity.

### 1.3 Mobile Canvas Signature Precision
- On ultra-high-refresh mobile screens, slight stylus jitter can occur; Bezier curve smoothing algorithms are applied to mitigate this effect.
