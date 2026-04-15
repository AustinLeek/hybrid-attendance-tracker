import { STATUS } from './storage.js';

/**
 * Calculate average in-office days per week.
 * Formula: (inOffice / eligibleDays) * 5
 *
 * Denominator = all days in the month minus disabled weekends, time-off, and WFA.
 * Past/future makes no difference — every day in the month is treated equally.
 * Unset days count in the denominator (they're workdays you weren't in office).
 *
 * Returns 0 when denominator is zero (no eligible days).
 *
 * @param {Array<{status: string, isWeekend: boolean, isFuture: boolean}>} days
 * @param {boolean} weekendsEnabled
 * @returns {number} Average days per week
 */
export function calcAverage(days, weekendsEnabled) {
  let inOffice = 0;
  let denominator = 0;

  for (const day of days) {
    if (day.isWeekend && !weekendsEnabled) continue;
    if (day.status === STATUS.TIME_OFF) continue;
    if (day.status === STATUS.WFA) continue;

    denominator++;
    if (day.status === STATUS.IN_OFFICE) {
      inOffice++;
    }
  }

  if (denominator === 0) return 0;
  return (inOffice / denominator) * 5;
}
