import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { InputManager } from './InputManager.js';
import * as logic from '../logic.js';
import { Store } from '../store.js';
import { Navigator } from './Navigator.js';

vi.mock('../logic.js', () => ({
  getNavigationDirection: vi.fn(),
  getClickNavigationDirection: vi.fn()
}));

vi.mock('../shortcuts.js', () => ({
  SHORTCUTS: [
    { id: 'nextPage', keys: ['ArrowRight', 'Space'] },
    { id: 'prevPage', keys: ['ArrowLeft', 'Shift+Space'] },
    { id: 'dualView', keys: ['d'] },
    { id: 'spreadOffset', keys: ['s'] },
    { id: 'metadata', keys: ['i'] },
    { id: 'fullscreen', keys: ['f'] },
    { id: 'help', keys: ['?'] },
    { id: 'search', keys: ['/'] },
    { id: 'randomJump', keys: ['p'] },
    { id: 'speedUpAutoplay', keys: [']'] },
    { id: 'slowDownAutoplay', keys: ['['] },
    { id: 'toggleFavorite', keys: ['v'] }
  ]
}));

describe('InputManager', () => {
  let store: Store;
  let navigator: Navigator;
  let inputManager: InputManager;

  beforeEach(() => {
    store = {
      getState: vi.fn().mockReturnValue({ 
        enabled: true, 
        isDualViewEnabled: false, 
        currentVisibleIndex: 0,
        isMetadataModalOpen: false,
        isHelpModalOpen: false,
        isSearchModalOpen: false,
        spreadOffset: 0,
        autoplayInterval: 5
      }),
      setState: vi.fn()
    } as unknown as Store;
    navigator = { 
      applyLayout: vi.fn(), 
      updatePageCounter: vi.fn(),
      getImages: vi.fn().mockReturnValue([{}, {}]),
      jumpToPage: vi.fn(),
      scrollToImage: vi.fn()
    } as unknown as Navigator;
    const discoveryManager = {
      jumpToRandomWork: vi.fn()
    } as any;
    const uiManager = {
      toggleFavorite: vi.fn()
    } as any;
    inputManager = new InputManager(store, navigator, discoveryManager, uiManager);

    vi.stubGlobal('requestAnimationFrame', vi.fn((cb: FrameRequestCallback) => { cb(0); return 1; }));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    
    vi.spyOn(window, 'addEventListener');
    vi.spyOn(document, 'addEventListener');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    // @ts-expect-error - testing purpose
    delete document.documentElement.requestFullscreen;
    // @ts-expect-error - testing purpose
    delete document.fullscreenElement;
    // @ts-expect-error - testing purpose
    delete document.exitFullscreen;
  });

  it('init should add listeners', () => {
    inputManager.init();
    expect(window.addEventListener).toHaveBeenCalledWith('wheel', expect.any(Function), { passive: false });
    expect(document.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function), true);
  });

  it('isInputField should work', () => {
    const input = document.createElement('input');
    expect(inputManager.isInputField(input)).toBe(true);
    const div = document.createElement('div');
    expect(inputManager.isInputField(div)).toBe(false);
    expect(inputManager.isInputField(null)).toBe(false);
  });

  it('handleWheel should navigate', () => {
    vi.mocked(logic.getNavigationDirection).mockReturnValue('next');
    const event = { preventDefault: vi.fn(), deltaY: 100, target: {} } as unknown as WheelEvent;
    inputManager.handleWheel(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(navigator.jumpToPage).toHaveBeenCalledWith(2);
  });

  it('handleWheel should show info modal when scrolling past last page', () => {
    (store.getState as Mock).mockReturnValue({
      enabled: true,
      isDualViewEnabled: false,
      currentVisibleIndex: 1, // 最後のページ (2画像中の index 1)
      isMetadataModalOpen: false,
      isHelpModalOpen: false
    });
    vi.mocked(logic.getNavigationDirection).mockReturnValue('next');
    const event = { preventDefault: vi.fn(), deltaY: 100, target: {} } as unknown as WheelEvent;
    inputManager.handleWheel(event);
    expect(store.setState).toHaveBeenCalledWith({ isMetadataModalOpen: true });
    expect(navigator.jumpToPage).not.toHaveBeenCalled();
  });

  it('handleWheel should not show info modal if already open', () => {
    (store.getState as Mock).mockReturnValue({
      enabled: true,
      isDualViewEnabled: false,
      currentVisibleIndex: 1,
      isMetadataModalOpen: true,
      isHelpModalOpen: false
    });
    vi.mocked(logic.getNavigationDirection).mockReturnValue('next');
    const event = { preventDefault: vi.fn(), deltaY: 100, target: {} } as unknown as WheelEvent;
    inputManager.handleWheel(event);
    expect(store.setState).not.toHaveBeenCalled();
    expect(navigator.jumpToPage).not.toHaveBeenCalled();
  });

  it('handleWheel should allow wheel on modal content', () => {
    (store.getState as Mock).mockReturnValue({ enabled: true, isMetadataModalOpen: true });
    const modal = document.createElement('div');
    modal.className = 'comic-helper-modal-content';
    document.body.appendChild(modal);
    
    const event = { preventDefault: vi.fn(), target: modal } as unknown as WheelEvent;
    inputManager.handleWheel(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
    modal.remove();
  });

  it('handleWheel should block during modals', () => {
    (store.getState as Mock).mockReturnValue({ enabled: true, isMetadataModalOpen: true, isSearchModalOpen: false });
    const event = { preventDefault: vi.fn(), target: document.body } as unknown as WheelEvent;
    inputManager.handleWheel(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(logic.getNavigationDirection).not.toHaveBeenCalled();
  });

  it('handleWheel should block during search modal', () => {
    (store.getState as Mock).mockReturnValue({ enabled: true, isMetadataModalOpen: false, isSearchModalOpen: true });
    const event = { preventDefault: vi.fn(), target: document.body } as unknown as WheelEvent;
    inputManager.handleWheel(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(logic.getNavigationDirection).not.toHaveBeenCalled();
  });

  it('onKeyDown should handle shortcuts', () => {
    const event = { key: 'ArrowRight', preventDefault: vi.fn(), target: document.body } as unknown as KeyboardEvent;
    inputManager.onKeyDown(event);
    expect(navigator.scrollToImage).toHaveBeenCalledWith(1);
    
    const event2 = { key: 'ArrowLeft', preventDefault: vi.fn(), target: document.body } as unknown as KeyboardEvent;
    inputManager.onKeyDown(event2);
    expect(navigator.scrollToImage).toHaveBeenCalledWith(-1);

    const event3 = { key: 'd', preventDefault: vi.fn(), target: document.body } as unknown as KeyboardEvent;
    inputManager.onKeyDown(event3);
    expect(store.setState).toHaveBeenCalledWith({ isDualViewEnabled: true });
  });

  it('onKeyDown should handle Escape', () => {
    (store.getState as Mock).mockReturnValue({ enabled: true, isMetadataModalOpen: true, isSearchModalOpen: false });
    const event = { key: 'Escape', preventDefault: vi.fn(), target: document.body } as unknown as KeyboardEvent;
    inputManager.onKeyDown(event);
    expect(store.setState).toHaveBeenCalledWith({
      isMetadataModalOpen: false,
      isHelpModalOpen: false,
      isSearchModalOpen: false,
      isFavoritesModalOpen: false
    });
  });

  it('onKeyDown should handle help toggle', () => {
    (store.getState as Mock).mockReturnValue({ enabled: true, isHelpModalOpen: false });
    // Realistic '?' input often comes with shiftKey: true (from Shift + '/')
    const event = { key: '?', shiftKey: true, preventDefault: vi.fn(), target: document.body } as unknown as KeyboardEvent;
    inputManager.onKeyDown(event);
    expect(store.setState).toHaveBeenCalledWith({ isHelpModalOpen: true });
    
    // Toggle back (open state)
    (store.getState as Mock).mockReturnValue({ enabled: true, isHelpModalOpen: true });
    inputManager.onKeyDown(event);
    expect(store.setState).toHaveBeenCalledWith({ isHelpModalOpen: false });
  });

  it('onKeyDown should handle search toggle', () => {
    (store.getState as Mock).mockReturnValue({ enabled: true, isSearchModalOpen: false });
    const event = { key: '/', preventDefault: vi.fn(), target: document.body } as unknown as KeyboardEvent;
    inputManager.onKeyDown(event);
    expect(store.setState).toHaveBeenCalledWith({ isSearchModalOpen: true });

    // Toggle back (open state)
    (store.getState as Mock).mockReturnValue({ enabled: true, isSearchModalOpen: true });
    inputManager.onKeyDown(event);
    expect(store.setState).toHaveBeenCalledWith({ isSearchModalOpen: false });
  });

  it('onKeyDown should toggle metadata modal even when it is already open', () => {
    (store.getState as Mock).mockReturnValue({ enabled: true, isMetadataModalOpen: true });
    const event = { key: 'i', preventDefault: vi.fn(), target: document.body } as unknown as KeyboardEvent;
    inputManager.onKeyDown(event);
    expect(store.setState).toHaveBeenCalledWith({ isMetadataModalOpen: false });
  });

  it('onKeyDown should block other shortcuts during search modal', () => {
    (store.getState as Mock).mockReturnValue({ enabled: true, isSearchModalOpen: true });
    const event = { key: 'ArrowRight', preventDefault: vi.fn(), target: document.body } as unknown as KeyboardEvent;
    inputManager.onKeyDown(event);
    expect(navigator.scrollToImage).not.toHaveBeenCalled();
  });

  it('onKeyDown should handle shift shortcut for prevPage', () => {
    const event = { key: ' ', shiftKey: true, preventDefault: vi.fn(), target: document.body } as unknown as KeyboardEvent;
    inputManager.onKeyDown(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(navigator.scrollToImage).toHaveBeenCalledWith(-1);
    expect(navigator.scrollToImage).not.toHaveBeenCalledWith(1);
  });

  it('onKeyDown should distinguish between Space and Shift+Space', () => {
    // Only Space (nextPage)
    const eventSpace = { key: ' ', shiftKey: false, preventDefault: vi.fn(), target: document.body } as unknown as KeyboardEvent;
    inputManager.onKeyDown(eventSpace);
    expect(navigator.scrollToImage).toHaveBeenCalledWith(1);
    expect(navigator.scrollToImage).not.toHaveBeenCalledWith(-1);

    vi.clearAllMocks();

    // Shift + Space (prevPage)
    const eventShiftSpace = { key: ' ', shiftKey: true, preventDefault: vi.fn(), target: document.body } as unknown as KeyboardEvent;
    inputManager.onKeyDown(eventShiftSpace);
    expect(navigator.scrollToImage).toHaveBeenCalledWith(-1);
    expect(navigator.scrollToImage).not.toHaveBeenCalledWith(1);
  });

  it('onKeyDown should handle other metadata/help triggers', () => {
    const event = { key: 'i', preventDefault: vi.fn(), target: document.body } as unknown as KeyboardEvent;
    inputManager.onKeyDown(event);
    expect(store.setState).toHaveBeenCalledWith(expect.objectContaining({ isMetadataModalOpen: true }));

    const event2 = { key: 's', preventDefault: vi.fn(), target: document.body } as unknown as KeyboardEvent;
    (store.getState as Mock).mockReturnValue({ enabled: true, isDualViewEnabled: true, spreadOffset: 0 });
    inputManager.onKeyDown(event2);
    expect(store.setState).toHaveBeenCalledWith({ spreadOffset: 1 });
  });

  it('onKeyDown should handle toggleFavorite', () => {
    const uiManager = (inputManager as any).uiManager;
    const event = { key: 'v', preventDefault: vi.fn(), target: document.body } as unknown as KeyboardEvent;
    inputManager.onKeyDown(event);
    expect(uiManager.toggleFavorite).toHaveBeenCalled();
  });

  it('onKeyDown should handle toggleFavorite even when metadata modal is open', () => {
    (store.getState as Mock).mockReturnValue({ enabled: true, isMetadataModalOpen: true, isHelpModalOpen: false, isSearchModalOpen: false });
    const uiManager = (inputManager as any).uiManager;
    const event = { key: 'v', preventDefault: vi.fn(), target: document.body } as unknown as KeyboardEvent;
    inputManager.onKeyDown(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(uiManager.toggleFavorite).toHaveBeenCalled();
  });

  it('onKeyDown should block toggleFavorite when help or search modal is open but still preventDefault', () => {
    const uiManager = (inputManager as any).uiManager;
    const event = { key: 'v', preventDefault: vi.fn(), target: document.body } as unknown as KeyboardEvent;
    
    // Search modal open
    (store.getState as Mock).mockReturnValue({ enabled: true, isSearchModalOpen: true, isHelpModalOpen: false });
    inputManager.onKeyDown(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(uiManager.toggleFavorite).not.toHaveBeenCalled();

    vi.clearAllMocks();

    // Help modal open
    (store.getState as Mock).mockReturnValue({ enabled: true, isSearchModalOpen: false, isHelpModalOpen: true });
    inputManager.onKeyDown(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(uiManager.toggleFavorite).not.toHaveBeenCalled();
  });

  it('onKeyDown should handle autoplay speed up/slow down', () => {
    (store.getState as Mock).mockReturnValue({ enabled: true, autoplayInterval: 5 });

    const eventInc = { key: ']', preventDefault: vi.fn(), target: document.body } as unknown as KeyboardEvent;
    inputManager.onKeyDown(eventInc);
    expect(store.setState).toHaveBeenCalledWith({ autoplayInterval: 4 });

    const eventDec = { key: '[', preventDefault: vi.fn(), target: document.body } as unknown as KeyboardEvent;
    inputManager.onKeyDown(eventDec);
    expect(store.setState).toHaveBeenCalledWith({ autoplayInterval: 6 });
  });

  it('onKeyDown should respect autoplay interval limits', () => {
    // Min limit
    (store.getState as Mock).mockReturnValue({ enabled: true, autoplayInterval: 1 });
    const eventInc = { key: ']', preventDefault: vi.fn(), target: document.body } as unknown as KeyboardEvent;
    inputManager.onKeyDown(eventInc);
    expect(store.setState).not.toHaveBeenCalled();

    // Max limit
    (store.getState as Mock).mockReturnValue({ enabled: true, autoplayInterval: 99 });
    const eventDec = { key: '[', preventDefault: vi.fn(), target: document.body } as unknown as KeyboardEvent;
    inputManager.onKeyDown(eventDec);
    expect(store.setState).not.toHaveBeenCalled();
  });

  it('onKeyDown should catch errors in async actions', async () => {
    const discoveryManager = (inputManager as any).discoveryManager;
    discoveryManager.jumpToRandomWork.mockRejectedValue(new Error('fail'));
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const event = { key: 'p', preventDefault: vi.fn(), target: document.body } as unknown as KeyboardEvent;
    
    inputManager.onKeyDown(event);
    
    await vi.waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Shortcut action failed:', expect.any(Error));
    });
    consoleSpy.mockRestore();
  });

  it('onKeyDown should handle randomJump', () => {
    const discoveryManager = (inputManager as any).discoveryManager;
    const event = { key: 'p', preventDefault: vi.fn(), target: document.body } as unknown as KeyboardEvent;
    inputManager.onKeyDown(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(discoveryManager.jumpToRandomWork).toHaveBeenCalled();
  });

  it('onKeyDown should enter fullscreen when not in fullscreen', async () => {
    const mockRequestFullscreen = vi.fn(() => Promise.reject(new Error('blocked')));
    Object.defineProperty(document.documentElement, 'requestFullscreen', { value: mockRequestFullscreen, configurable: true });
    Object.defineProperty(document, 'fullscreenElement', { value: null, configurable: true });

    const event = { key: 'f', preventDefault: vi.fn(), target: document.body } as unknown as KeyboardEvent;
    inputManager.onKeyDown(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(mockRequestFullscreen).toHaveBeenCalled();
    await vi.waitFor(() => {});
  });

  it('onKeyDown should catch errors in toggleFullscreen', async () => {
    const mockRequestFullscreen = vi.fn(() => Promise.reject(new Error('fail')));
    Object.defineProperty(document.documentElement, 'requestFullscreen', { value: mockRequestFullscreen, configurable: true });
    Object.defineProperty(document, 'fullscreenElement', { value: null, configurable: true });

    const event = { key: 'f', preventDefault: vi.fn(), target: document.body } as unknown as KeyboardEvent;
    inputManager.onKeyDown(event);
    await vi.waitFor(() => {}); // wait for catch block

    // Exit fullscreen failure
    const mockExitFullscreen = vi.fn(() => Promise.reject(new Error('fail')));
    Object.defineProperty(document, 'fullscreenElement', { value: document.documentElement, configurable: true });
    Object.defineProperty(document, 'exitFullscreen', { value: mockExitFullscreen, configurable: true });

    inputManager.onKeyDown(event);
    await vi.waitFor(() => {}); // wait for catch block
  });

  it('onKeyDown should exit fullscreen when already in fullscreen', async () => {
    const mockExitFullscreen = vi.fn(() => Promise.reject(new Error('blocked')));
    Object.defineProperty(document.documentElement, 'requestFullscreen', { value: vi.fn(() => Promise.resolve()), configurable: true });
    Object.defineProperty(document, 'fullscreenElement', { value: document.documentElement, configurable: true });
    Object.defineProperty(document, 'exitFullscreen', { value: mockExitFullscreen, configurable: true });

    const event = { key: 'f', preventDefault: vi.fn(), target: document.body } as unknown as KeyboardEvent;
    inputManager.onKeyDown(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(mockExitFullscreen).toHaveBeenCalled();
    await vi.waitFor(() => {});
  });

  it('onKeyDown should do nothing for fullscreen key when API is unavailable', () => {
    // requestFullscreen は jsdom で未定義のため、明示的に削除して非対応状態を再現
    // @ts-expect-error - testing purpose
    delete document.documentElement.requestFullscreen;

    const event = { key: 'f', preventDefault: vi.fn(), target: document.body } as unknown as KeyboardEvent;
    inputManager.onKeyDown(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('handleResize and handleScroll should respect enabled state', () => {
    (store.getState as Mock).mockReturnValue({ enabled: false });
    inputManager.handleResize();
    expect(navigator.applyLayout).not.toHaveBeenCalled();
    inputManager.handleScroll();
    expect(navigator.updatePageCounter).not.toHaveBeenCalled();
  });

  it('handleResize should cancel existing request', () => {
    // @ts-expect-error - testing purpose
    inputManager.resizeReq = 123;
    inputManager.handleResize();
    expect(vi.mocked(window.cancelAnimationFrame)).toHaveBeenCalledWith(123);
  });

  it('handleScroll should cancel existing request', () => {
    // @ts-expect-error - testing purpose
    inputManager.scrollReq = 456;
    inputManager.handleScroll();
    expect(vi.mocked(window.cancelAnimationFrame)).toHaveBeenCalledWith(456);
  });

  describe('画像クリックによるページ送り', () => {
    let img: HTMLImageElement;

    beforeEach(() => {
      img = document.createElement('img');
      document.body.appendChild(img);
    });

    afterEach(() => {
      img.remove();
    });

    it('画像クリック（移動なし）で次ページに移動する', () => {
      vi.mocked(logic.getClickNavigationDirection).mockReturnValue('next');
      inputManager.onMouseDown({ target: img, clientX: 100, clientY: 100 } as unknown as MouseEvent);
      inputManager.onMouseUp({ target: img, clientX: 100, clientY: 100 } as unknown as MouseEvent);
      expect(logic.getClickNavigationDirection).toHaveBeenCalledWith(img);
      expect(navigator.scrollToImage).toHaveBeenCalledWith(1);
    });

    it('画像クリック（移動なし）で前ページに移動する（見開き右側）', () => {
      vi.mocked(logic.getClickNavigationDirection).mockReturnValue('prev');
      inputManager.onMouseDown({ target: img, clientX: 50, clientY: 50 } as unknown as MouseEvent);
      inputManager.onMouseUp({ target: img, clientX: 50, clientY: 50 } as unknown as MouseEvent);
      expect(navigator.scrollToImage).toHaveBeenCalledWith(-1);
    });

    it('移動距離が閾値以上の場合はクリックとして扱わない', () => {
      vi.mocked(logic.getClickNavigationDirection).mockReturnValue('next');
      inputManager.onMouseDown({ target: img, clientX: 100, clientY: 100 } as unknown as MouseEvent);
      inputManager.onMouseUp({ target: img, clientX: 110, clientY: 100 } as unknown as MouseEvent);
      expect(navigator.scrollToImage).not.toHaveBeenCalled();
    });

    it('mousedown対象と異なる画像でmouseupされた場合は無視する', () => {
      const otherImg = document.createElement('img');
      inputManager.onMouseDown({ target: img, clientX: 100, clientY: 100 } as unknown as MouseEvent);
      inputManager.onMouseUp({ target: otherImg, clientX: 100, clientY: 100 } as unknown as MouseEvent);
      expect(navigator.scrollToImage).not.toHaveBeenCalled();
    });

    it('mousedown対象が画像でない場合は記録しない', () => {
      const div = document.createElement('div');
      inputManager.onMouseDown({ target: div, clientX: 100, clientY: 100 } as unknown as MouseEvent);
      inputManager.onMouseUp({ target: div, clientX: 100, clientY: 100 } as unknown as MouseEvent);
      expect(navigator.scrollToImage).not.toHaveBeenCalled();
    });

    it('スクリプト無効時はクリック移動しない', () => {
      (store.getState as Mock).mockReturnValue({ enabled: false, isMetadataModalOpen: false, isHelpModalOpen: false });
      vi.mocked(logic.getClickNavigationDirection).mockReturnValue('next');
      inputManager.onMouseDown({ target: img, clientX: 100, clientY: 100 } as unknown as MouseEvent);
      inputManager.onMouseUp({ target: img, clientX: 100, clientY: 100 } as unknown as MouseEvent);
      expect(navigator.scrollToImage).not.toHaveBeenCalled();
    });

    it('モーダル表示中はクリック移動しない', () => {
      (store.getState as Mock).mockReturnValue({ enabled: true, isMetadataModalOpen: true, isHelpModalOpen: false, isSearchModalOpen: false });
      vi.mocked(logic.getClickNavigationDirection).mockReturnValue('next');
      inputManager.onMouseDown({ target: img, clientX: 100, clientY: 100 } as unknown as MouseEvent);
      inputManager.onMouseUp({ target: img, clientX: 100, clientY: 100 } as unknown as MouseEvent);
      expect(navigator.scrollToImage).not.toHaveBeenCalled();
    });

    it('検索モーダル表示中はクリック移動しない', () => {
      (store.getState as Mock).mockReturnValue({ enabled: true, isMetadataModalOpen: false, isHelpModalOpen: false, isSearchModalOpen: true });
      vi.mocked(logic.getClickNavigationDirection).mockReturnValue('next');
      inputManager.onMouseDown({ target: img, clientX: 100, clientY: 100 } as unknown as MouseEvent);
      inputManager.onMouseUp({ target: img, clientX: 100, clientY: 100 } as unknown as MouseEvent);
      expect(navigator.scrollToImage).not.toHaveBeenCalled();
    });

    it('init で mousedown/mouseup リスナーが登録される', () => {
      inputManager.init();
      expect(document.addEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(document.addEventListener).toHaveBeenCalledWith('mouseup', expect.any(Function));
    });
  });
});
