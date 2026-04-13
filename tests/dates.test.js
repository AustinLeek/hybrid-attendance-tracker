import { describe, it, expect } from 'vitest';
import { daysInMonth, firstDayOfWeek, createLocalDate, toMonthKey } from '../src/dates.js';

describe('daysInMonth', () => {
  it('returns 31 for January (month 1)', () => {
    expect(daysInMonth(2025, 1)).toBe(31);
  });

  it('returns 28 for February in a non-leap year', () => {
    expect(daysInMonth(2025, 2)).toBe(28);
  });

  it('returns 29 for February in a leap year (2024)', () => {
    expect(daysInMonth(2024, 2)).toBe(29);
  });

  it('returns 31 for December (month 12)', () => {
    expect(daysInMonth(2025, 12)).toBe(31);
  });

  it('returns 30 for April (month 4)', () => {
    expect(daysInMonth(2025, 4)).toBe(30);
  });
});

describe('firstDayOfWeek', () => {
  it('returns 3 for January 2025 (Wednesday)', () => {
    expect(firstDayOfWeek(2025, 1)).toBe(3);
  });

  it('returns 2 for April 2025 (Tuesday)', () => {
    expect(firstDayOfWeek(2025, 4)).toBe(2);
  });

  it('returns 4 for January 2026 (Thursday)', () => {
    expect(firstDayOfWeek(2026, 1)).toBe(4);
  });
});

describe('createLocalDate', () => {
  it('creates a date with correct year, month, and day (Jan 15)', () => {
    const d = createLocalDate(2025, 1, 15);
    expect(d.getFullYear()).toBe(2025);
    expect(d.getMonth()).toBe(0);
    expect(d.getDate()).toBe(15);
  });

  it('creates a date with correct year, month, and day (Dec 31)', () => {
    const d = createLocalDate(2025, 12, 31);
    expect(d.getFullYear()).toBe(2025);
    expect(d.getMonth()).toBe(11);
    expect(d.getDate()).toBe(31);
  });

  it('returns a Date instance', () => {
    expect(createLocalDate(2025, 6, 15)).toBeInstanceOf(Date);
  });
});

describe('toMonthKey', () => {
  it("returns '2025-01' for January", () => {
    expect(toMonthKey(2025, 1)).toBe('2025-01');
  });

  it("returns '2025-12' for December", () => {
    expect(toMonthKey(2025, 12)).toBe('2025-12');
  });

  it("returns '2025-09' for September (zero-padded)", () => {
    expect(toMonthKey(2025, 9)).toBe('2025-09');
  });
});
