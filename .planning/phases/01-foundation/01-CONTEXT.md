# Phase 1: Foundation - Context

**Gathered:** 2026-04-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the invisible data infrastructure layer: localStorage adapter with schema versioning, cookie helpers for preferences, date construction utilities using numeric Date constructor only, and the average in-office calculation formula — all verified in isolation before any UI exists.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — pure infrastructure phase

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no existing code

### Established Patterns
- Pure HTML/CSS/vanilla JS — no frameworks, no build tools, no dependencies (NFR-1)
- Static files served from repo root on GitHub Pages (NFR-2)

### Integration Points
- localStorage keyed by month (`attendance-YYYY-MM`) with schemaVersion in every write
- Cookies with Secure, SameSite=Lax, 365-day expiry for preferences
- All date construction via numeric Date constructor (`new Date(year, month, day)`)

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure phase

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>
