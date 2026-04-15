# Phase 1: Foundation - Research

**Researched:** 2026-04-13
**Domain:** Vanilla JS browser storage, date safety, arithmetic
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Pure HTML/CSS/vanilla JS — no frameworks, no build tools, no dependencies (NFR-1)
- Static files served from repo root on GitHub Pages (NFR-2)
- localStorage keyed by month (`attendance-YYYY-MM`) with schemaVersion in every write
- Cookies with Secure, SameSite=Lax, 365-day expiry for preferences
- All date construction via numeric Date constructor (`new Date(year, month, day)`)

### Claude's Discretion
All implementation choices are at Claude's discretion — pure infrastructure phase

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FR-11 | Data stored in localStorage keyed by month (`attendance-YYYY-MM`). Schema includes version key. All localStorage access wrapped in try/catch with graceful fallback. | storageAvailable() detection pattern + schemaVersion object shape |
| FR-12 | User preferences stored via document.cookie with Secure, SameSite=Lax, 365-day expiry. | setCookie/getCookie helper patterns from MDN + javascript.info |
| NFR-1 | Zero dependencies — pure HTML/CSS/vanilla JS, no build tools. | No libraries; all patterns hand-written using platform APIs only |
| NFR-4 | All date construction uses numeric Date constructor — never string parsing. | MDN-confirmed: date-only ISO strings parse as UTC midnight (historical spec error) |
| NFR-5 | All localStorage and cookie operations wrapped in try/catch; app functions in degraded state if storage unavailable. | MDN storageAvailable() + per-call try/catch pattern |
</phase_requirements>

---

## Summary

This phase delivers four pure-JS modules: a localStorage adapter, a cookie helper, date construction utilities, and the average calculation formula. There are no third-party libraries involved — all patterns map directly to platform APIs (Web Storage API, document.cookie, Date constructor). The only external constraint is NFR-1 (zero dependencies), which eliminates entire solution categories (no js-cookie, no date-fns, no Temporal polyfill).

The most critical correctness requirement is the UTC date bug (NFR-4). Passing a date-only ISO string like `"2025-01-15"` to `new Date()` triggers a historical spec error in the ECMAScript standard: date-only forms are parsed as UTC midnight, not local midnight. In a UTC-5 timezone this silently produces January 14. The numeric constructor `new Date(year, month, day)` always produces local midnight, so it is mandatory throughout the entire codebase.

The localStorage adapter has two non-obvious failure modes: (1) private browsing in some browsers provides a zero-quota storage object that throws on `setItem` rather than being absent, so a `setItem`-based availability probe (the MDN `storageAvailable()` pattern) is required; (2) quota exceeded errors must be distinguished from unavailable storage. Both are handled by wrapping every call site in try/catch and returning a silent no-op or null on failure.

**Primary recommendation:** Write four files — `storage.js`, `cookies.js`, `dates.js`, `calc.js` — each exporting pure functions, tested in Node with Vitest (jsdom environment for storage mocks).

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| (none) | — | All implementation uses platform APIs | NFR-1: zero dependencies |

### Supporting (test infrastructure only — not shipped)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vitest | 3.x (latest) | Unit test runner | No build tool needed; runs .js files natively with `--environment jsdom` |
| @vitest/coverage-v8 | 3.x | Coverage reporting | Optional; only if coverage gate desired |

**Note on test tooling:** Vitest is not a runtime dependency and does not ship. NFR-1 prohibits shipped dependencies only. A `package.json` with `devDependencies` for Vitest is acceptable and does not violate NFR-1. Verified: Vitest 3.x supports vanilla JS `.js` files with `environment: 'jsdom'` for localStorage/cookie mocking.

**Installation (dev only):**
```bash
npm install --save-dev vitest @vitest/coverage-v8
```

**Version verification:**
```bash
npm view vitest version          # latest: 3.x as of 2026-04
npm view @vitest/coverage-v8 version
```

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vitest | Jest | Jest requires more config for ESM; Vitest is lighter and config-free for vanilla JS |
| Vitest | Native browser test | Browser tests are slower and harder to automate in CI; unit logic has no real DOM dependency |
| document.cookie helpers | js-cookie | js-cookie is cleaner but violates NFR-1 |

