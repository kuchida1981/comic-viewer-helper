import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ResumeManager, ResumeData } from './ResumeManager.js';
import { Store } from '../store.js';
import { setupGMStorageMock } from '../test/mocks/gm_storage.js';

describe('ResumeManager', () => {
  let store: Store;
  let resumeManager: ResumeManager;

  beforeEach(() => {
    setupGMStorageMock();
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
    it('should save position to GM_storage when enabled', () => {
      const url = 'https://example.com/page';
      const pageIndex = 42;

      resumeManager.savePosition(url, pageIndex);

      const key = `comic-viewer-helper-resume-data-${window.location.hostname}`;
      const saved = JSON.parse(GM_getValue(key) || '{}') as Record<string, ResumeData>;
      expect(saved[url]).toEqual({ pageIndex: 42 });
    });

    it('should overwrite existing position for the same URL', () => {
      const url = 'https://example.com/page';

      resumeManager.savePosition(url, 10);
      resumeManager.savePosition(url, 20);

      const key = `comic-viewer-helper-resume-data-${window.location.hostname}`;
      const saved = JSON.parse(GM_getValue(key) || '{}') as Record<string, ResumeData>;
      expect(saved[url]).toEqual({ pageIndex: 20 });
    });

    it('should preserve positions for different URLs', () => {
      resumeManager.savePosition('https://example.com/page1', 10);
      resumeManager.savePosition('https://example.com/page2', 20);

      const key = `comic-viewer-helper-resume-data-${window.location.hostname}`;
      const saved = JSON.parse(GM_getValue(key) || '{}') as Record<string, ResumeData>;
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

    it('should handle corrupted GM_storage data', () => {
      const key = `comic-viewer-helper-resume-data-${window.location.hostname}`;
      GM_setValue(key, 'invalid-json');
      const loaded = resumeManager.loadPosition('https://example.com/page');
      expect(loaded).toBeNull();
    });

    it('should return null when GM_storage is empty', () => {
      const loaded = resumeManager.loadPosition('https://example.com/page');
      expect(loaded).toBeNull();
    });
  });

  describe('clearAll', () => {
    it('should remove all saved positions', () => {
      resumeManager.savePosition('https://example.com/page1', 10);
      resumeManager.savePosition('https://example.com/page2', 20);

      resumeManager.clearAll();

      const key = `comic-viewer-helper-resume-data-${window.location.hostname}`;
      const saved = GM_getValue(key);
      expect(saved).toBeUndefined();
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
    it('should return empty object when GM_storage is empty', () => {
      // @ts-expect-error - testing private method
      const data = resumeManager._loadData();
      expect(data).toEqual({});
    });

    it('should return empty object when JSON is invalid', () => {
      const key = `comic-viewer-helper-resume-data-${window.location.hostname}`;
      GM_setValue(key, 'invalid-json');
      // @ts-expect-error - testing private method
      const data = resumeManager._loadData();
      expect(data).toEqual({});
    });

    it('should return parsed data when valid', () => {
      const testData = { 'https://example.com/page': { pageIndex: 42 } };
      const key = `comic-viewer-helper-resume-data-${window.location.hostname}`;
      GM_setValue(key, JSON.stringify(testData));
      // @ts-expect-error - testing private method
      const data = resumeManager._loadData();
      expect(data).toEqual(testData);
    });
  });
});
