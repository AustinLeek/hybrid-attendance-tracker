import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveMonth, loadMonth, clearMonth, STATUS, SCHEMA_VERSION } from '../src/storage.js';

describe('storage module', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('saveMonth', () => {
    it('writes to localStorage key attendance-YYYY-MM with schemaVersion:1', () => {
      const days = { 1: 'in-office', 2: 'at-home' };
      saveMonth('2025-01', days);
      const raw = localStorage.getItem('attendance-2025-01');
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw);
      expect(parsed.schemaVersion).toBe(1);
      expect(parsed.days).toEqual(days);
    });

    it('returns true on successful save', () => {
      const result = saveMonth('2025-01', { 1: 'in-office' });
      expect(result).toBe(true);
    });

    it('returns false when localStorage.setItem throws (quota exceeded simulation)', () => {
      // Replace localStorage with a throwing mock for this test
      const orig = window.localStorage;
      const throwingStorage = {
        getItem: () => null,
        setItem: () => { throw new DOMException('QuotaExceededError', 'QuotaExceededError'); },
        removeItem: () => {},
        clear: () => {},
        length: 1, // non-zero so storageAvailable returns true
        key: () => null,
      };
      vi.stubGlobal('localStorage', throwingStorage);
      const result = saveMonth('2025-01', { 1: 'in-office' });
      expect(result).toBe(false);
      vi.stubGlobal('localStorage', orig);
    });

    it('rejects or normalizes yearMonth that does not match YYYY-MM format', () => {
      // Non-zero-padded month should return false or be rejected
      const result = saveMonth('2025-1', { 1: 'in-office' });
      expect(result).toBe(false);
    });
  });

  describe('loadMonth', () => {
    it('returns the saved payload for an existing key', () => {
      const days = { 1: 'in-office', 2: 'at-home' };
      saveMonth('2025-01', days);
      const result = loadMonth('2025-01');
      expect(result).not.toBeNull();
      expect(result.schemaVersion).toBe(1);
      expect(result.days).toEqual(days);
    });

    it('returns null for nonexistent key', () => {
      const result = loadMonth('2025-06');
      expect(result).toBeNull();
    });

    it('returns null for corrupt JSON — does not throw', () => {
      localStorage.setItem('attendance-2025-01', '{bad json');
      expect(() => loadMonth('2025-01')).not.toThrow();
      expect(loadMonth('2025-01')).toBeNull();
    });

    it('returns null for payload missing schemaVersion', () => {
      localStorage.setItem('attendance-2025-01', JSON.stringify({ days: { 1: 'in-office' } }));
      expect(loadMonth('2025-01')).toBeNull();
    });

    it('returns null when localStorage is unavailable', () => {
      // Simulate unavailable storage by making getItem throw
      vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
        throw new Error('Storage unavailable');
      });
      expect(loadMonth('2025-01')).toBeNull();
      vi.restoreAllMocks();
    });
  });

  describe('clearMonth', () => {
    it('removes the key from localStorage', () => {
      saveMonth('2025-01', { 1: 'in-office' });
      clearMonth('2025-01');
      expect(localStorage.getItem('attendance-2025-01')).toBeNull();
    });
  });

  describe('constants', () => {
    it('exports SCHEMA_VERSION as 1', () => {
      expect(SCHEMA_VERSION).toBe(1);
    });

    it('exports STATUS with expected values', () => {
      expect(STATUS.IN_OFFICE).toBe('in-office');
      expect(STATUS.AT_HOME).toBe('at-home');
      expect(STATUS.TIME_OFF).toBe('time-off');
      expect(STATUS.WFA).toBe('wfa');
      expect(STATUS.UNSET).toBe('unset');
    });
  });
});
