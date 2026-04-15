---
phase: "03"
plan: "02"
status: complete
started: "2026-04-15"
completed: "2026-04-15"
duration_seconds: 184
subsystem: "preferences-and-accessibility"
tags:
  - weekend-toggle
  - keyboard-navigation
  - dark-mode
  - cookies
  - accessibility
dependency_graph:
  requires:
    - "03-01"
  provides:
    - "weekend-toggle-with-persistence"
    - "keyboard-navigation-roving-tabindex"
    - "dark-mode-css"
  affects:
    - "src/app.js"
    - "src/calendar.js"
    - "style.css"
    - "index.html"
tech_stack:
  added:
    - "exported initKeyboardNav(gridEl) for Strategy pattern testability"
    - "CSS @media (prefers-color-scheme: dark) block"
    - "CSS :focus:not(:focus-visible) for keyboard-only focus ring"
  patterns:
    - "Roving tabindex for accessible grid navigation (ARIA best practice)"
    - "Strategy pattern — initKeyboardNav extracted as exported pure function for testing"
    - "Event delegation — one keydown listener on grid container, not on individual cells"
key_files:
  created:
    - "tests/keyboard-nav.test.js"
  modified:
    - "src/app.js"
    - "src/calendar.js"
    - "style.css"
    - "index.html"
decisions:
  - "initKeyboardNav exported from app.js for testability without full DOM boot"
  - "Tests use minimal DOM stubs to load app.js module without crashing"
  - "ArrowUp/Down delta=7 operates on enabled-cell list, not raw index (skips disabled weekends)"
  - "CSS :focus:not(:focus-visible) hides ring on mouse click, shows on keyboard"
  - "Dark at-home (#64B5F6) and WFA (#FFB74D) get dark text (#121212) for contrast on light backgrounds"
metrics:
  duration: "3 minutes 4 seconds"
  completed: "2026-04-15"
  tasks_completed: 3
  files_changed: 4
requirements:
  - FR-4
  - FR-10
  - FR-13
---

# Phase 03 Plan 02: Weekend Toggle, Keyboard Nav, and Dark Mode Summary

## One-liner

Weekend cookie persistence + roving tabindex keyboard navigation + OS dark mode CSS with lighter status color variants and #42A5F5 today indicator.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Add weekend attributes to calendar.js and weekend toggle + cookie wiring to app.js | `472e3ed` (pre-committed) | src/calendar.js, src/app.js, index.html |
| 2 | Add roving tabindex keyboard navigation with tests (TDD) | `8ef6329` | src/app.js, tests/keyboard-nav.test.js |
| 3 | Add disabled weekend CSS, focus ring CSS, and dark mode media query | `f9d54e8` | style.css |

## Key Files

### Created
- `tests/keyboard-nav.test.js` — 11 unit tests covering ArrowRight/Left/Up/Down wrapping, Enter/Space cycling, disabled weekend cell skipping

### Modified
- `src/calendar.js` — Accepts `weekendsEnabled` param; adds `data-weekend="true"` and `data-disabled="true"` to Sat/Sun cells
- `src/app.js` — Cookie persistence for weekend toggle; `restoreRovingTabindex()`; `initKeyboardNav(gridEl)` exported for testability; `focusedDay` tracking
- `index.html` — `.cal-preferences` div with `#toggle-weekends` checkbox (already present from pre-commit)
- `style.css` — `[data-disabled="true"]` opacity/pointer-events; `.cal-cell:focus` ring; `.cal-preferences` layout; full `@media (prefers-color-scheme: dark)` block

## Decisions Made

1. **initKeyboardNav exported for testability:** Rather than testing keyboard nav through full app.js side-effect import (which requires exact DOM structure), `initKeyboardNav(gridEl)` is exported as a pure function. Tests call it with a mock grid. This is the Strategy pattern — behavior is encapsulated in a named, injectable function.

2. **Minimal DOM stubs in test file:** `keyboard-nav.test.js` creates stub elements for all IDs that app.js needs at module load (`cal-grid`, `cal-title`, `stats-average`, `stats-totals`, `toggle-weekends`, `btn-prev`, `btn-next`) before the dynamic import. This avoids refactoring app.js's boot sequence.

3. **Arrow navigation over enabled-cell list:** The keydown handler builds `cells = querySelectorAll('[data-day]:not([data-disabled="true"])')`. Delta arithmetic and modular wrapping operate on this filtered list, so disabled weekend cells are naturally skipped without any special skip loop.

4. **CSS focus-visible exception:** `.cal-cell:focus:not(:focus-visible)` hides the outline on mouse click while preserving it for keyboard users — standard accessible pattern.

5. **Dark mode text contrast:** At-home (#64B5F6, light blue) and WFA (#FFB74D, amber) cells receive `color: #121212` in dark mode because their lighter backgrounds against the dark body need dark foreground text for WCAG contrast.

## Test Results

103 tests passing (11 new keyboard-nav tests + 92 from prior plans)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] app.js module-level DOM access prevented test import**
- **Found during:** Task 2 TDD RED phase
- **Issue:** `app.js` calls `document.getElementById('toggle-weekends')` at module load; returns `null` in jsdom test environment before DOM is ready, causing `Cannot set properties of null` crash
- **Fix:** Added `setupAppDom()` in the test file to create stub elements before the dynamic `import('../src/app.js')`. No changes to app.js boot sequence.
- **Files modified:** `tests/keyboard-nav.test.js`
- **Commit:** `8ef6329`

**2. [Rule 2 - Design] initKeyboardNav extracted as exported function**
- **Found during:** Task 2 TDD design
- **Issue:** Keyboard handler was registered inline as anonymous closure in app.js, not testable without full DOM boot
- **Fix:** Extracted into `export function initKeyboardNav(gridEl)` (Strategy pattern). Called as `initKeyboardNav(grid)` in the app boot sequence — identical runtime behavior, better testability
- **Files modified:** `src/app.js`
- **Commit:** `8ef6329`

**3. [Continuity] Task 1 was pre-committed by user**
- **Found during:** Task 1 verification
- **Issue:** Commit `472e3ed` ("new thing who dis") already contained calendar.js weekend attributes, app.js cookie wiring, and index.html toggle. Working tree was clean.
- **Action:** Verified all Task 1 acceptance criteria against committed code, confirmed tests green, proceeded to Task 2. No re-commit needed.

## Known Stubs

None — all features are fully wired with real data sources.

## Self-Check

Files created/modified:
- `tests/keyboard-nav.test.js` — FOUND
- `src/app.js` — FOUND (modified)
- `style.css` — FOUND (modified)

Commits:
- `8ef6329` — Task 2 commit
- `f9d54e8` — Task 3 commit
- `472e3ed` — Task 1 pre-committed by user
