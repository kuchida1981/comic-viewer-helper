import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UIManager } from './UIManager';
import { createPowerButton } from '../ui/components/PowerButton.js';
import { injectStyles } from '../ui/styles.js';
import { createPageCounter } from '../ui/components/PageCounter.js';
import { createSpreadControls } from '../ui/components/SpreadControls.js';
import { createNavigationButtons } from '../ui/components/NavigationButtons.js';
import { createHelpModal } from '../ui/components/HelpModal.js';
import { createMetadataModal } from '../ui/components/MetadataModal.js';
import { Draggable } from '../ui/Draggable.js';
import { createElement } from '../ui/utils.js';

// Mock components
vi.mock('../ui/styles.js', () => ({ injectStyles: vi.fn() }));
vi.mock('../ui/utils.js', () => ({ 
  createElement: vi.fn()
}));
vi.mock('../ui/Draggable.js', () => ({
  Draggable: vi.fn().mockImplementation(function() {
    // @ts-ignore
    this.clampToViewport = vi.fn().mockReturnValue({ top: 20, left: 30 });
    return this;
  })
}));
vi.mock('../ui/components/PowerButton.js', () => ({
  createPowerButton: vi.fn(() => ({ el: { style: {}, appendChild: vi.fn() }, update: vi.fn() }))
}));
vi.mock('../ui/components/PageCounter.js', () => ({
  createPageCounter: vi.fn(() => ({ el: { style: {}, display: '' }, update: vi.fn(), input: {} }))
}));
vi.mock('../ui/components/SpreadControls.js', () => ({
  createSpreadControls: vi.fn(() => ({ el: { style: {}, display: '' }, update: vi.fn() }))
}));
vi.mock('../ui/components/NavigationButtons.js', () => ({
  createNavigationButtons: vi.fn(() => ({ elements: [{ style: {}, querySelectorAll: vi.fn() }] }))
}));
vi.mock('../ui/components/MetadataModal.js', () => ({
  createMetadataModal: vi.fn(() => ({ el: { style: {}, remove: vi.fn() } }))
}));
vi.mock('../ui/components/HelpModal.js', () => ({
  createHelpModal: vi.fn(() => ({ el: { style: {}, remove: vi.fn() } }))
}));

