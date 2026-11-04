# PDFKit Preparation Roadmap

This roadmap tracks the original five preparation phases. A phase is marked complete only when its external or operational outcomes are verified; repository scaffolding alone does not count as adoption or a submitted application.

## Phase 1 — Legal foundation

**Status: Repository work completed; periodic legal review remains advisable.**

- [x] Review first-party code and third-party dependency notices.
- [x] Add an MIT licence for original project code and documentation.
- [x] Add copyright information and third-party notices.
- [x] Clarify that third-party dependencies and assets retain their own licences.

## Phase 2 — Project documentation

**Status: Repository work completed.**

- [x] Improve README and project setup instructions.
- [x] Add CONTRIBUTING.md and CODE_OF_CONDUCT.md.
- [x] Add SECURITY.md and SUPPORT.md.
- [x] Document privacy and temporary-file behavior.
- [x] Add issue and pull-request templates.

## Phase 3 — Engineering quality

**Status: Implementation in place; latest CI and first public release verification pending.**

- [x] Add and expand automated tests.
- [x] Add GitHub Actions CI for tests, builds, and Docker image validation.
- [x] Document supported formats, privacy behavior, and deployment limitations.
- [x] Add CHANGELOG.md.
- [x] Add a tag-triggered release workflow that re-runs tests, builds, and Docker validation before publishing.
- [ ] Verify the latest main-branch CI run is green.
- [ ] Create and verify the first versioned GitHub release.

## Phase 4 — Community adoption

**Status: Feedback infrastructure ready; real adoption evidence still needs to be earned.**

- [x] Record a dated public GitHub metrics baseline in [COMMUNITY_ADOPTION.md](./COMMUNITY_ADOPTION.md).
- [x] Add a user-feedback issue template and link it from README.
- [x] Document a privacy-conscious measurement plan.
- [ ] Invite real users to test with non-sensitive sample documents.
- [ ] Review, label, and resolve genuine issues and feedback as they arrive.
- [ ] Gather verified usage/download evidence if available and publish meaningful releases.
- [ ] Refresh the adoption metrics snapshot monthly.

## Phase 5 — OpenAI Codex for Open Source application

**Status: Application prepared in principle; maintainer details and submission remain outstanding.**

- [x] Identify the official Codex for Open Source program and application requirements.
- [x] Verify the public repository URL and record honest public adoption signals.
- [x] Prepare project and API-credit use-case answers without claiming unverified usage.
- [ ] Confirm maintainer legal name, ChatGPT-account email, primary/core maintainer role, and OpenAI Organization ID.
- [ ] Review the program terms and final application answers.
- [ ] Submit through the official OpenAI form and retain the confirmation.

## Integrity notes

- Do not fabricate stars, downloads, active users, customer testimonials, feedback, or production usage.
- Do not collect document contents, filenames, passwords, or personal data for analytics.
- An application does not guarantee selection or benefits.
- The first release must be created only after its tag-triggered verification workflow succeeds.
