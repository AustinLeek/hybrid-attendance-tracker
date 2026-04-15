---
phase: 3
slug: stats-preferences-and-polish
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-13
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.2.4 |
| **Config file** | `vitest.config.js` |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | FR-5 | unit | `npm test -- --reporter=verbose tests/stats.test.js` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | FR-6 | unit | `npm test -- --reporter=verbose tests/stats.test.js` | ❌ W0 | ⬜ pending |
| 03-01-03 | 01 | 1 | FR-5 | unit | `npm test -- --reporter=verbose tests/stats.test.js` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 1 | FR-4 | unit | `npm test -- --reporter=verbose tests/stats.test.js` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 1 | FR-4 | unit | `npm test -- --reporter=verbose tests/stats.test.js` | ❌ W0 | ⬜ pending |
| 03-02-03 | 02 | 1 | FR-10 | unit | `npm test -- --reporter=verbose tests/keyboard-nav.test.js` | ❌ W0 | ⬜ pending |
| 03-02-04 | 02 | 1 | FR-13 | manual | Visual check in OS dark mode | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/stats.test.js` — stubs for FR-4, FR-5, FR-6 (renderStats, toggle, cookie persistence)
- [ ] `tests/keyboard-nav.test.js` — stubs for FR-10 (arrow keys, Enter/Space, focus management)

*Existing infrastructure covers framework install (Vitest + jsdom already in devDependencies).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dark mode colors readable | FR-13 | Visual perception, contrast ratios | Enable OS dark mode, verify all status colors distinguishable on #121212 background |
| Focus ring visible on all status backgrounds | FR-10 | Visual perception | Tab into grid, arrow through cells with different statuses, verify ring visible |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
