# Security Policy

PDFkit handles user-supplied documents. Please help keep users safe by reporting security issues responsibly.

## Supported versions

- The current `main` branch is the only development line. Security fixes, when accepted, are applied there on a best-effort basis.
- No separate release or long-term-support schedule is currently published.

## Reporting a vulnerability

**Please do not report suspected vulnerabilities in public GitHub issues, discussions, pull requests, or social posts.**

Preferred method:
1. Check whether [Private vulnerability reporting](https://github.com/void-tech-shiv/PDFkit/security/advisories/new) is available for this repository.
2. If the private reporting option is unavailable, contact the maintainer through the [GitHub profile](https://github.com/void-tech-shiv) and ask for a private channel before sending technical details.

The repository maintainer must enable GitHub's private vulnerability reporting setting for the advisory link to accept reports. Its current enabled status has not been verified.

When reporting, include:
- A concise description and potential impact.
- Affected commit, version, route, or component, if known.
- Reproduction steps using synthetic files and test accounts.
- Any relevant logs with secrets, personal information, and document contents removed.

Do not attach real confidential documents, passwords, access tokens, or other people's data.

## What to expect

The project is maintained by one primary maintainer. Reports will be reviewed on a best-effort basis. There is currently no guaranteed acknowledgement or remediation SLA. Please allow reasonable time for investigation and avoid public disclosure while a report is being assessed.

## Scope and safe testing

Only test systems and deployments that you own or have explicit permission to assess. Do not access, modify, or download other users' documents or data. Avoid denial-of-service testing, destructive tests, and actions that could affect production users.
