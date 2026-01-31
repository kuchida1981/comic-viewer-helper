import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Store, STORAGE_KEYS } from './store.js';

describe('Store', () => {
  beforeEach(() => {
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
      guiPos: null
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
});