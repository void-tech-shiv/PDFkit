# Contributing to PDFkit

Thanks for considering a contribution! PDFkit is maintained by its primary maintainer, and thoughtful bug reports, documentation fixes, tests, and focused pull requests are welcome.

## Before you start

1. Read the [README](./README.md) and relevant files in [docs](./docs/).
2. Check existing issues and pull requests for duplicate work.
3. For a substantial change, open an issue first to discuss the approach.
4. For security vulnerabilities, do **not** open a public issue. Follow [SECURITY.md](./SECURITY.md).

## Development setup

Requirements:
- Node.js 18 or newer
- npm 9 or newer

Clone and install:

```bash
git clone https://github.com/void-tech-shiv/PDFkit.git
cd PDFkit
npm install
```

Start the frontend and backend:

```bash
npm run dev
```

The development frontend is normally available at `http://localhost:5173` and the backend at `http://localhost:3001`.

## Checks

Run the repository's available checks before opening a pull request:

```bash
npm test
npm run build
```

The root package currently exposes these scripts. If a change affects only one workspace, you may also run its local scripts from the corresponding directory. Do not claim a check passed unless you ran it.

## Making a change

1. Fork the repository and create a focused branch from `main`.
2. Keep changes small and explain the user-visible reason.
3. Follow the existing TypeScript/React conventions and avoid introducing unrelated formatting changes.
4. Add or update tests for behavior changes and bug fixes.
5. Update relevant documentation, configuration examples, and privacy/security notes when behavior changes.
6. Never commit API keys, credentials, real user documents, private data, or generated temporary files.

## Pull requests

A useful pull request should include:

- A clear summary of the change and its motivation.
- Related issue links, if applicable.
- The tests/build commands you ran and their actual results.
- Screenshots or a short recording for meaningful UI changes, using synthetic/sample data only.
- Notes about configuration changes, compatibility, privacy, or security impact.

Keep one logical change per pull request. Be prepared to answer questions or revise the implementation. The maintainer may request changes, defer, or decline a contribution where it does not fit the project's direction.

## Style and scope

- Prefer readable, maintainable code over clever abstractions.
- Validate untrusted inputs at system boundaries.
- Avoid logging document contents, passwords, tokens, or other sensitive values.
- Preserve existing API behavior unless a breaking change is discussed first.
- Do not add a dependency without explaining why it is needed.

## Community expectations

By participating, you agree to follow the [Code of Conduct](./CODE_OF_CONDUCT.md).
