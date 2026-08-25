# PDFKit - Security Policy & Architecture

## 1. Threat Modeling & Protections

### 1.1 Malicious File Uploads & Polyglots
- **Magic Number & Header Validation:** File extensions are never trusted solely. PDFs are validated for the `%PDF-` signature; DOCX files are checked for standard PKZip archive signatures and OOXML schemas.
- **Strict Size Limits:** Max 100MB per file to prevent memory exhaustion and DoS attacks.
- **Resource Sandboxing:** Document processing runs in isolated asynchronous Node.js worker contexts with memory allocation caps.

### 1.2 Path Traversal Prevention
- All uploaded filenames are stripped of path separators (`/`, `\`), directory traversal symbols (`..`), and non-printable control characters.
- Temporary storage paths are dynamically assigned using cryptographically random UUIDv4 identifiers.

### 1.3 Safe Error Masking
- Raw backend stack traces and file paths are never exposed to clients.
- Errors are normalized to structured, friendly messages (e.g. *"The uploaded file appears to be corrupted or password protected."*).

### 1.4 Encrypted Document Handling
- Passwords entered by users for encryption or decryption are processed purely in memory and never logged to stdout, files, or telemetry.
- No backdoor password cracking is supported or attempted.
