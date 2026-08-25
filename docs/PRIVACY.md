# PDFKit - Privacy Architecture & Policy

## 1. Zero-Retention Guarantee
PDFKit is built from the ground up as a **Zero Permanent Storage** utility. We believe documents contain confidential, legal, financial, and personal information that must never be retained on servers.

---

## 2. Document Processing Flow

```text
1. User Selects File ────────► Uploaded via TLS 1.3 / HTTPS
2. Server Receives Stream ───► Saved to isolated ephemeral path (/temp/<uuid>/)
3. Operation Executed ───────► Converted / Compressed / Merged in RAM/temp
4. Response Streamed ────────► Sent back directly to user's browser
5. Immediate Cleanup ────────► Temporary execution sandbox immediately deleted
6. Fallback GC Reaper ───────► Background cron sweeps any stray files every 15 mins
```

---

## 3. Privacy Commitments
- **No Database:** No user profiles, no document history, and no uploaded files are recorded in any persistent database.
- **No Content Scanning / Indexing:** Files are never indexed, read by AI training algorithms, or shared with third parties.
- **Client-Side Optimization:** Where possible (such as text preview, thumbnail generation, reordering, and signature drawing), processing occurs 100% locally in the user's browser via WebAssembly and HTML5 Canvas.
