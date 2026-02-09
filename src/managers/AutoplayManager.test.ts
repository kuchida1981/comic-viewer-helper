import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { AutoplayManager } from './AutoplayManager';
import { Store, StoreState } from '../store';
import { Navigator } from './Navigator';
import * as logic from '../logic';

vi.mock('../logic', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../logic')>();
  return {
    ...actual,
    jumpToRandomWork: vi.fn()
  };
});

describe('AutoplayManager', () => {
  let store: Store;
  let navigator: Navigator;
  let autoplayManager: AutoplayManager;
  let mockState: Partial<StoreState>;

  beforeEach(() => {
    vi.useFakeTimers();

    mockState = {
      enabled: true,
      isAutoplayEnabled: false,
      isDualViewEnabled: false,
      currentVisibleIndex: 0,
      metadata: { title: 'Test', tags: [], relatedWorks: [] },
      searchCache: null
    };

    store = {
      getState: vi.fn(() => ({ ...mockState as StoreState })),
      setState: vi.fn((patch) => {
        Object.assign(mockState, patch);
      }),
      subscribe: vi.fn()
    } as unknown as Store;

    navigator = {
      getImages: vi.fn().mockReturnValue([{}, {}, {}]),
      scrollToImage: vi.fn().mockResolvedValue(undefined)
    } as unknown as Navigator;

    autoplayManager = new AutoplayManager(store, navigator);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should start timer when isAutoplayEnabled becomes true', () => {
    autoplayManager.init();
    
    // Simulate store update
    const subscribeCb = (store.subscribe as Mock).mock.calls[0][0];
    subscribeCb({ ...mockState, isAutoplayEnabled: true });

    expect(vi.getTimerCount()).toBe(1);
  });

  it('should stop timer when isAutoplayEnabled becomes false', () => {
    mockState.isAutoplayEnabled = true;
    autoplayManager.init();
    expect(vi.getTimerCount()).toBe(1);

    const subscribeCb = (store.subscribe as Mock).mock.calls[0][0];
    subscribeCb({ ...mockState, isAutoplayEnabled: false });

    expect(vi.getTimerCount()).toBe(0);
  });

  it('should scroll to next image after interval', async () => {
    mockState.isAutoplayEnabled = true;
    autoplayManager.init();

    await vi.runOnlyPendingTimersAsync();

    expect(navigator.scrollToImage).toHaveBeenCalledWith(1);
    expect(vi.getTimerCount()).toBe(1); // Should schedule next
  });

  it('should jump to random work when reaching the end', async () => {
    mockState.isAutoplayEnabled = true;
    mockState.currentVisibleIndex = 2; // Last index (out of 3)
    autoplayManager.init();

    await vi.runOnlyPendingTimersAsync();

    expect(logic.jumpToRandomWork).toHaveBeenCalled();
    expect(navigator.scrollToImage).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0); // Should stop
  });

  it('should handle dual view step calculation', async () => {
    mockState.isAutoplayEnabled = true;
    mockState.isDualViewEnabled = true;
    mockState.currentVisibleIndex = 0;

    const parent = { classList: { contains: vi.fn().mockReturnValue(true) } };
    const imgs = [
      { parentElement: parent },
      { parentElement: parent },
      { parentElement: {} },
      { parentElement: {} }
    ];
    (navigator.getImages as Mock).mockReturnValue(imgs);

    autoplayManager.init();
    await vi.runOnlyPendingTimersAsync();

    // Since index 0 and 1 are in the same wrapper, it should move to the next spread
    // In next(), it calls scrollToImage(1) which Navigator handles.
    // The coverage for the step = 2 logic should now be hit.
    expect(navigator.scrollToImage).toHaveBeenCalledWith(1);
  });

  it('should stop when overall script is disabled', () => {
    mockState.isAutoplayEnabled = true;
    autoplayManager.init();
    expect(vi.getTimerCount()).toBe(1);

    const subscribeCb = (store.subscribe as Mock).mock.calls[0][0];
    subscribeCb({ ...mockState, enabled: false });

    expect(vi.getTimerCount()).toBe(0);
  });
});