---

## Architecture Patterns

### Recommended File Structure
```
src/
├── storage.js     # localStorage adapter — read/write/clear per month key
├── cookies.js     # setCookie / getCookie / deleteCookie helpers
├── dates.js       # date construction, day-of-week, days-in-month utilities
└── calc.js        # average in-office calculation formula
tests/
├── storage.test.js
├── cookies.test.js
├── dates.test.js
└── calc.test.js
vitest.config.js
package.json       # devDependencies only
```

### Pattern 1: localStorage Adapter with storageAvailable Probe

**What:** Probe storage availability once on module load using a `setItem`/`removeItem` round-trip. Cache the result. All subsequent calls are no-ops if unavailable.

**When to use:** Required — private browsing on Safari/Firefox throws from `setItem`, not from property access.

```javascript
// Source: MDN Web Storage API
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
function storageAvailable(type) {
  let storage;
  try {
    storage = window[type];
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      e.name === 'QuotaExceededError' &&
      storage &&
      storage.length !== 0
    );
  }
}
```

### Pattern 2: Per-Call try/catch on Every Storage Operation

**What:** Even after the probe, individual `setItem` calls can throw (quota exceeded mid-session). Wrap each call.

```javascript
function saveMonth(yearMonth, data) {
  if (!_available) return false;
  try {
    const payload = { schemaVersion: SCHEMA_VERSION, ...data };
    localStorage.setItem('attendance-' + yearMonth, JSON.stringify(payload));
    return true;
  } catch (e) {
    return false;
  }
}

function loadMonth(yearMonth) {
  if (!_available) return null;
  try {
    const raw = localStorage.getItem('attendance-' + yearMonth);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.schemaVersion === 'undefined') return null;
    return parsed;
  } catch (e) {
    return null;  // corrupt payload — return empty state, never throw
  }
}
```

### Pattern 3: Numeric Date Constructor (MANDATORY)

**What:** Always construct dates with three numeric arguments. Never pass a string to `new Date()`.

**Why it matters:** `new Date('2025-01-15')` is UTC midnight → January 14 in UTC-5. The numeric constructor uses local time unconditionally.

```javascript
// CORRECT — local midnight
const d = new Date(year, month, day);  // month is 0-indexed

// FORBIDDEN — UTC midnight, wrong in negative-offset timezones
const d = new Date('2025-01-15');
```

**Utility functions:**
```javascript
function daysInMonth(year, month) {
  // month is 1-indexed for human use; Date(year, month, 0) gives last day of prior month
  return new Date(year, month, 0).getDate();
}

function dayOfWeek(year, month, day) {
  // Returns 0=Sunday … 6=Saturday
  return new Date(year, month - 1, day).getDay();
}
```

### Pattern 4: Cookie Helpers

**What:** Minimal `setCookie`/`getCookie` functions using `document.cookie` string API directly.

```javascript
// Source: javascript.info/cookie
function setCookie(name, value, attributes) {
  attributes = { path: '/', ...attributes };
  let cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);
  for (const key in attributes) {
    cookie += '; ' + key;
    if (attributes[key] !== true) cookie += '=' + attributes[key];
  }
  document.cookie = cookie;
}

function getCookie(name) {
  const matches = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)')
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

// Usage — 365-day Secure SameSite=Lax cookie
// Note: 'Secure' attribute is silently ignored on non-HTTPS (localhost).
// max-age=31536000 = 60*60*24*365
setCookie('weekends-enabled', '0', {
  'max-age': 31536000,
  'SameSite': 'Lax',
  'Secure': true
});
```

**Secure attribute caveat (HIGH confidence):** `document.cookie` will silently drop the `Secure` flag on `http://` origins. On GitHub Pages (HTTPS) this works correctly. During local development over `file://` or `http://`, the Secure flag is ignored without error — the cookie still sets, just without the flag. This is expected behavior and not a bug in the helper.

