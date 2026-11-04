# Community Adoption & Feedback

This document records public, verifiable adoption signals and the project's feedback plan. It intentionally separates measured facts from goals. Do not estimate or invent usage.

## Public repository baseline

Snapshot date: 2026-11-05 (GitHub repository API).

| Signal | Observed value | Source |
|---|---:|---|
| GitHub stars | 0 | Public repository metadata |
| Forks | 0 | Public repository metadata |
| Watchers | 0 | Public repository metadata |
| Open issues | 0 | Public repository metadata |
| Published GitHub releases | 0 | Public releases endpoint |

These figures are a point-in-time snapshot, not monthly active users, downloads, or proof of production usage. GitHub traffic analytics and external hosting analytics were not available in this review.

## Privacy-conscious measurement plan

PDFKit processes user documents. Do not add analytics that collect document contents, filenames, passwords, or other sensitive data.

If usage measurement is introduced, document it first and collect only aggregate, non-content operational counters such as:
- Successful and failed operation counts by tool category.
- Aggregate latency buckets and coarse file-size bands.
- Application version and deployment environment.
- Retention period, access controls, and opt-out behavior.

Do not enable collection until the privacy notice and deployment configuration explain it clearly. Prefer opt-in measurement and self-hosted metrics where practical.

## Feedback invitation

Users can help by:
1. Trying the application with non-sensitive sample documents.
2. Reporting reproducible bugs through the [bug report template](../.github/ISSUE_TEMPLATE/bug_report.yml).
3. Suggesting improvements through the [feature request template](../.github/ISSUE_TEMPLATE/feature_request.yml).
4. Sharing usability feedback through the [user feedback template](../.github/ISSUE_TEMPLATE/user_feedback.yml).

Never attach confidential PDFs, passwords, API keys, or personal data to a public issue.

## Maintainer workflow

- Review new issues and pull requests regularly.
- Label reports by tool, severity, and reproducibility.
- Close duplicates with a pointer to the canonical report.
- Record the resolution and the release containing a fix.
- Publish release notes for user-visible changes.
- Revisit this baseline monthly; record the snapshot date and source.

## Current limitations

- No verified download count or monthly active-user figure is available.
- No user feedback submissions were available in the repository at the snapshot time.
- No public release has been published yet.
- No external production usage has been independently verified.
