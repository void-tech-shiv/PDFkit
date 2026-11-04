# PDFKit Privacy and File-Handling Notes

This document describes file handling visible in the current repository source. It is a technical description, not a promise that every deployment has identical infrastructure or a substitute for a privacy notice prepared for a specific hosted service.

## Scope

PDFkit can be self-hosted or deployed by an independent operator. The operator's hosting provider, reverse proxy, CDN, observability tools, backups, and network configuration may process data under their own terms. If you use a hosted instance, review the privacy information published by that instance's operator.

## What the application does

- The repository does not implement user accounts, a document-history feature, or database-backed document storage.
- The current backend upload routes generally read uploaded files into Node.js buffers for processing.
- The password-protection and password-unlock services create per-operation directories under the configured temporary directory and write input/output PDF files there.
- Those two services call cleanup in a `finally` block. If a process stops unexpectedly or cleanup fails, the temporary-directory garbage collector is intended to remove stale directories.
- The temporary directory defaults to `./temp` and can be changed with `TEMP_DIR`.
- The stale-file age defaults to 15 minutes and can be changed with `TEMP_FILE_TTL_MINUTES`. The collector is scheduled every 5 minutes in the current implementation. A stale directory is eligible for deletion after its age exceeds the configured TTL; this is not a guaranteed maximum retention time.
- The default upload size setting is 100 MB and can be changed with `MAX_FILE_SIZE_MB`.

## Important limitations

- Do not interpret temporary-file cleanup as secure erasure. Filesystem snapshots, backups, storage-provider behavior, crash dumps, swap, and host-level logs are outside the application's control.
- The application does not itself configure HTTPS/TLS. Production operators must terminate TLS securely at their hosting platform or reverse proxy.
- Fastify operational logging is enabled outside test mode. Operators should review log retention and ensure request logs, error details, and infrastructure telemetry do not expose document contents or secrets.
- This repository's code does not establish what a third-party hosting provider retains. A hosted deployment may have additional retention or processing practices.
- Avoid uploading documents containing highly sensitive information unless you trust the operator and understand the deployment's privacy practices.

## Operator checklist

For a production deployment:

1. Serve the application only over HTTPS.
2. Restrict access to the temporary directory and use an isolated, non-public filesystem path.
3. Ensure temporary storage is not mounted into a persistent backup workflow unless that behavior is intentional and disclosed.
4. Set a suitable `MAX_FILE_SIZE_MB` and monitor memory/disk pressure.
5. Review hosting-provider logs, backups, CDN/reverse-proxy behavior, and retention settings.
6. Keep dependencies patched and restrict production access to the host.
7. Verify cleanup behavior after normal requests, errors, and process restarts.

## Configuration

See [`.env.example`](../.env.example) for the repository's documented environment variables. Actual values are deployment-specific and must not contain secrets in committed files.
