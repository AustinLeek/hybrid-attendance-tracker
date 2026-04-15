---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-13
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.x |
| **Config file** | `vitest.config.js` (Wave 0 installs) |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npx vitest run --coverage` |
| **Estimated runtime** | ~3 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run`
- **After every plan wave:** Run `npx vitest run --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 0 | FR-11, NFR-5 | unit | `npx vitest run tests/storage.test.js` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 0 | FR-12 | unit | `npx vitest run tests/cookies.test.js` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 0 | NFR-4 | unit | `npx vitest run tests/dates.test.js` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 0 | FR-5 | unit | `npx vitest run tests/calc.test.js` | ❌ W0 | ⬜ pending |
| 01-grep | — | — | NFR-4 | grep | `grep -r "new Date(" src/ --include="*.js"` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.js` — environment: 'jsdom', test glob pattern
- [ ] `package.json` — devDependencies: vitest
- [ ] `tests/storage.test.js` — stubs for FR-11, NFR-5
- [ ] `tests/cookies.test.js` — stubs for FR-12
- [ ] `tests/dates.test.js` — stubs for NFR-4
- [ ] `tests/calc.test.js` — stubs for FR-5 average formula edge cases

*Framework install: `npm install --save-dev vitest`*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Secure cookie flag silently dropped on http:// | FR-12 | Browser security behavior, not testable in jsdom | Inspect cookie in DevTools on GitHub Pages (HTTPS) to confirm Secure flag is present |
| No `new Date(string)` calls in src/ | NFR-4 | Grep verification, not a runtime test | Run `grep -r "new Date(" src/ --include="*.js"` and verify all calls use numeric constructor |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
