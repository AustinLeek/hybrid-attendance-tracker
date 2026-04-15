# Retrospective — Hybrid Attendance Tracker

## Milestone: v1.0 — MVP

**Shipped:** 2026-04-15
**Phases:** 3 | **Plans:** 6

### What Was Built
- localStorage adapter with schemaVersion:1 and cookie helpers with Secure/SameSite/max-age
- Timezone-safe date utilities and calcAverage formula with null guard for zero denominators
- AppState pub-sub with STATUS_CYCLE-driven cycleDay and pure DOM CalendarGrid renderer
- Interactive HTML attendance tracker with month nav, localStorage persistence, GitHub Pages deploy
- Stats display panel with live average in-office days/week and per-status count totals
- Weekend toggle with cookie persistence, roving tabindex keyboard nav, dark mode CSS

### What Worked
- Phase-based decomposition kept each phase focused and deliverable
- TDD approach caught edge cases early (null denominators, quota exceeded, timezone bugs)
- AppState pub-sub pattern made adding features (stats, keyboard nav) clean — just subscribe
- CSS attribute selectors for status colors kept JS and CSS cleanly separated
- Event delegation pattern survived innerHTML re-renders without listener cleanup

### What Was Inefficient
- SUMMARY.md frontmatter `requirements_completed` was inconsistent — Phase 3 summaries didn't list requirement IDs
- Nyquist validation files were created but never completed (all draft status)
- Phase 3 ROADMAP checkbox wasn't auto-marked by the execute flow (minor tracking gap)

### Patterns Established
- Numeric Date constructor only (NFR-4) — prevents entire class of timezone bugs
- storageAvailable probe before any localStorage access — graceful degradation
- `data-*` attributes as the bridge between JS state and CSS presentation
- Module-level DOM references cached once, subscriber pattern handles all re-renders
- initKeyboardNav extracted as testable export (Strategy pattern)

### Key Lessons
- Cookie persistence is reliable for simple boolean preferences but fragile for complex state
- Roving tabindex with modular wrapping provides better UX than clamping at grid edges
- Dark mode requires re-thinking every color — lighter variants of status colors needed for contrast
- 103 tests across 8 files provided strong regression confidence when adding Phase 3 features

### Cost Observations
- Model mix: executor agents used Sonnet, verifier used Sonnet, orchestrator used Opus
- Sessions: 3 (one per day, 2026-04-13 through 2026-04-15)
- Notable: Parallel executor agents + worktree isolation kept context lean

---

## Cross-Milestone Trends

| Metric | v1.0 |
|-|-|
| Phases | 3 |
| Plans | 6 |
| Tests | 103 |
| LOC | 1,928 |
| Timeline | 3 days |
| Regressions | 0 |
