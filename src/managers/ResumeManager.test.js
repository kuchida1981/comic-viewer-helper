import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ResumeManager } from './ResumeManager.js';
import { Store } from '../store.js';

describe('ResumeManager', () => {
  /** @type {Store} */
  let store;
  /** @type {ResumeManager} */
  let resumeManager;

  beforeEach(() => {
    // Mock localStorage
    /** @type {Record<string, string>} */
    let storage = {};
    vi.stubGlobal('localStorage', {
      getItem: (/** @type {string} */ key) => storage[key] || null,
      setItem: (/** @type {string} */ key, /** @type {string} */ value) => { storage[key] = String(value); },
      clear: () => { storage = {}; },
      removeItem: (/** @type {string} */ key) => { delete storage[key]; }
    });

    localStorage.clear();
    vi.stubGlobal('innerWidth', 1024);
    vi.stubGlobal('innerHeight', 768);

    store = new Store();
    resumeManager = new ResumeManager(store);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('isEnabled', () => {
    it('should always return true', () => {
      expect(resumeManager.isEnabled()).toBe(true);
    });
  });

  describe('savePosition', () => {
    it('should save position to localStorage when enabled', () => {
      const url = 'https://example.com/page';
      const pageIndex = 42;

      resumeManager.savePosition(url, pageIndex);

      const saved = JSON.parse(localStorage.getItem('comic-viewer-helper-resume-data') || '{}');
      expect(saved[url]).toEqual({ pageIndex: 42 });
    });

    it('should overwrite existing position for the same URL', () => {
      const url = 'https://example.com/page';

      resumeManager.savePosition(url, 10);
      resumeManager.savePosition(url, 20);

      const saved = JSON.parse(localStorage.getItem('comic-viewer-helper-resume-data') || '{}');
      expect(saved[url]).toEqual({ pageIndex: 20 });
    });

    it('should preserve positions for different URLs', () => {
      resumeManager.savePosition('https://example.com/page1', 10);
      resumeManager.savePosition('https://example.com/page2', 20);

      const saved = JSON.parse(localStorage.getItem('comic-viewer-helper-resume-data') || '{}');
      expect(saved['https://example.com/page1']).toEqual({ pageIndex: 10 });
      expect(saved['https://example.com/page2']).toEqual({ pageIndex: 20 });
    });
  });

  describe('loadPosition', () => {
    it('should load saved position when enabled', () => {
      const url = 'https://example.com/page';
      resumeManager.savePosition(url, 42);

      const loaded = resumeManager.loadPosition(url);
      expect(loaded).toBe(42);
    });

    it('should return null for non-existent URL', () => {
      const loaded = resumeManager.loadPosition('https://example.com/nonexistent');
      expect(loaded).toBeNull();
    });

    it('should handle corrupted localStorage data', () => {
      localStorage.setItem('comic-viewer-helper-resume-data', 'invalid-json');
      const loaded = resumeManager.loadPosition('https://example.com/page');
      expect(loaded).toBeNull();
    });

    it('should return null when localStorage is empty', () => {
      const loaded = resumeManager.loadPosition('https://example.com/page');
      expect(loaded).toBeNull();
    });
  });

  describe('clearAll', () => {
    it('should remove all saved positions', () => {
      resumeManager.savePosition('https://example.com/page1', 10);
      resumeManager.savePosition('https://example.com/page2', 20);

      resumeManager.clearAll();

      const saved = localStorage.getItem('comic-viewer-helper-resume-data');
      expect(saved).toBeNull();
    });

    it('should return null when loading after clearAll', () => {
      const url = 'https://example.com/page';
      resumeManager.savePosition(url, 42);
      resumeManager.clearAll();

      const loaded = resumeManager.loadPosition(url);
      expect(loaded).toBeNull();
    });
  });

  describe('_loadData', () => {
    it('should return empty object when localStorage is empty', () => {
      const data = resumeManager._loadData();
      expect(data).toEqual({});
    });

    it('should return empty object when JSON is invalid', () => {
      localStorage.setItem('comic-viewer-helper-resume-data', 'invalid-json');
      const data = resumeManager._loadData();
      expect(data).toEqual({});
    });

    it('should return parsed data when valid', () => {
      const testData = { 'https://example.com/page': { pageIndex: 42 } };
      localStorage.setItem('comic-viewer-helper-resume-data', JSON.stringify(testData));
      const data = resumeManager._loadData();
      expect(data).toEqual(testData);
    });
  });
});
