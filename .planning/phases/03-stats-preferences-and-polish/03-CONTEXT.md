# Phase 3: Stats, Preferences, and Polish - Context

**Gathered:** 2026-04-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the stats display (average + totals), weekend toggle with cookie persistence, keyboard navigation for the calendar grid, and dark mode CSS — completing all remaining functional and visual requirements for v1.0.

</domain>

<decisions>
## Implementation Decisions

### Stats Display
- Stats panel positioned below the legend — natural reading flow, doesn't compete with calendar
- Average formatted as "X.X days/week" with 1 decimal place
- Per-status totals displayed as inline row with colored dots: "● 8 In Office · ● 4 At Home · ● 2 Time Off · ● 1 WFA" — reuses legend colors
- Average gets larger font size in its own row above the totals — it's the core value of the app

### Weekend Toggle
- Native `<input type="checkbox">` labeled "Include weekends" — zero-dependency, accessible by default
- Toggle positioned below the stats panel — settings grouped after data display
- Disabled weekends appear grayed out and unclickable — reduced opacity (0.3), pointer-events:none, no status color
- Default state: off (weekends excluded) — matches FR-4 "excluded by default"

### Keyboard Navigation
- Focus indicator: 2px ring matching today-indicator color (#1565C0) — consistent visual language
- Arrow keys wrap to next/previous row at grid edges — natural grid feel
- Roving tabindex pattern: single tab stop on grid, only focused cell has tabindex=0, arrows navigate cells
- Month navigation: focus follows to same day number (clamped to new month's max)

### Dark Mode
- Background: #121212 (Material dark surface)
- Status colors: same hues, slightly desaturated (~15% brightness reduction) to avoid "glow" on dark bg
- Text: #e0e0e0 body text, #424242 borders — high contrast without blinding
- Today indicator: lighten to #42A5F5 (lighter blue) since #1565C0 disappears on dark bg

### Claude's Discretion
- Exact desaturation values for dark mode status colors
- Responsive breakpoint adjustments for stats panel
- Internal component decomposition for stats rendering

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/calc.js` — `calcAverage(days, weekendsEnabled)` already handles weekend param, returns null for zero denominator
- `src/cookies.js` — `setCookie/getCookie/deleteCookie` ready for weekend toggle persistence
- `src/storage.js` — `STATUS` constants, `loadMonth/saveMonth` with schema versioning
- `src/dates.js` — `daysInMonth/firstDayOfWeek/toMonthKey` all 1-indexed month API
- `src/app-state.js` — pub-sub `AppState` with `subscribe/notify`, `cycleDay`, `navigate`

### Established Patterns
- Pub-sub via `AppState.subscribe(fn)` — all rendering triggered by `notify()`
- Event delegation on `#cal-grid` container — single click listener survives re-renders
- CSS attribute selectors `[data-status="value"]` drive all status colors — no JS class manipulation
- Vitest + jsdom for testing (devDependency)
- `?v=N` cache-busting on CSS/JS asset references

### Integration Points
- Stats component subscribes to AppState and re-renders on state change (same pattern as calendar)
- Weekend toggle reads/writes cookie via `getCookie/setCookie`, updates AppState, triggers re-render
- Keyboard navigation adds `keydown` listener on `#cal-grid`, manipulates `tabindex` on cells
- Dark mode: CSS `@media (prefers-color-scheme: dark)` block in style.css — no JS needed
- `calcAverage` needs day objects with `{status, isWeekend, isFuture}` — app.js must build these from state

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches within the decided constraints

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>
