import { describe, it, expect } from 'vitest';
import { calcAverage } from '../src/calc.js';
import { STATUS } from '../src/storage.js';

// Helper to build a day object
function day(status, { isWeekend = false, isFuture = false } = {}) {
  return { status, isWeekend, isFuture };
}

describe('calcAverage', () => {
  it('divides in-office by all eligible days in the month', () => {
    // 12 in-office out of 22 weekdays (10 unset) = (12/22)*5 ≈ 2.727
    const days = [
      ...Array(12).fill(null).map(() => day(STATUS.IN_OFFICE)),
      ...Array(10).fill(null).map(() => day(STATUS.UNSET)),
    ];
    expect(calcAverage(days, false)).toBeCloseTo((12 / 22) * 5);
  });

  it('returns 5.0 when all days are in-office', () => {
    const days = Array(20).fill(null).map(() => day(STATUS.IN_OFFICE));
    expect(calcAverage(days, false)).toBe(5.0);
  });

  it('returns 0.0 when all days are at-home', () => {
    const days = Array(20).fill(null).map(() => day(STATUS.AT_HOME));
    expect(calcAverage(days, false)).toBe(0.0);
  });

  it('returns 0 when all days are unset', () => {
    // Unset days count in denominator — average is 0, not undefined
    const days = Array(20).fill(null).map(() => day(STATUS.UNSET));
    expect(calcAverage(days, false)).toBe(0);
  });

  it('returns 0 when all days are WFA (denominator = 0)', () => {
    const days = Array(20).fill(null).map(() => day(STATUS.WFA));
    expect(calcAverage(days, false)).toBe(0);
  });

  it('returns 0 when all days are time-off (denominator = 0)', () => {
    const days = Array(20).fill(null).map(() => day(STATUS.TIME_OFF));
    expect(calcAverage(days, false)).toBe(0);
  });

  it('excludes time-off and WFA from denominator', () => {
    // 5 in-office, 3 at-home, 2 time-off, 1 WFA, 9 unset = 20 days
    // denominator = 20 - 2 (time-off) - 1 (WFA) = 17
    // average = (5/17)*5 ≈ 1.471
    const days = [
      ...Array(5).fill(null).map(() => day(STATUS.IN_OFFICE)),
      ...Array(3).fill(null).map(() => day(STATUS.AT_HOME)),
      ...Array(2).fill(null).map(() => day(STATUS.TIME_OFF)),
      ...Array(1).fill(null).map(() => day(STATUS.WFA)),
      ...Array(9).fill(null).map(() => day(STATUS.UNSET)),
    ];
    expect(calcAverage(days, false)).toBeCloseTo((5 / 17) * 5);
  });

  it('skips weekend days when weekendsEnabled is false', () => {
    // 2 in-office weekdays + 2 in-office weekends — weekends excluded
    // denominator = 2, average = (2/2)*5 = 5.0
    const days = [
      day(STATUS.IN_OFFICE),
      day(STATUS.IN_OFFICE),
      day(STATUS.IN_OFFICE, { isWeekend: true }),
      day(STATUS.IN_OFFICE, { isWeekend: true }),
    ];
    expect(calcAverage(days, false)).toBe(5.0);
  });

  it('includes weekend days when weekendsEnabled is true', () => {
    // 2 in-office weekdays + 2 in-office weekends + 2 at-home weekdays
    // denominator = 6, average = (4/6)*5 ≈ 3.333
    const days = [
      day(STATUS.IN_OFFICE),
      day(STATUS.IN_OFFICE),
      day(STATUS.IN_OFFICE, { isWeekend: true }),
      day(STATUS.IN_OFFICE, { isWeekend: true }),
      day(STATUS.AT_HOME),
      day(STATUS.AT_HOME),
    ];
    expect(calcAverage(days, true)).toBeCloseTo((4 / 6) * 5);
  });

  it('treats future days the same as past days', () => {
    // 1 past in-office + 5 future in-office + 4 future unset = 10 days
    // denominator = 10, inOffice = 6, average = (6/10)*5 = 3.0
    const days = [
      day(STATUS.IN_OFFICE),
      ...Array(5).fill(null).map(() => day(STATUS.IN_OFFICE, { isFuture: true })),
      ...Array(4).fill(null).map(() => day(STATUS.UNSET, { isFuture: true })),
    ];
    expect(calcAverage(days, false)).toBe(3.0);
  });

  it('1 in-office out of 20 weekdays gives 0.25, not 5.0', () => {
    // denominator = 20, average = (1/20)*5 = 0.25
    const days = [
      day(STATUS.IN_OFFICE),
      ...Array(19).fill(null).map(() => day(STATUS.UNSET)),
    ];
    expect(calcAverage(days, false)).toBe(0.25);
  });
});
