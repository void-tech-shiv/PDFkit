# Changelog

All notable changes to PDFKit are documented here. This project follows the spirit of Keep a Changelog and Semantic Versioning.

## [Unreleased]

### Added
- GitHub Actions CI for dependency installation, unit tests, frontend/backend builds, and production Docker image builds.
- Repository contribution, conduct, security, and support guidance with issue and pull-request templates.
- Strict upload signature checks for PDF, DOCX package, JPEG, PNG, and WebP inputs.
- Safe download filename and Content-Disposition header handling.
- Strict page-range, page-list, rotation, and conversion/compression parameter validation.
- Production Docker image hardening with a non-root runtime user, health check, read-only root filesystem, and restricted container capabilities.

### Changed
- CORS now uses an explicit origin allowlist and upload size limits are configurable.
- Server-side error responses avoid exposing internal exception messages.
- Privacy and temporary-file documentation now describes best-effort cleanup and infrastructure retention limitations accurately.
- Docker workspace installation uses the repository root lockfile for reproducible dependency installation.

### Fixed
- Invalid compression and image-to-PDF parameters are rejected with HTTP 400 instead of silently falling back to defaults.
- Invalid and out-of-range page selections are rejected rather than partially accepted.
- Docker builds no longer expect workspace-local lockfiles that do not exist.

### Notes
- This is an unreleased development summary. A versioned GitHub release will be published only after the final CI workflow passes and the maintainer reviews the release contents.
- Third-party dependency and asset licences remain separate from the project's MIT licence.
