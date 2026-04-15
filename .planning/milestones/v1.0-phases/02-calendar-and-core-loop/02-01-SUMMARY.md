---
phase: 02-calendar-and-core-loop
plan: 01
subsystem: ui
tags: [javascript, pub-sub, dom, state-management, calendar, jsdom, vitest, tdd]

requires:
  - phase: 01-foundation
    provides: STATUS constants and saveMonth/loadMonth/loadMonth storage API, toMonthKey/daysInMonth/firstDayOfWeek date utilities

provides:
  - AppState pub-sub object with cycleDay, navigate, loadCurrentMonth, subscribe, notify
  - renderCalendar pure DOM builder producing a CSS grid calendar from state
  - renderHeader pure function setting month/year title text
  - 32 new unit tests covering all AppState transitions and calendar rendering edge cases

affects:
  - 02-calendar-and-core-loop (plan 02 — app.js wiring imports AppState and calendar.js directly)

tech-stack:
  added: []
  patterns:
    - "STATUS_CYCLE array drives cycleDay: cycle wraps via modulo, wfa→unset deletes the key"
    - "loadCurrentMonth shallow-copies stored.days to decouple AppState from the JSON-parsed object"
    - "renderCalendar is a pure DOM builder — no event listeners, full container.innerHTML='' re-render"
    - "gridColumnStart set only on d===1; CSS auto-placement handles all subsequent cells"
    - "vi.mock hoisted before dynamic import allows AppState to receive mock implementations at module load"

key-files:
  created:
    - src/app-state.js
    - src/calendar.js
    - tests/app-state.test.js
    - tests/calendar.test.js
  modified: []

key-decisions:
  - "STATUS_CYCLE uses STATUS constants from storage.js — single source of truth, no string literals in app-state.js"
  - "cycleDay deletes key on wfa→unset (not sets to 'unset') to keep days object sparse and match storage contract"
  - "renderCalendar captures today once before cell loop to avoid midnight inconsistency across cell renders"
  - "gridColumnStart = String(startOffset + 1) — Sunday maps to '1', never '0', matching CSS grid 1-based columns"

patterns-established:
  - "TDD with vi.mock: mock dependencies before dynamic import so the module under test receives mock at load time"
  - "vi.setSystemTime pins today in calendar tests — tests must not depend on actual current date"

requirements-completed: [FR-1, FR-2, FR-7, FR-8, FR-9]

duration: 2min
completed: 2026-04-13
---

# Phase 02 Plan 01: AppState and CalendarGrid Summary

**AppState pub-sub with STATUS_CYCLE-driven cycleDay transitions and pure DOM CalendarGrid renderer, 32 tests green**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-04-13T16:39:35Z
- **Completed:** 2026-04-13T16:41:27Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- AppState singleton with subscribe/notify pub-sub, five-status cycleDay cycle (including key deletion on wfa→unset), year-wrapping navigate, and localStorage-wired loadCurrentMonth
- renderCalendar pure DOM function building the full grid with correct CSS gridColumnStart offset, data-status attributes, and today indicator logic
- renderHeader setting month/year title text from a MONTH_NAMES lookup
- 32 unit tests across app-state.test.js (17) and calendar.test.js (15), all passing alongside the 46 Phase 1 tests (78 total, 0 failures)

## Task Commits

Each task was committed atomically:

1. **Task 1: AppState pub-sub object with tests** - `8608af2` (feat)
2. **Task 2: CalendarGrid renderer with tests** - `30a41e5` (feat)

_Note: TDD tasks — tests written first (RED), implementation written second (GREEN), no separate REFACTOR step needed._

## Files Created/Modified

- `src/app-state.js` - AppState pub-sub object with cycleDay, navigate, loadCurrentMonth
- `src/calendar.js` - renderCalendar and renderHeader pure DOM functions
- `tests/app-state.test.js` - 17 unit tests for AppState with vi.mock on storage.js and dates.js
- `tests/calendar.test.js` - 15 unit tests for CalendarGrid with vi.mock and vi.setSystemTime

## Decisions Made

- STATUS_CYCLE array references STATUS constants imported from storage.js — avoids repeating string literals and stays in sync with storage module automatically
- cycleDay deletes the key entirely on wfa→unset rather than storing the string 'unset' — keeps the days object sparse, matching the storage contract where absent keys mean unset
- gridColumnStart applied only to d===1 (not via a leading empty-cell CSS trick) — subsequent cells use CSS auto-placement, which is cleaner and correct
- today captured once before the cell loop to avoid the theoretical midnight inconsistency if a cell render spans midnight

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- AppState and CalendarGrid are the complete interface contract for plan 02-02 (app.js wiring + HTML + deployment)
- app.js can import AppState directly and call subscribe, then call renderCalendar on each notify
- No blockers; all tests green
