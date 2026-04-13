import { loadMonth, saveMonth, STATUS } from './storage.js';
import { toMonthKey } from './dates.js';

const STATUS_CYCLE = [
  STATUS.UNSET,
  STATUS.IN_OFFICE,
  STATUS.AT_HOME,
  STATUS.TIME_OFF,
  STATUS.WFA,
];

export const AppState = {
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,  // 1-indexed
  days: {},
  _subscribers: [],

  subscribe(fn) {
    this._subscribers.push(fn);
  },

  notify() {
    for (const fn of this._subscribers) fn(this);
  },

  loadCurrentMonth() {
    const key = toMonthKey(this.year, this.month);
    const stored = loadMonth(key);
    this.days = (stored && stored.days) ? { ...stored.days } : {};
    this.notify();
  },

  navigate(delta) {
    this.month += delta;
    if (this.month > 12) { this.month = 1; this.year++; }
    if (this.month < 1)  { this.month = 12; this.year--; }
    this.loadCurrentMonth();
  },

  cycleDay(dayNum) {
    const current = this.days[dayNum] || STATUS.UNSET;
    const idx = STATUS_CYCLE.indexOf(current);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    if (next === STATUS.UNSET) {
      delete this.days[dayNum];
    } else {
      this.days[dayNum] = next;
    }
    saveMonth(toMonthKey(this.year, this.month), this.days);
    this.notify();
  },
};
