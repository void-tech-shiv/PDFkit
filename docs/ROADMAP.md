# PDFKit Project Preparation Roadmap

This roadmap covers preparing PDFKit as a reliable, usable, production-ready PDF utility and launching it to real users. It is a project roadmap—not an OpenAI, Codex, or funding application checklist.

## Phase 1 — Product scope and foundation

**Status: Foundation largely in place; keep the scope and supported behavior accurate.**

- [x] Establish the public repository and project structure.
- [x] Add the MIT licence for original project code and documentation.
- [x] Record copyright and third-party dependency notices.
- [x] Document the project setup, architecture, privacy behavior, and deployment constraints.
- [ ] Review the complete feature list against the actual working application.
- [ ] Define the first stable release scope and explicitly list unsupported features.
- [ ] Confirm the supported Node.js version, operating systems, browsers, and deployment targets.

## Phase 2 — Product functionality and user experience

**Status: Core implementation exists; perform a complete feature-by-feature verification before calling it release-ready.**

- [ ] Create a feature inventory for every PDF tool shown in the frontend.
- [ ] Verify each tool's frontend-to-backend request, response, and download flow.
- [ ] Verify supported input/output formats and document all limitations.
- [ ] Check file upload, file-size limits, validation, progress, cancellation, and download behavior.
- [ ] Check password-protected PDF workflows and clear error handling.
- [ ] Verify page selection, rotation, compression, conversion, and document-management options.
- [ ] Test empty, malformed, oversized, corrupted, and unsupported files.
- [ ] Review mobile layouts, accessibility, loading states, and error messages.
- [ ] Remove dead controls, placeholder actions, and misleading product claims.

## Phase 3 — Testing, security, and reliability

**Status: Engineering safeguards are implemented; latest CI verification and broader manual testing remain.**

- [x] Add automated tests for important validation and server-security behavior.
- [x] Add GitHub Actions CI for tests, application builds, and Docker image validation.
- [x] Restrict CORS to configured origins and validate file-size configuration.
- [x] Sanitize unexpected server errors returned to clients.
- [x] Harden the Docker runtime with a non-root user and reduced container privileges.
- [x] Add a changelog and tag-triggered release verification workflow.
- [ ] Verify the latest main-branch CI run is green.
- [ ] Run end-to-end tests for every user-facing PDF workflow.
- [ ] Test concurrent uploads, large files, timeouts, and temporary-file cleanup.
- [ ] Review dependency vulnerabilities and third-party licence obligations.
- [ ] Perform a production-configuration security and privacy review.
- [ ] Record test results and fix all release-blocking defects.

## Phase 4 — Production deployment and first release

**Status: Deployment configuration is documented; production deployment and release verification remain.**

- [ ] Choose and document the production hosting arrangement for frontend and backend.
- [ ] Configure production environment variables, allowed origins, file limits, and secrets.
- [ ] Choose suitable temporary/persistent storage and define retention and cleanup behavior.
- [ ] Configure HTTPS, domain, health checks, logs, and uptime monitoring.
- [ ] Verify that production storage permissions, capacity, and cleanup behavior are correct.
- [ ] Deploy to a staging environment and run smoke tests using non-sensitive sample PDFs.
- [ ] Verify backup, rollback, and recovery procedures where persistent data is used.
- [ ] Deploy the approved build to production.
- [ ] After CI is green, create the first versioned GitHub release and verify its assets and release notes.
- [ ] Test the public production URL from desktop and mobile.

## Phase 5 — Launch, feedback, and ongoing maintenance

**Status: Feedback infrastructure and documentation are ready; public launch and real-user evidence remain.**

- [x] Publish contribution, security, support, and feedback guidance.
- [x] Add a user-feedback issue template and a privacy-conscious measurement plan.
- [x] Record an honest public GitHub adoption baseline in [COMMUNITY_ADOPTION.md](./COMMUNITY_ADOPTION.md).
- [ ] Prepare a clear live demo and concise feature overview.
- [ ] Invite a small group of real users to test with non-sensitive sample documents.
- [ ] Triage genuine bug reports and prioritize fixes by severity and user impact.
- [ ] Publish release notes for meaningful updates.
- [ ] Monitor availability, error rates, performance, and storage usage without collecting document contents or filenames.
- [ ] Refresh project documentation and adoption metrics regularly.
- [ ] Maintain dependencies, security fixes, compatibility, and a public future-feature backlog.

## Release gates

A phase is complete only when its outcomes are verified—not merely because a checklist or workflow file exists.

1. **Feature gate:** Every feature included in the release scope works end to end.
2. **Quality gate:** Automated and manual tests pass, and no release-blocking security or privacy issue remains.
3. **Deployment gate:** Staging and production smoke tests pass with the intended configuration.
4. **Release gate:** The versioned release and its tag-triggered verification workflow succeed.
5. **Launch gate:** Users can access the product, report problems, and understand its limitations.

## Integrity and privacy notes

- Do not claim features, compatibility, uptime, downloads, active users, or customer feedback that have not been verified.
- Never use real users' sensitive documents for testing; use synthetic or non-sensitive sample files.
- Do not collect document contents, filenames, passwords, or personal data for product analytics.
- Temporary-file cleanup is best-effort unless the deployed storage system provides and verifies stronger guarantees.
