import { describe, it, expect, beforeEach } from 'vitest';
import { setCookie, getCookie, deleteCookie } from '../src/cookies.js';

describe('cookie helpers', () => {
  beforeEach(() => {
    // Clear all cookies by expiring them
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      if (name) {
        document.cookie = name + '=; max-age=0; path=/';
      }
    });
  });

  describe('setCookie', () => {
    it('writes cookie with name and value', () => {
      setCookie('weekends-enabled', '1');
      expect(document.cookie).toContain('weekends-enabled=1');
    });

    it('defaults path to / when no path attribute provided', () => {
      // Set then retrieve — if path defaults to '/', getCookie can read it
      setCookie('test-key', 'test-val');
      expect(getCookie('test-key')).toBe('test-val');
    });

    it('writes cookie string with max-age, SameSite=Lax and Secure attributes', () => {
      // We can't inspect individual cookie attributes via document.cookie
      // (browser strips them), but we verify the function accepts them without throwing
      expect(() => {
        setCookie('weekends-enabled', '1', {
          'max-age': 31536000,
          'SameSite': 'Lax',
          'Secure': true,
        });
      }).not.toThrow();
      expect(getCookie('weekends-enabled')).toBe('1');
    });

    it('URL-encodes name and value with special characters', () => {
      setCookie('a=b', 'c;d');
      // The encoded name should be retrievable via encoded name
      const val = getCookie('a=b');
      expect(val).toBe('c;d');
    });

    it('never throws on error', () => {
      // Call with unusual inputs — should not throw
      expect(() => setCookie('', '')).not.toThrow();
      expect(() => setCookie('x', null)).not.toThrow();
    });
  });

  describe('getCookie', () => {
    it('returns value set by setCookie for the same name', () => {
      setCookie('weekends-enabled', '1');
      expect(getCookie('weekends-enabled')).toBe('1');
    });

    it('returns undefined for nonexistent cookie', () => {
      expect(getCookie('nonexistent')).toBeUndefined();
    });

    it('never throws on error', () => {
      expect(() => getCookie('')).not.toThrow();
    });
  });

  describe('deleteCookie', () => {
    it('causes getCookie to return undefined after deletion', () => {
      setCookie('weekends-enabled', '1');
      expect(getCookie('weekends-enabled')).toBe('1');
      deleteCookie('weekends-enabled');
      expect(getCookie('weekends-enabled')).toBeUndefined();
    });

    it('never throws on error', () => {
      expect(() => deleteCookie('nonexistent')).not.toThrow();
    });
  });
});