### Pattern 5: Average Calculation Formula

**What:** Compute `(in-office days) / (denominator) × 5` where denominator excludes unset, future, time-off, and WFA days.

```javascript
// Source: FR-5 in REQUIREMENTS.md
function calcAverage(days) {
  // days: array of { status: 'in-office'|'at-home'|'time-off'|'wfa'|'unset', isWeekend, isFuture }
  let inOffice = 0;
  let denominator = 0;

  for (const day of days) {
    if (day.isWeekend && !day.weekendsEnabled) continue;
    if (day.isFuture) continue;
    if (day.status === 'unset') continue;
    if (day.status === 'time-off') continue;
    if (day.status === 'wfa') continue;
    if (day.status === 'in-office') {
      inOffice++;
      denominator++;
    } else if (day.status === 'at-home') {
      denominator++;
    }
  }

  if (denominator === 0) return null;  // display as "—"
  return (inOffice / denominator) * 5;
}
```

**Edge cases verified by requirements:**
- All-WFA month → denominator is 0 → returns null → display "—"
- All-time-off month → denominator is 0 → returns null → display "—"
- Empty month → denominator is 0 → returns null → display "—"
- Normal mid-month → counts correctly
- Toggled-weekend → days with isWeekend=true are included in loop when weekendsEnabled=true

### Anti-Patterns to Avoid
- **`new Date(isoString)`** for date-only strings — UTC midnight bug, wrong in negative UTC-offset timezones
- **`localStorage.setItem` without try/catch** — throws in private browsing, quota exceeded
- **`JSON.parse(raw)` without try/catch** — throws on corrupt localStorage payload
- **Testing `if (localStorage)` to detect availability** — does not catch zero-quota private browsing
- **Using `expires=` with a Date string in setCookie** — prefer `max-age` (simpler, no date arithmetic)
- **Storing preferences in localStorage** — requirements explicitly use cookies for preferences (FR-12)

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Test runner | Custom test harness | Vitest | Edge-case coverage, watch mode, JSDOM |
| Storage schema migration | Custom version-diff runner | Simple `if (parsed.schemaVersion < N)` guard | V1 has one schema — migration infrastructure is overkill until V2 |
| Cookie parsing | Regex-free custom parser | The regex pattern from javascript.info | `document.cookie` returns a single string; regex is the correct parse approach |

**Key insight:** This phase has no external library use at all in shipped code. The only "don't hand-roll" protection is on the test runner — using Vitest instead of a custom `assert()` harness.

---

## Common Pitfalls

### Pitfall 1: UTC Midnight Date Bug
**What goes wrong:** `new Date('2025-01-15')` returns midnight UTC, which displays as January 14 in any timezone west of Greenwich (UTC-1 through UTC-12, covering the Americas).
**Why it happens:** Historical ECMAScript spec error — date-only ISO strings are parsed as UTC to match ISO 8601, but this was changed from original behavior and cannot be reverted.
**How to avoid:** Exclusively use `new Date(year, month, day)` — month is 0-indexed. Lint or grep for `new Date(` followed by a string argument.
**Warning signs:** Tests pass in UTC (CI server) but produce wrong day in UTC-5 local dev; dates appear as "yesterday" in US timezones.

### Pitfall 2: Private Browsing localStorage
**What goes wrong:** `localStorage` object exists but throws `DOMException` on every `setItem`. Code that checks `typeof localStorage !== 'undefined'` passes, then crashes at runtime.
**Why it happens:** Safari and older Firefox give a zero-quota storage object rather than `null` in private mode.
**How to avoid:** Use the MDN `storageAvailable()` probe (writes and removes a test key) at module initialization. Cache the boolean result.
**Warning signs:** Works in normal browsing, silently crashes in private/incognito tab.

### Pitfall 3: Corrupt JSON in localStorage
**What goes wrong:** `JSON.parse(localStorage.getItem(key))` throws `SyntaxError` when the value is malformed (e.g., partially written, manually edited by user in DevTools).
**Why it happens:** localStorage is mutable by the user; partial writes can happen on browser crash.
**How to avoid:** Wrap `JSON.parse` in try/catch, return `null` on failure, treat null as empty state.
**Warning signs:** App crashes for users who have manually edited storage.

