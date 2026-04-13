export const SCHEMA_VERSION = 1;

export const STATUS = {
  IN_OFFICE: 'in-office',
  AT_HOME: 'at-home',
  TIME_OFF: 'time-off',
  WFA: 'wfa',
  UNSET: 'unset',
};

// MDN storageAvailable() probe — catches zero-quota private browsing
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
      storage != null &&
      storage.length !== 0
    );
  }
}

const _available = storageAvailable('localStorage');

const YEAR_MONTH_RE = /^\d{4}-\d{2}$/;

export function saveMonth(yearMonth, days) {
  if (!YEAR_MONTH_RE.test(yearMonth)) return false;
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

export function loadMonth(yearMonth) {
  if (!_available) return null;
  try {
    const raw = localStorage.getItem('attendance-' + yearMonth);
    if (raw == null) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.schemaVersion === 'undefined') return null;
    return parsed;
  } catch (e) {
    return null;
  }
}

export function clearMonth(yearMonth) {
  if (!_available) return;
  try {
    localStorage.removeItem('attendance-' + yearMonth);
  } catch (e) {
    // silent — storage clear failure is non-critical
  }
}
