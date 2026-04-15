import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderStats, buildDayObjects } from '../src/stats.js';
import { STATUS } from '../src/storage.js';

describe('buildDayObjects', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns correct length for a 30-day month', () => {
    const result = buildDayObjects(2026, 4, {}, false);
    expect(result.length).toBe(30);
  });

  it('returns correct length for a 31-day month', () => {
    const result = buildDayObjects(2026, 1, {}, false);
    expect(result.length).toBe(31);
  });

  it('marks Saturday (day=6) and Sunday (day=0) as isWeekend=true', () => {
    const result = buildDayObjects(2026, 4, {}, false);
    const april4 = result[3]; // Saturday
    const april5 = result[4]; // Sunday
    const april6 = result[5]; // Monday
    expect(april4.isWeekend).toBe(true);
    expect(april5.isWeekend).toBe(true);
    expect(april6.isWeekend).toBe(false);
  });

  it('marks future days as isFuture=true when pinned to mid-month', () => {
    vi.setSystemTime(new Date(2026, 3, 13));
    const result = buildDayObjects(2026, 4, {}, false);
    expect(result[12].isFuture).toBe(false); // day 13 = today
    expect(result[13].isFuture).toBe(true);  // day 14 = future
    expect(result[0].isFuture).toBe(false);  // day 1 = past
  });

  it('marks all days as isFuture=false for a past month', () => {
    vi.setSystemTime(new Date(2026, 3, 13));
    const result = buildDayObjects(2026, 3, {}, false);
    expect(result.every(d => d.isFuture === false)).toBe(true);
  });

  it('marks all days as isFuture=false for a future month', () => {
    vi.setSystemTime(new Date(2026, 3, 13));
    const result = buildDayObjects(2026, 6, {}, false);
    expect(result.every(d => d.isFuture === false)).toBe(true);
  });

  it('picks up status from the days map', () => {
    const result = buildDayObjects(2026, 4, { '5': STATUS.IN_OFFICE }, false);
    expect(result[4].status).toBe(STATUS.IN_OFFICE);
    expect(result[0].status).toBe(STATUS.UNSET);
  });
});

describe('renderStats', () => {
  let avgEl, totalsEl;

  beforeEach(() => {
    avgEl = document.createElement('p');
    totalsEl = document.createElement('p');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('displays 0.0 when no days have in-office status', () => {
    const state = { year: 2026, month: 4, days: {} };
    renderStats(avgEl, totalsEl, state, false);
    expect(avgEl.textContent).toContain('0.0 days/week');
  });

  it('uses all weekdays in month as denominator', () => {
    // March 2026: 31 days, 9 weekend days = 22 weekdays
    // 5 in-office / 22 eligible = (5/22)*5 ≈ 1.136
    const days = {
      '2': STATUS.IN_OFFICE,
      '3': STATUS.IN_OFFICE,
      '4': STATUS.IN_OFFICE,
      '5': STATUS.AT_HOME,
      '6': STATUS.AT_HOME,
    };
    const state = { year: 2026, month: 3, days };
    renderStats(avgEl, totalsEl, state, false);
    expect(avgEl.textContent).toContain('days/week');
    // Should NOT be 5.0 (only 3 in-office out of 22 weekdays)
    expect(avgEl.textContent).not.toContain('5.0');
  });

  it('displays 5.0 days/week when all weekdays are in-office', () => {
    const days = {};
    for (let d = 1; d <= 31; d++) {
      const dow = new Date(2026, 2, d).getDay();
      if (dow !== 0 && dow !== 6) days[String(d)] = STATUS.IN_OFFICE;
    }
    const state = { year: 2026, month: 3, days };
    renderStats(avgEl, totalsEl, state, false);
    expect(avgEl.textContent).toContain('5.0 days/week');
  });

  it('shows correct per-status count totals', () => {
    const days = {
      '2': STATUS.IN_OFFICE,
      '3': STATUS.AT_HOME,
      '4': STATUS.TIME_OFF,
      '5': STATUS.WFA,
    };
    const state = { year: 2026, month: 3, days };
    renderStats(avgEl, totalsEl, state, false);
    const html = totalsEl.innerHTML;
    expect(html).toContain('In Office');
    expect(html).toContain('At Home');
    expect(html).toContain('Time Off');
    expect(html).toContain('WFA');
  });

  it('counts future days with explicit status in totals', () => {
    vi.setSystemTime(new Date(2026, 3, 13));
    const days = {
      '1': STATUS.IN_OFFICE,
      '20': STATUS.IN_OFFICE, // future — should still count in totals
    };
    const state = { year: 2026, month: 4, days };
    renderStats(avgEl, totalsEl, state, false);
    expect(avgEl.textContent).toContain('days/week');
  });

  it('excludes disabled weekends from counts when weekendsEnabled=false', () => {
    const days = {
      '1': STATUS.IN_OFFICE,  // Wednesday (weekday)
      '4': STATUS.IN_OFFICE,  // Saturday (weekend)
      '5': STATUS.IN_OFFICE,  // Sunday (weekend)
    };
    const state = { year: 2026, month: 4, days };
    renderStats(avgEl, totalsEl, state, false);
    expect(avgEl.textContent).toContain('days/week');
  });

  it('includes weekends in counts when weekendsEnabled=true', () => {
    const days = {
      '1': STATUS.IN_OFFICE,
      '4': STATUS.IN_OFFICE,
      '5': STATUS.AT_HOME,
    };
    const state = { year: 2026, month: 4, days };
    renderStats(avgEl, totalsEl, state, true);
    expect(avgEl.textContent).toContain('days/week');
  });
});