### Pitfall 4: schemaVersion Missing After Schema Evolution
**What goes wrong:** Future code reads a stored payload without `schemaVersion` and assumes latest schema, causing field access errors.
**Why it happens:** V1 payloads written before schema versioning was added.
**How to avoid:** Add `schemaVersion: 1` to every `setItem` write from day one. On `getItem`, if `schemaVersion` is absent, treat as corrupt (return null / empty state).
**Warning signs:** Works for new users, breaks for returning users with old data.

### Pitfall 5: Secure Cookie Flag on HTTP
**What goes wrong:** The `Secure` attribute is silently dropped when `document.cookie` is set on an `http://` or `file://` origin. The cookie is still written, just without the flag.
**Why it happens:** Browsers enforce that Secure cookies require HTTPS; on non-HTTPS origins the attribute is ignored without error.
**How to avoid:** Understand this is expected and not a bug. On GitHub Pages (always HTTPS) the flag applies correctly. Do not test cookie security flags over localhost http.
**Warning signs:** DevTools shows cookie set without `Secure` in local dev — this is normal.

---

## Code Examples

### Verified localStorage Save/Load Pattern
```javascript
// Source: MDN Web Storage API (see Sources)
const SCHEMA_VERSION = 1;
const _available = storageAvailable('localStorage');

function saveMonth(yearMonth, days) {
  if (!_available) return false;
  try {
    localStorage.setItem(
      'attendance-' + yearMonth,
      JSON.stringify({ schemaVersion: SCHEMA_VERSION, days })
    );
    return true;
  } catch (e) {
    return false;
  }
}

function loadMonth(yearMonth) {
  if (!_available) return null;
  try {
    const raw = localStorage.getItem('attendance-' + yearMonth);
    if (!raw) return null;
    const payload = JSON.parse(raw);
    if (!payload || typeof payload.schemaVersion === 'undefined') return null;
    return payload;
  } catch (e) {
    return null;
  }
}
```

### Verified Cookie Set (365-day, Secure, SameSite=Lax)
```javascript
// Source: javascript.info/cookie (see Sources)
setCookie('weekends-enabled', '0', {
  'max-age': 60 * 60 * 24 * 365,
  'SameSite': 'Lax',
  'Secure': true,
  'path': '/'
});
```

