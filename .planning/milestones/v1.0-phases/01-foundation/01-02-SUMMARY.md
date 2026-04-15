---
phase: 01-foundation
plan: 02
subsystem: testing
tags: [vitest, vanilla-js, dates, calc, timezone-safety, tdd]

requires:
  - phase: 01-foundation plan 01
    provides: STATUS constants from src/storage.js, vitest test infrastructure

provides:
  - src/dates.js: daysInMonth, firstDayOfWeek, createLocalDate, toMonthKey — numeric Date constructor only
  - src/calc.js: calcAverage with (inOffice/denominator)*5 formula, null for zero denominator
  - 24 new passing unit tests (14 dates + 10 calc)
  - Full suite: 46 passing tests across 4 files

affects: [02-ui, all phases constructing dates or computing averages]

tech-stack:
  added: []
  patterns:
    - "1-indexed month API: all date functions accept month 1=Jan, 12=Dec; internally convert to 0-indexed for Date constructor"
    - "Numeric Date constructor only: new Date(year, monthIndex, day) — never string-based, enforces NFR-4"
    - "Zero-denominator guard: calcAverage returns null (not 0) when no in-office or at-home days exist"
    - "Single source of truth: calc.js imports STATUS from storage.js — no hardcoded status strings"

key-files:
  created:
    - src/dates.js
    - src/calc.js
    - tests/dates.test.js
    - tests/calc.test.js
  modified: []

key-decisions:
  - "1-indexed month API chosen for all public-facing date functions — avoids off-by-one confusion for callers while keeping Date constructor internal"
  - "daysInMonth uses new Date(year, month, 0).getDate() trick — day 0 of next month equals last day of current month"
  - "calcAverage accepts weekendsEnabled as a parameter (not per-day) — single flag governs the whole calculation"
  - "calcAverage returns null (not 0, not NaN, not '---') for zero denominator — UI layer owns display formatting"

patterns-established:
  - "Pattern: 1-indexed month public API — all src/ date functions take month=1 for January; callers never see 0-indexed months"
  - "Pattern: numeric Date constructor guard — no string ever passed to new Date() anywhere in src/ (NFR-4)"
  - "Pattern: null sentinel for uncalculable averages — null distinguishes 'no data' from 0.0 (all at-home)"

requirements-completed: [NFR-4, NFR-1]

duration: 2min
completed: 2026-04-13
---

# Phase 01, Plan 02: Date Utilities and Average Calculation Summary

**Timezone-safe date utilities (numeric constructor only) and calcAverage formula with null guard for zero denominators, both TDD-verified with 24 new tests**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-13T16:09:17Z
- **Completed:** 2026-04-13T16:10:49Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- src/dates.js provides daysInMonth, firstDayOfWeek, createLocalDate, toMonthKey — all with 1-indexed month API and numeric Date constructor; NFR-4 enforced across entire src/
- src/calc.js provides calcAverage using STATUS constants from storage.js; returns (inOffice/denominator)*5 for valid data and null for zero denominators
- 46 total tests passing across all 4 test files — full foundation test suite green

## Task Commits

Each task was committed atomically:

1. **Task 1: Date construction utilities with TDD** - `3e2b70d` (feat)
2. **Task 2: Average in-office calculation with TDD** - `51b5b33` (feat)

_Note: Both tasks used TDD (RED then GREEN)_

## Files Created/Modified

- `src/dates.js` - daysInMonth, firstDayOfWeek, createLocalDate, toMonthKey with numeric Date constructor
- `src/calc.js` - calcAverage importing STATUS from storage.js, null for zero denominators
- `tests/dates.test.js` - 14 tests: leap years, month boundaries, day-of-week accuracy, zero-padding
- `tests/calc.test.js` - 10 tests: normal mix, all-WFA, all-time-off, empty, weekends toggle, future skip

## Decisions Made

- 1-indexed month public API adopted for all date functions (callers use 1=Jan, not 0=Jan) — reduces confusion in calling code while keeping Date constructor internals hidden
- `calcAverage` accepts `weekendsEnabled` as a second parameter rather than embedding it in day objects — single flag governs entire calculation, simpler contract
- `null` return from calcAverage for zero-denominator case — explicitly not 0 (which would mean "all at-home") and not NaN; UI layer displays null as "---"

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- All four src/ modules (storage, cookies, dates, calc) export pure functions ready for Phase 2 UI consumption
- Full test suite (46 tests, 4 files) passes — `npm test` exits 0
- NFR-4 enforced: `grep -rn "new Date(['\"]" src/` returns zero non-comment matches
- Phase 02 UI can import STATUS, saveMonth/loadMonth, daysInMonth/firstDayOfWeek, and calcAverage without further setup

---
*Phase: 01-foundation*
*Completed: 2026-04-13*