describe('UIManager', () => {
  /** @type {any} */
  let adapter;
  /** @type {any} */
  let store;
  /** @type {any} */
  let navigator;
  /** @type {any} */
  let uiManager;

  beforeEach(() => {
    adapter = { selectors: { container: '#c', images: 'img' } };
    
    store = {
      getState: vi.fn().mockReturnValue({ 
        enabled: true, 
        isDualViewEnabled: false, 
        guiPos: { top: 10, left: 10 },
        currentVisibleIndex: 0,
        metadata: {},
        isMetadataModalOpen: false,
        isHelpModalOpen: false,
        spreadOffset: 0
      }),
      setState: vi.fn(),
      subscribe: vi.fn()
    };
    
    navigator = { 
        getImages: vi.fn().mockReturnValue([]), 
        jumpToPage: vi.fn(),
        scrollToEdge: vi.fn(),
        scrollToImage: vi.fn()
    };
    
    uiManager = new UIManager(/** @type {any} */ (adapter), /** @type {any} */ (store), /** @type {any} */ (navigator));

    vi.stubGlobal('document', {
        getElementById: vi.fn().mockReturnValue(null),
        body: { appendChild: vi.fn() },
        createElement: vi.fn(),
        querySelector: vi.fn().mockReturnValue(null)
    });
    
    const mockContainer = { 
        style: {}, 
        appendChild: vi.fn(), 
        querySelectorAll: vi.fn().mockReturnValue([]) // Empty by default
    };
    vi.mocked(createElement).mockReturnValue(/** @type {any} */ (mockContainer));

    vi.stubGlobal('window', { addEventListener: vi.fn(), innerWidth: 1000, innerHeight: 1000 });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('init should inject styles and update UI', () => {
    uiManager.init();
    expect(injectStyles).toHaveBeenCalled();
    expect(document.body.appendChild).toHaveBeenCalled();
  });

  it('updateUI should create components', () => {
    uiManager.updateUI();
    expect(createPowerButton).toHaveBeenCalled();
  });

  it('updateUI should handle disabled state and toggling', () => {
    const mockBtn = { style: { display: '' } };
    vi.mocked(createElement).mockReturnValue(/** @type {any} */ ({
        style: {}, appendChild: vi.fn(),
        querySelectorAll: vi.fn().mockImplementation(sel => sel === '.comic-helper-button' ? [mockBtn] : [])
    }));
    
    // Disabled
    store.getState.mockReturnValue({ enabled: false, metadata: {}, isMetadataModalOpen: false, isHelpModalOpen: false, currentVisibleIndex: 0 });
    uiManager.updateUI();
    expect(mockBtn.style.display).toBe('none');
    
    // Enabled
    store.getState.mockReturnValue({ enabled: true, metadata: {}, isMetadataModalOpen: false, isHelpModalOpen: false, currentVisibleIndex: 0 });
    uiManager.updateUI();
    expect(mockBtn.style.display).toBe('inline-block');
  });

  it('should handle modals and their onClose callbacks', () => {
    store.getState.mockReturnValue({ enabled: true, isMetadataModalOpen: true, isHelpModalOpen: true, metadata: {}, currentVisibleIndex: 0 });
    uiManager.updateUI();
    
    // Test onClose
    vi.mocked(createHelpModal).mock.calls[0][0].onClose();
    expect(store.setState).toHaveBeenCalledWith({ isHelpModalOpen: false });

    vi.mocked(createMetadataModal).mock.calls[0][0].onClose();
    expect(store.setState).toHaveBeenCalledWith({ isMetadataModalOpen: false });
    
    // Close modals in state and update UI
    store.getState.mockReturnValue({ enabled: true, isMetadataModalOpen: false, isHelpModalOpen: false, metadata: {}, currentVisibleIndex: 0 });
    uiManager.updateUI();
  });

  it('should handle resize for draggable', () => {
    uiManager.init();
    const calls = vi.mocked(window.addEventListener).mock.calls;
    const resizeCall = calls.find(c => c[0] === 'resize');
    if (!resizeCall) throw new Error('Resize listener not found');
    const resizeCb = /** @type {Function} */ (resizeCall[1]);
    
    uiManager.draggable = { clampToViewport: vi.fn().mockReturnValue({ top: 50, left: 50 }) };
    resizeCb();
    expect(store.setState).toHaveBeenCalledWith({ guiPos: { top: 50, left: 50 } });
  });

  it('onDragEnd should update store', () => {
    uiManager.updateUI();
    const onDragEnd = /** @type {Function} */ ((/** @type {any} */ (vi.mocked(Draggable).mock.calls[0][1])).onDragEnd);
    onDragEnd(100, 200);
    expect(store.setState).toHaveBeenCalledWith({ guiPos: { top: 100, left: 200 } });
  });

  it('component callbacks should work', () => {
    uiManager.updateUI();
    
    const powerOnClick = vi.mocked(createPowerButton).mock.calls[0][0].onClick;
    store.getState.mockReturnValue({ enabled: true });
    powerOnClick();
    expect(store.setState).toHaveBeenCalledWith({ enabled: false });

    const counterOnJump = vi.mocked(createPageCounter).mock.calls[0][0].onJump;
    counterOnJump('5');
    expect(navigator.jumpToPage).toHaveBeenCalledWith('5');

    const spreadOnToggle = vi.mocked(createSpreadControls).mock.calls[0][0].onToggle;
    spreadOnToggle(true);
    expect(store.setState).toHaveBeenCalledWith({ isDualViewEnabled: true });

    const spreadOnAdjust = vi.mocked(createSpreadControls).mock.calls[0][0].onAdjust;
    store.getState.mockReturnValue({ spreadOffset: 0 });
    spreadOnAdjust();
    expect(store.setState).toHaveBeenCalledWith({ spreadOffset: 1 });
  });

  it('navigation button callbacks should work', () => {
    uiManager.updateUI();
    const callbacks = vi.mocked(createNavigationButtons).mock.calls[0][0];
    callbacks.onFirst();
    expect(navigator.scrollToEdge).toHaveBeenCalledWith('start');
    callbacks.onPrev();
    expect(navigator.scrollToImage).toHaveBeenCalledWith(-1);
    callbacks.onNext();
    expect(navigator.scrollToImage).toHaveBeenCalledWith(1);
    callbacks.onLast();
    expect(navigator.scrollToEdge).toHaveBeenCalledWith('end');
    callbacks.onInfo();
    expect(store.setState).toHaveBeenCalledWith({ isMetadataModalOpen: true });
    callbacks.onHelp();
    expect(store.setState).toHaveBeenCalledWith({ isHelpModalOpen: true });
  });
});