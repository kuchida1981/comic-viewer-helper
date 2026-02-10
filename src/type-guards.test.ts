import { describe, it, expect } from 'vitest';
import {
  isObject,
  isStringArray,
  isGuiPos,
  isResumeData,
  isResumeDataMap,
  isSearchContext,
  isSearchCache
} from './type-guards';

describe('Type Guards', () => {
  describe('isObject', () => {
    it('should return true for plain objects', () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ a: 1 })).toBe(true);
    });

    it('should return false for non-objects', () => {
      expect(isObject(null)).toBe(false);
      expect(isObject(undefined)).toBe(false);
      expect(isObject([])).toBe(false);
      expect(isObject(123)).toBe(false);
      expect(isObject('string')).toBe(false);
    });
  });

  describe('isStringArray', () => {
    it('should return true for string arrays', () => {
      expect(isStringArray([])).toBe(true);
      expect(isStringArray(['a', 'b'])).toBe(true);
    });

    it('should return false for mixed arrays or non-arrays', () => {
      expect(isStringArray([1, 'a'])).toBe(false);
      expect(isStringArray('string')).toBe(false);
      expect(isStringArray({})).toBe(false);
    });
  });

  describe('isGuiPos', () => {
    it('should return true for valid GuiPos', () => {
      expect(isGuiPos({ top: 0, left: 0 })).toBe(true);
    });

    it('should return false for invalid GuiPos', () => {
      expect(isGuiPos({})).toBe(false);
      expect(isGuiPos({ top: '0', left: 0 })).toBe(false);
      expect(isGuiPos({ top: 0 })).toBe(false);
      expect(isGuiPos(null)).toBe(false);
      expect(isGuiPos('not an object')).toBe(false);
    });
  });

  describe('isResumeData', () => {
    it('should return true for valid ResumeData', () => {
      expect(isResumeData({ pageIndex: 0 })).toBe(true);
    });

    it('should return false for invalid ResumeData', () => {
      expect(isResumeData({})).toBe(false);
      expect(isResumeData({ pageIndex: '0' })).toBe(false);
      expect(isResumeData(undefined)).toBe(false);
    });
  });

  describe('isResumeDataMap', () => {
    it('should return true for valid ResumeDataMap', () => {
      expect(isResumeDataMap({
        'url1': { pageIndex: 1 },
        'url2': { pageIndex: 2 }
      })).toBe(true);
      expect(isResumeDataMap({})).toBe(true);
    });

    it('should return false for invalid values', () => {
      expect(isResumeDataMap({ 'url1': { pageIndex: '1' } })).toBe(false);
      expect(isResumeDataMap([])).toBe(false);
      expect(isResumeDataMap(null)).toBe(false);
    });
  });

  describe('isSearchContext', () => {
    it('should return true for valid SearchContext', () => {
      expect(isSearchContext({ type: 'keyword' })).toBe(true);
      expect(isSearchContext({ type: 'tag', label: 'Tag' })).toBe(true);
    });

    it('should return false for invalid types or values', () => {
      expect(isSearchContext({ type: 'invalid' })).toBe(false);
      expect(isSearchContext({ label: 'No Type' })).toBe(false);
      expect(isSearchContext({})).toBe(false);
      expect(isSearchContext(123)).toBe(false);
    });
  });

  describe('isSearchCache', () => {
    it('should return true for valid SearchCache', () => {
      const validCache = {
        query: 'q',
        fetchedAt: 123,
        results: { results: [] }
      };
      expect(isSearchCache(validCache)).toBe(true);
    });

    it('should return false for invalid SearchCache', () => {
      expect(isSearchCache({})).toBe(false);
      expect(isSearchCache({ query: 123, fetchedAt: 123, results: { results: [] } })).toBe(false);
      expect(isSearchCache({ query: 'q', fetchedAt: '123' })).toBe(false);
      expect(isSearchCache({ query: 'q', fetchedAt: 123, results: 'not an object' })).toBe(false);
      expect(isSearchCache(null)).toBe(false);
    });
  });
});