### Verified Numeric Date Construction
```javascript
// Source: MDN Date (see Sources)
// Get first day-of-week for a month (0=Sun … 6=Sat)
function firstDayOfWeek(year, month) {
  return new Date(year, month - 1, 1).getDay();
}

// Days in month — month is 1-indexed (1=Jan … 12=Dec)
function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `new Date('YYYY-MM-DD')` | `new Date(y, m, d)` | Always best practice; MDN now warns explicitly | Prevents silent off-by-one-day in US/Americas timezones |
| `expires=` date string in cookies | `max-age=N` seconds | max-age preferred since RFC 6265 (2011) | Simpler — no Date arithmetic, no UTC string formatting |
| No schema version in localStorage | `schemaVersion` key from v1 | Best practice; no library enforces it | Enables future migration without data loss |
| `if (localStorage)` availability check | `storageAvailable()` probe via setItem | MDN updated guidance circa 2020 | Catches zero-quota private browsing |

**Deprecated/outdated:**
- `expires=` cookie attribute with a formatted date string: still works but `max-age` is simpler and preferred.
- `try { window.localStorage } catch` as availability check: insufficient — does not catch private browsing quota-zero case.

---

## Open Questions

1. **Month key format (`attendance-YYYY-MM`)**
   - What we know: key pattern is specified in CONTEXT.md and FR-11
   - What's unclear: zero-padding convention for month (01 vs 1) — "YYYY-MM" implies zero-padded
   - Recommendation: use `String(month).padStart(2, '0')` to ensure `2025-01` not `2025-1`

2. **Days array shape in localStorage payload**
   - What we know: payload must include `schemaVersion` and per-day status
   - What's unclear: exact field names for day status values (`'in-office'` vs `'IN_OFFICE'` etc.)
   - Recommendation: planner should decide and document a STATUS constants object in `storage.js`

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.x |
| Config file | `vitest.config.js` — Wave 0 gap (does not exist yet) |
| Quick run command | `npx vitest run` |
| Full suite command | `npx vitest run --coverage` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FR-11 | saveMonth writes key with schemaVersion; loadMonth reads it back | unit | `npx vitest run tests/storage.test.js` | Wave 0 |
| FR-11 | loadMonth returns null for corrupt JSON (no throw) | unit | `npx vitest run tests/storage.test.js` | Wave 0 |
| FR-11 | saveMonth/loadMonth are no-ops when localStorage unavailable | unit | `npx vitest run tests/storage.test.js` | Wave 0 |
| FR-12 | setCookie writes with max-age, SameSite=Lax, Secure | unit | `npx vitest run tests/cookies.test.js` | Wave 0 |
| FR-12 | getCookie reads back the set value | unit | `npx vitest run tests/cookies.test.js` | Wave 0 |
| NFR-4 | daysInMonth(2025, 2) = 28; firstDayOfWeek(2025, 1) = local-time correct | unit | `npx vitest run tests/dates.test.js` | Wave 0 |
| NFR-4 | No `new Date(string)` calls anywhere in src/ | grep / lint | `grep -r "new Date(" src/ --include="*.js"` | N/A — manual |
| NFR-5 | All storage calls return false/null rather than throwing when storage fails | unit | `npx vitest run tests/storage.test.js` | Wave 0 |
| FR-5 (calc) | calcAverage: normal mix, all-WFA, all-time-off, empty, toggled-weekends | unit | `npx vitest run tests/calc.test.js` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run`
- **Per wave merge:** `npx vitest run --coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/storage.test.js` — covers FR-11, NFR-5
- [ ] `tests/cookies.test.js` — covers FR-12
- [ ] `tests/dates.test.js` — covers NFR-4
- [ ] `tests/calc.test.js` — covers FR-5 average formula edge cases
- [ ] `vitest.config.js` — environment: 'jsdom', test glob pattern
- [ ] `package.json` — devDependencies: vitest — framework install: `npm install --save-dev vitest`

---

## Sources

### Primary (HIGH confidence)
- [MDN Web Storage API — Using the Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API) — storageAvailable() probe pattern, private browsing behavior
- [MDN — Date constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) — date-only ISO string UTC parsing, numeric constructor behavior, historical spec error note
- [MDN — Secure cookie configuration](https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/Cookies) — Secure, SameSite=Lax guidance
- [javascript.info — Cookies](https://javascript.info/cookie) — setCookie/getCookie helper patterns, max-age vs expires

### Secondary (MEDIUM confidence)
- [DEV Community — The Subtle Trap of ISO Date Strings in JavaScript](https://dev.to/musatov/the-subtle-trap-of-iso-date-strings-in-javascript-49co) — real-world UTC bug examples
- [TrackJS — Failed to execute setItem on Storage](https://trackjs.com/javascript-errors/failed-to-execute-setitem-on-storage/) — private browsing error taxonomy
- [Vitest — Getting Started](https://vitest.dev/guide/) — jsdom environment configuration

### Tertiary (LOW confidence — informational only)
- [janmonschke.com — Simple frontend data migration](https://janmonschke.com/simple-frontend-data-migration/) — schema versioning pattern (library-free approach)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zero shipped dependencies confirmed by NFR-1; Vitest for dev is well-documented
- Architecture: HIGH — all patterns sourced from MDN official documentation
- Pitfalls: HIGH — UTC date bug and private browsing storage are well-documented, reproducible, MDN-confirmed
- Validation architecture: MEDIUM — Vitest jsdom environment confirmed working for vanilla JS, specific mock patterns for localStorage/document.cookie need implementation-time verification

**Research date:** 2026-04-13
**Valid until:** 2026-10-13 (stable platform APIs; Vitest version pin may drift sooner)
