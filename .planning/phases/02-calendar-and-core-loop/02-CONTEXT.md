# Phase 2: Calendar and Core Loop - Context

**Gathered:** 2026-04-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a fully interactive monthly calendar where users click days to cycle statuses, navigate between months, and have all data persist via the Phase 1 storage layer. Includes GitHub Pages deployment setup. No stats display, no weekend toggle, no dark mode — those are Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Status Colors & Visual Design
- Soft pastel status colors: In Office=#4CAF50 green, At Home=#2196F3 blue, Time Off=#9E9E9E gray, WFA=#FF9800 orange, Unset=transparent
- Today indicator: ring/outline border (2px solid accent color) — visible without competing with status fill
- Clean minimal visual style with rounded corners, subtle shadows, system font stack
- Cell size ~48px min-height, date number top-left, status fills entire cell background — comfortable mobile tap target

### Calendar Layout & Navigation
- Day-of-week headers use 3-letter abbreviations (Sun, Mon, Tue, Wed, Thu, Fri, Sat)
- Leading/trailing empty cells rendered with no content, same background as page
- Month/year header: "April 2026" centered with ◀ ▶ arrow buttons on each side
- Week starts on Sunday (matches JS getDay() convention, simplest implementation)

### State Architecture & Deployment
- Simple pub-sub event emitter: AppState object with subscribe/notify, components re-render on state change
- Single index.html with inline `<script type="module">` importing from src/. CSS in separate style.css
- GitHub Pages: .nojekyll file + ?v=1 cache-busting query params on CSS/JS references (per NFR-2)
- Small inline legend below calendar showing color swatches with status labels

### Claude's Discretion
- Exact shadow/border-radius values for cells
- Accent color for today indicator border
- Specific responsive breakpoint values
- Internal component decomposition within the above constraints

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/storage.js` — saveMonth(yearMonth, days), loadMonth(yearMonth), clearMonth(yearMonth), STATUS constants, SCHEMA_VERSION
- `src/cookies.js` — setCookie(name, value, attrs), getCookie(name), deleteCookie(name)
- `src/dates.js` — daysInMonth(year, month), firstDayOfWeek(year, month), createLocalDate(year, month, day), toMonthKey(year, month) — all 1-indexed months
- `src/calc.js` — calcAverage(days) — returns number or null

### Established Patterns
- Pure vanilla JS with ES module exports/imports
- 1-indexed month API across all date functions
- STATUS constants object as single source of truth for status strings
- All storage wrapped in try/catch, returns false/null on failure
- Vitest with jsdom for testing (devDependency only)

### Integration Points
- AppState will call saveMonth/loadMonth from storage.js for persistence
- Calendar grid will use daysInMonth/firstDayOfWeek/toMonthKey from dates.js
- Status cycling will use STATUS constants from storage.js
- index.html will import app entry point as ES module

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches within the decided constraints

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>
