/**
 * Date construction utilities.
 *
 * PUBLIC API: all functions use 1-indexed months (1=January, 12=December).
 * Internally converts to 0-indexed when calling the Date constructor.
 *
 * CRITICAL: Every Date is constructed with numeric arguments — never a string.
 * new Date('YYYY-MM-DD') parses as UTC midnight, causing off-by-one-day bugs
 * in timezones west of UTC (Americas). new Date(year, monthIndex, day) always
 * uses local midnight and is the only permitted construction pattern.
 */

/**
 * Returns the number of days in the given month.
 * @param {number} year  - Full year (e.g. 2025)
 * @param {number} month - 1-indexed month (1=Jan, 12=Dec)
 * @returns {number} Day count for the month
 */
export function daysInMonth(year, month) {
  // new Date(year, month, 0) — day 0 of the next month = last day of this month.
  // month is 1-indexed here, so passing it directly (without -1) targets the correct next month.
  return new Date(year, month, 0).getDate();
}

/**
 * Returns the 0-indexed day of the week for the 1st of the given month.
 * @param {number} year  - Full year (e.g. 2025)
 * @param {number} month - 1-indexed month (1=Jan, 12=Dec)
 * @returns {number} 0=Sunday, 1=Monday, ..., 6=Saturday
 */
export function firstDayOfWeek(year, month) {
  return new Date(year, month - 1, 1).getDay();
}

/**
 * Constructs a local-midnight Date. Use this as the ONLY way to create dates in the app.
 * @param {number} year  - Full year (e.g. 2025)
 * @param {number} month - 1-indexed month (1=Jan, 12=Dec)
 * @param {number} day   - Day of month (1-31)
 * @returns {Date}
 */
export function createLocalDate(year, month, day) {
  return new Date(year, month - 1, day);
}

/**
 * Returns a zero-padded 'YYYY-MM' key string, matching the localStorage key convention.
 * @param {number} year  - Full year (e.g. 2025)
 * @param {number} month - 1-indexed month (1=Jan, 12=Dec)
 * @returns {string} e.g. '2025-01', '2025-12'
 */
export function toMonthKey(year, month) {
  return year + '-' + String(month).padStart(2, '0');
}
