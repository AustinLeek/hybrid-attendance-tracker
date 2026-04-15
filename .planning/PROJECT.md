# Hybrid Attendance Tracker

## What This Is

A static single-page web app for tracking your hybrid work schedule on a monthly calendar. Click each day to set your status (in office, at home, time off, or work from anywhere), see your average in-office days per week update live, and toggle weekend tracking on or off. Supports keyboard navigation and dark mode. Hosted on GitHub Pages with zero build steps.

## Core Value

Accurately calculate average in-office days per week, excluding time off and work-from-anywhere days from the denominator.

## Current State

**v1.0 MVP shipped 2026-04-15** — 3 phases, 6 plans, 1,928 LOC (JS/CSS/HTML/tests), 103 passing tests.

Tech stack: Pure HTML/CSS/vanilla JS, no frameworks, no build tools. Vitest + jsdom for testing.

## Requirements

### Validated

- [x] Attendance data persisted in localStorage across visits — v1.0
- [x] User preferences (weekend toggle) stored in cookies — v1.0
- [x] Monthly calendar grid showing all days of the current month — v1.0
- [x] Click/tap each day to cycle through statuses — v1.0
- [x] Color-coded status indicators for each status type — v1.0
- [x] Month navigation to view past and future months — v1.0
- [x] Current month shown by default — v1.0
- [x] Static HTML suitable for GitHub Pages deployment — v1.0
- [x] Weekends marked as "off" by default with toggle to enable — v1.0
- [x] Average in-office days per week calculation with live updates — v1.0
- [x] Per-status count totals update instantly — v1.0
- [x] Keyboard navigation (arrow keys, Enter/Space) — v1.0
- [x] Dark mode support via prefers-color-scheme — v1.0

### Active

None — all v1.0 requirements validated. Next milestone TBD.

### Out of Scope

- Team/multi-user views — this is personal tracking only
- Backend/database — all data stays client-side
- Authentication — no login needed
- Mobile app — web-only, responsive design works on mobile
- Export/reporting — v1 focuses on tracking and the average calculation
- Calendar sync (Google/Outlook) — out of v1 scope
- PWA / service worker — not needed for v1

## Context

- Hosted on GitHub Pages from a public repo (BarristanSelmy/hybrid-attendance-tracker)
- Must work as static files — no server-side processing
- Single user, single browser — localStorage and cookies are sufficient for persistence
- Target audience: hybrid worker wanting to see their in-office frequency at a glance

## Constraints

- **Tech stack**: Pure HTML/CSS/JS — no frameworks, no build tools, no dependencies
- **Hosting**: Must deploy directly to GitHub Pages with zero configuration
- **Storage**: Browser-only (localStorage for data, cookies for preferences)

## Key Decisions

| Decision | Rationale | Outcome |
|-|-|-|
| Static HTML over framework | GitHub Pages simplicity, no build step needed | ✓ Good — zero config deploy works perfectly |
| localStorage for attendance data | Persists across visits without a server | ✓ Good — simple, reliable for single-user |
| Cookies for user preferences | User requested cookie-based preference storage | ✓ Good — weekend toggle persists correctly |
| Personal-only scope | Keeps v1 simple, no auth/team complexity | ✓ Good — shipped in 3 days |
| Numeric Date constructor only | Prevents UTC timezone offset bugs | ✓ Good — zero date-related bugs |
| AppState pub-sub pattern | Single source of truth, automatic re-renders | ✓ Good — clean data flow throughout |
| Event delegation on grid | Survives innerHTML re-renders, single listener | ✓ Good — no listener cleanup needed |
| CSS attribute selectors for status colors | No JS class manipulation needed | ✓ Good — clean separation of concerns |
| initKeyboardNav extracted as export | Strategy pattern for testability | ✓ Good — 11 tests pass without full DOM boot |
| Roving tabindex with modular wrapping | Natural grid navigation feel | ✓ Good — intuitive keyboard experience |

---
*Last updated: 2026-04-15 after v1.0 milestone shipped*
