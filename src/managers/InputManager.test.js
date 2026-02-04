import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { InputManager } from './InputManager';
import * as logic from '../logic.js';

vi.mock('../logic.js', () => ({
  getNavigationDirection: vi.fn(),
  getClickNavigationDirection: vi.fn()
}));

vi.mock('../shortcuts.js', () => ({
  SHORTCUTS: [
    { id: 'nextPage', keys: ['ArrowRight'] },
    { id: 'prevPage', keys: ['ArrowLeft', 'Shift+Space'] },
    { id: 'dualView', keys: ['d'] },
    { id: 'spreadOffset', keys: ['s'] },
    { id: 'metadata', keys: ['i'] },
    { id: 'fullscreen', keys: ['f'] },
    { id: 'help', keys: ['?'] },
    { id: 'randomJump', keys: ['p'] }
  ]
}));

describe('InputManager', () => {
  /** @type {any} */
  let store;
  /** @type {any} */
  let navigator;
  /** @type {any} */
  let inputManager;

  beforeEach(() => {
    store = {
      getState: vi.fn().mockReturnValue({ 
        enabled: true, 
        isDualViewEnabled: false, 
        currentVisibleIndex: 0,
        isMetadataModalOpen: false,
        isHelpModalOpen: false,
        spreadOffset: 0
      }),
      setState: vi.fn()
    };
    navigator = { 
      applyLayout: vi.fn(), 
      updatePageCounter: vi.fn(),
      getImages: vi.fn().mockReturnValue([{}, {}]),
      jumpToPage: vi.fn(),
      scrollToImage: vi.fn()
    };
    inputManager = new InputManager(/** @type {any} */ (store), /** @type {any} */ (navigator));

    vi.stubGlobal('requestAnimationFrame', vi.fn((cb) => { cb(); return 1; }));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    
    vi.spyOn(window, 'addEventListener');
    vi.spyOn(document, 'addEventListener');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    delete /** @type {any} */ (document.documentElement).requestFullscreen;
    delete /** @type {any} */ (document).fullscreenElement;
    delete /** @type {any} */ (document).exitFullscreen;
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
    const event = { preventDefault: vi.fn(), deltaY: 100, target: {} };
    inputManager.handleWheel(/** @type {any} */ (event));
    expect(event.preventDefault).toHaveBeenCalled();
    expect(navigator.jumpToPage).toHaveBeenCalledWith(2);
  });

  it('handleWheel should show info modal when scrolling past last page', () => {
    store.getState.mockReturnValue({
      enabled: true,
      isDualViewEnabled: false,
      currentVisibleIndex: 1, // 最後のページ (2画像中の index 1)
      isMetadataModalOpen: false,
      isHelpModalOpen: false
    });
    vi.mocked(logic.getNavigationDirection).mockReturnValue('next');
    const event = { preventDefault: vi.fn(), deltaY: 100, target: {} };
    inputManager.handleWheel(/** @type {any} */ (event));
    expect(store.setState).toHaveBeenCalledWith({ isMetadataModalOpen: true });
    expect(navigator.jumpToPage).not.toHaveBeenCalled();
  });

  it('handleWheel should not show info modal if already open', () => {
    store.getState.mockReturnValue({
      enabled: true,
      isDualViewEnabled: false,
      currentVisibleIndex: 1,
      isMetadataModalOpen: true,
      isHelpModalOpen: false
    });
    vi.mocked(logic.getNavigationDirection).mockReturnValue('next');
    const event = { preventDefault: vi.fn(), deltaY: 100, target: {} };
    inputManager.handleWheel(/** @type {any} */ (event));
    expect(store.setState).not.toHaveBeenCalled();
    expect(navigator.jumpToPage).not.toHaveBeenCalled();
  });

  it('handleWheel should allow wheel on modal content', () => {
    store.getState.mockReturnValue({ enabled: true, isMetadataModalOpen: true });
    const modal = document.createElement('div');
    modal.className = 'comic-helper-modal-content';
    document.body.appendChild(modal);
    
    const event = { preventDefault: vi.fn(), target: modal };
    inputManager.handleWheel(/** @type {any} */ (event));
    expect(event.preventDefault).not.toHaveBeenCalled();
    modal.remove();
  });

  it('handleWheel should block during modals', () => {
    store.getState.mockReturnValue({ enabled: true, isMetadataModalOpen: true });
    const event = { preventDefault: vi.fn(), target: document.body };
    inputManager.handleWheel(/** @type {any} */ (event));
    expect(event.preventDefault).toHaveBeenCalled();
    expect(logic.getNavigationDirection).not.toHaveBeenCalled();
  });

  it('onKeyDown should handle shortcuts', () => {
    const event = { key: 'ArrowRight', preventDefault: vi.fn(), target: document.body };
    inputManager.onKeyDown(/** @type {any} */ (event));
    expect(navigator.scrollToImage).toHaveBeenCalledWith(1);
    
    const event2 = { key: 'ArrowLeft', preventDefault: vi.fn(), target: document.body };
    inputManager.onKeyDown(/** @type {any} */ (event2));
    expect(navigator.scrollToImage).toHaveBeenCalledWith(-1);

    const event3 = { key: 'd', preventDefault: vi.fn(), target: document.body };
    inputManager.onKeyDown(/** @type {any} */ (event3));
    expect(store.setState).toHaveBeenCalledWith({ isDualViewEnabled: true });
  });

  it('onKeyDown should handle Escape', () => {
    store.getState.mockReturnValue({ enabled: true, isMetadataModalOpen: true });
    const event = { key: 'Escape', preventDefault: vi.fn(), target: document.body };
    inputManager.onKeyDown(/** @type {any} */ (event));
    expect(store.setState).toHaveBeenCalledWith({ isMetadataModalOpen: false, isHelpModalOpen: false });
  });

  it('onKeyDown should handle help toggle', () => {
    store.getState.mockReturnValue({ enabled: true, isHelpModalOpen: false });
    const event = { key: '?', preventDefault: vi.fn(), target: document.body };
    inputManager.onKeyDown(/** @type {any} */ (event));
    expect(store.setState).toHaveBeenCalledWith({ isHelpModalOpen: true });
    
    // Toggle back (open state)
    store.getState.mockReturnValue({ enabled: true, isHelpModalOpen: true });
    inputManager.onKeyDown(/** @type {any} */ (event));
    expect(store.setState).toHaveBeenCalledWith({ isHelpModalOpen: false });
  });

  it('onKeyDown should handle shift shortcut for prevPage', () => {
    const event = { key: ' ', shiftKey: true, preventDefault: vi.fn(), target: document.body };
    inputManager.onKeyDown(/** @type {any} */ (event));
    expect(event.preventDefault).toHaveBeenCalled();
    expect(navigator.scrollToImage).toHaveBeenCalledWith(-1);
  });

  it('onKeyDown should handle other metadata/help triggers', () => {
    const event = { key: 'i', preventDefault: vi.fn(), target: document.body };
    inputManager.onKeyDown(/** @type {any} */ (event));
    expect(store.setState).toHaveBeenCalledWith(expect.objectContaining({ isMetadataModalOpen: true }));

    const event2 = { key: 's', preventDefault: vi.fn(), target: document.body };
    store.getState.mockReturnValue({ enabled: true, isDualViewEnabled: true, spreadOffset: 0 });
    inputManager.onKeyDown(/** @type {any} */ (event2));
    expect(store.setState).toHaveBeenCalledWith({ spreadOffset: 1 });
  });

  it('onKeyDown should handle randomJump', () => {
    const relatedWorks = [
      { href: 'http://example.com/1', isPrivate: false },
      { href: 'http://example.com/2', isPrivate: true },
      { href: 'http://example.com/3', isPrivate: false }
    ];
    store.getState.mockReturnValue({ 
      enabled: true, 
      metadata: { relatedWorks } 
    });

    vi.spyOn(Math, 'random').mockReturnValue(0); // Selects first element (index 0)

    // Mock window.location
    const originalLocation = window.location;
    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = { href: '' };

    const event = { key: 'p', preventDefault: vi.fn(), target: document.body };
    inputManager.onKeyDown(/** @type {any} */ (event));

    expect(event.preventDefault).toHaveBeenCalled();
    expect(window.location.href).toBe('http://example.com/1');

    // Cleanup
    // @ts-ignore
    window.location = originalLocation;
    vi.spyOn(Math, 'random').mockRestore();
  });

  it('onKeyDown should enter fullscreen when not in fullscreen', async () => {
    const mockRequestFullscreen = vi.fn(() => Promise.reject(new Error('blocked')));
    Object.defineProperty(document.documentElement, 'requestFullscreen', { value: mockRequestFullscreen, configurable: true });
    Object.defineProperty(document, 'fullscreenElement', { value: null, configurable: true });

    const event = { key: 'f', preventDefault: vi.fn(), target: document.body };
    inputManager.onKeyDown(/** @type {any} */ (event));
    expect(event.preventDefault).toHaveBeenCalled();
    expect(mockRequestFullscreen).toHaveBeenCalled();
    await vi.waitFor(() => {});
  });

  it('onKeyDown should exit fullscreen when already in fullscreen', async () => {
    const mockExitFullscreen = vi.fn(() => Promise.reject(new Error('blocked')));
    Object.defineProperty(document.documentElement, 'requestFullscreen', { value: vi.fn(() => Promise.resolve()), configurable: true });
    Object.defineProperty(document, 'fullscreenElement', { value: document.documentElement, configurable: true });
    Object.defineProperty(document, 'exitFullscreen', { value: mockExitFullscreen, configurable: true });

    const event = { key: 'f', preventDefault: vi.fn(), target: document.body };
    inputManager.onKeyDown(/** @type {any} */ (event));
    expect(event.preventDefault).toHaveBeenCalled();
    expect(mockExitFullscreen).toHaveBeenCalled();
    await vi.waitFor(() => {});
  });

  it('onKeyDown should do nothing for fullscreen key when API is unavailable', () => {
    // requestFullscreen は jsdom で未定義のため、明示的に削除して非対応状態を再現
    delete /** @type {any} */ (document.documentElement).requestFullscreen;

    const event = { key: 'f', preventDefault: vi.fn(), target: document.body };
    inputManager.onKeyDown(/** @type {any} */ (event));
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('handleResize and handleScroll should respect enabled state', () => {
    store.getState.mockReturnValue({ enabled: false });
    inputManager.handleResize();
    expect(navigator.applyLayout).not.toHaveBeenCalled();
    inputManager.handleScroll();
    expect(navigator.updatePageCounter).not.toHaveBeenCalled();
  });

  it('handleResize should cancel existing request', () => {
    inputManager.resizeReq = 123;
    inputManager.handleResize();
    expect(vi.mocked(window.cancelAnimationFrame)).toHaveBeenCalledWith(123);
  });

  it('handleScroll should cancel existing request', () => {
    inputManager.scrollReq = 456;
    inputManager.handleScroll();
    expect(vi.mocked(window.cancelAnimationFrame)).toHaveBeenCalledWith(456);
  });

  describe('画像クリックによるページ送り', () => {
    /** @type {HTMLImageElement} */
    let img;

    beforeEach(() => {
      img = document.createElement('img');
      document.body.appendChild(img);
    });

    afterEach(() => {
      img.remove();
    });

    it('画像クリック（移動なし）で次ページに移動する', () => {
      vi.mocked(logic.getClickNavigationDirection).mockReturnValue('next');
      inputManager.onMouseDown(/** @type {any} */ ({ target: img, clientX: 100, clientY: 100 }));
      inputManager.onMouseUp(/** @type {any} */ ({ target: img, clientX: 100, clientY: 100 }));
      expect(logic.getClickNavigationDirection).toHaveBeenCalledWith(img);
      expect(navigator.scrollToImage).toHaveBeenCalledWith(1);
    });

    it('画像クリック（移動なし）で前ページに移動する（見開き右側）', () => {
      vi.mocked(logic.getClickNavigationDirection).mockReturnValue('prev');
      inputManager.onMouseDown(/** @type {any} */ ({ target: img, clientX: 50, clientY: 50 }));
      inputManager.onMouseUp(/** @type {any} */ ({ target: img, clientX: 50, clientY: 50 }));
      expect(navigator.scrollToImage).toHaveBeenCalledWith(-1);
    });

    it('移動距離が閾値以上の場合はクリックとして扱わない', () => {
      vi.mocked(logic.getClickNavigationDirection).mockReturnValue('next');
      inputManager.onMouseDown(/** @type {any} */ ({ target: img, clientX: 100, clientY: 100 }));
      inputManager.onMouseUp(/** @type {any} */ ({ target: img, clientX: 110, clientY: 100 }));
      expect(navigator.scrollToImage).not.toHaveBeenCalled();
    });

    it('mousedown対象と異なる画像でmouseupされた場合は無視する', () => {
      const otherImg = document.createElement('img');
      inputManager.onMouseDown(/** @type {any} */ ({ target: img, clientX: 100, clientY: 100 }));
      inputManager.onMouseUp(/** @type {any} */ ({ target: otherImg, clientX: 100, clientY: 100 }));
      expect(navigator.scrollToImage).not.toHaveBeenCalled();
    });

    it('mousedown対象が画像でない場合は記録しない', () => {
      const div = document.createElement('div');
      inputManager.onMouseDown(/** @type {any} */ ({ target: div, clientX: 100, clientY: 100 }));
      inputManager.onMouseUp(/** @type {any} */ ({ target: div, clientX: 100, clientY: 100 }));
      expect(navigator.scrollToImage).not.toHaveBeenCalled();
    });

    it('スクリプト無効時はクリック移動しない', () => {
      store.getState.mockReturnValue({ enabled: false, isMetadataModalOpen: false, isHelpModalOpen: false });
      vi.mocked(logic.getClickNavigationDirection).mockReturnValue('next');
      inputManager.onMouseDown(/** @type {any} */ ({ target: img, clientX: 100, clientY: 100 }));
      inputManager.onMouseUp(/** @type {any} */ ({ target: img, clientX: 100, clientY: 100 }));
      expect(navigator.scrollToImage).not.toHaveBeenCalled();
    });

    it('モーダル表示中はクリック移動しない', () => {
      store.getState.mockReturnValue({ enabled: true, isMetadataModalOpen: true, isHelpModalOpen: false });
      vi.mocked(logic.getClickNavigationDirection).mockReturnValue('next');
      inputManager.onMouseDown(/** @type {any} */ ({ target: img, clientX: 100, clientY: 100 }));
      inputManager.onMouseUp(/** @type {any} */ ({ target: img, clientX: 100, clientY: 100 }));
      expect(navigator.scrollToImage).not.toHaveBeenCalled();
    });

    it('init で mousedown/mouseup リスナーが登録される', () => {
      inputManager.init();
      expect(document.addEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(document.addEventListener).toHaveBeenCalledWith('mouseup', expect.any(Function));
    });
  });
});
