import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Store, STORAGE_KEYS } from './store.js';

describe('Store', () => {
  beforeEach(() => {
    // Simple localStorage mock if not available in environment
    /** @type {Record<string, string>} */
    const storage = {};
    vi.stubGlobal('localStorage', {
      /** @param {string} key */
      getItem: (key) => storage[key] || null,
      /** @param {string} key @param {any} value */
      setItem: (key, value) => { storage[key] = String(value); },
      clear: () => { Object.keys(storage).forEach(k => delete storage[k]); },
      /** @param {string} key */
      removeItem: (key) => { delete storage[key]; }
    });

    localStorage.clear();
    // jsdom provides window and localStorage
    vi.stubGlobal('innerWidth', 1024);
    vi.stubGlobal('innerHeight', 768);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should initialize with default values if localStorage is empty', () => {
    const store = new Store();
    expect(store.getState()).toEqual({
      enabled: true,
      isDualViewEnabled: false,
      spreadOffset: 0,
      currentVisibleIndex: 0,
      guiPos: null,
      metadata: {
        title: '',
        tags: [],
        relatedWorks: []
      },
      isMetadataModalOpen: false,
      isHelpModalOpen: false,
      resumeEnabled: true
    });
  });

  it('should load initial state from localStorage', () => {
    localStorage.setItem(STORAGE_KEYS.ENABLED, 'false');
    localStorage.setItem(STORAGE_KEYS.DUAL_VIEW, 'true');
    localStorage.setItem(STORAGE_KEYS.GUI_POS, JSON.stringify({ top: 100, left: 200 }));

    const store = new Store();
    const state = store.getState();
    expect(state.enabled).toBe(false);
    expect(state.isDualViewEnabled).toBe(true);
    expect(state.guiPos).toEqual({ top: 100, left: 200 });
  });

  it('should update state and persist to localStorage', () => {
    const store = new Store();
    store.setState({ enabled: false, isDualViewEnabled: true });

    expect(store.getState().enabled).toBe(false);
    expect(store.getState().isDualViewEnabled).toBe(true);
    expect(localStorage.getItem(STORAGE_KEYS.ENABLED)).toBe('false');
    expect(localStorage.getItem(STORAGE_KEYS.DUAL_VIEW)).toBe('true');
  });

  it('should notify subscribers on state change', () => {
    const store = new Store();
    const listener = vi.fn();
    store.subscribe(listener);

    store.setState({ enabled: false });

    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
  });

  it('should not notify if state has not changed', () => {
    const store = new Store();
    const listener = vi.fn();
    store.subscribe(listener);

    store.setState({ enabled: true }); // enabled is already true by default

    expect(listener).not.toHaveBeenCalled();
  });

  it('should validate guiPos on load', () => {
    localStorage.setItem(STORAGE_KEYS.GUI_POS, JSON.stringify({ top: -1000, left: 200 }));
    const store = new Store();
    expect(store.getState().guiPos).toBeNull();
  });

  it('should unsubscribe correctly', () => {
    const store = new Store();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    unsubscribe();
    store.setState({ enabled: false });

    expect(listener).not.toHaveBeenCalled();
  });

  it('should return null if guiPos JSON is invalid', () => {
    localStorage.setItem(STORAGE_KEYS.GUI_POS, 'invalid-json');
    const store = new Store();
    expect(store.getState().guiPos).toBeNull();
  });

  it('should handle partial state updates correctly', () => {
    const store = new Store();
    store.setState({ enabled: false });
    expect(store.getState().enabled).toBe(false);
    expect(store.getState().isDualViewEnabled).toBe(false); // remained default
  });

  it('should persist guiPos when updated', () => {
    const store = new Store();
    const pos = { top: 50, left: 50 };
    store.setState({ guiPos: pos });
    const saved = localStorage.getItem(STORAGE_KEYS.GUI_POS);
    expect(JSON.parse(saved || '{}')).toEqual(pos);
  });

  describe('resumeEnabled', () => {
    it('should initialize with true by default', () => {
      const store = new Store();
      expect(store.getState().resumeEnabled).toBe(true);
    });

    it('should load resumeEnabled from localStorage', () => {
      localStorage.setItem(STORAGE_KEYS.RESUME_ENABLED, 'false');
      const store = new Store();
      expect(store.getState().resumeEnabled).toBe(false);
    });

    it('should persist resumeEnabled to localStorage when updated', () => {
      const store = new Store();
      store.setState({ resumeEnabled: false });
      expect(localStorage.getItem(STORAGE_KEYS.RESUME_ENABLED)).toBe('false');
    });

    it('should update resumeEnabled state', () => {
      const store = new Store();
      store.setState({ resumeEnabled: false });
      expect(store.getState().resumeEnabled).toBe(false);

      store.setState({ resumeEnabled: true });
      expect(store.getState().resumeEnabled).toBe(true);
    });

    it('should notify subscribers when resumeEnabled changes', () => {
      const store = new Store();
      const listener = vi.fn();
      store.subscribe(listener);

      store.setState({ resumeEnabled: false });

      expect(listener).toHaveBeenCalledWith(expect.objectContaining({ resumeEnabled: false }));
    });
  });
});
