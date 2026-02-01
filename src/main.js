// ==UserScript==
// @name         Magazine Comic Viewer Helper
// @namespace    https://github.com/kuchida1981/comic-viewer-helper
// @version      1.1.0
// @description  A Tampermonkey script for specific comic sites that fits images to the viewport and enables precise image-by-image scrolling.
// @match        https://something/magazine/*
// @match        https://something/fanzine/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

import { fitImagesToViewport, getPrimaryVisibleImageIndex, getImageElementByIndex, revertToOriginal, getNavigationDirection, extractMetadata } from './logic.js';
import { Store } from './store.js';
import { injectStyles } from './ui/styles.js';
import { createPowerButton } from './ui/components/PowerButton.js';
import { createPageCounter } from './ui/components/PageCounter.js';
import { createSpreadControls } from './ui/components/SpreadControls.js';
import { createNavigationButtons } from './ui/components/NavigationButtons.js';
import { createMetadataModal } from './ui/components/MetadataModal.js';
import { createHelpModal } from './ui/components/HelpModal.js';
import { Draggable } from './ui/Draggable.js';
import { createElement } from './ui/utils.js';
import { SHORTCUTS } from './shortcuts.js';

const CONTAINER_SELECTOR = '#post-comic';
const IMG_SELECTOR = '#post-comic img';

class App {
  constructor() {
    this.store = new Store();
    /** @type {HTMLImageElement[]} */
    this.originalImages = [];
    this.lastWheelTime = 0;
    this.WHEEL_THROTTLE_MS = 500;
    this.WHEEL_THRESHOLD = 1;
    
    /** @type {HTMLInputElement | null} */
    this.pageCounterInput = null;
    /** @type {HTMLElement | null} */
    this.totalCounterEl = null;
    /** @type {number | undefined} */
    this.resizeReq = undefined;
    /** @type {number | undefined} */
    this.scrollReq = undefined;

    // Track last state to avoid redundant layout calculations
    this._lastEnabled = undefined;
    this._lastDualView = undefined;
    this._lastSpreadOffset = undefined;

    // Component references
    /** @type {ReturnType<typeof createPowerButton> | null} */
    this.powerComp = null;
    /** @type {ReturnType<typeof createPageCounter> | null} */
    this.counterComp = null;
    /** @type {ReturnType<typeof createSpreadControls> | null} */
    this.spreadComp = null;
    /** @type {Draggable | null} */
    this.draggable = null;
    /** @type {HTMLElement | null} */
    this.modalEl = null;
    /** @type {HTMLElement | null} */
    this.helpModalEl = null;

    this.init = this.init.bind(this);
    this.handleWheel = this.handleWheel.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.toggleSpreadOffset = this.toggleSpreadOffset.bind(this);
    this.updateUI = this.updateUI.bind(this);
    this.applyLayout = this.applyLayout.bind(this);
  }

  getImages() {
    if (this.originalImages.length > 0) return this.originalImages;
    return /** @type {HTMLImageElement[]} */ (Array.from(document.querySelectorAll(IMG_SELECTOR)));
  }

  /**
   * @param {EventTarget | null} target 
   * @returns {boolean}
   */
  isInputField(target) {
    if (!(target instanceof HTMLElement)) return false;
    return (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      target.isContentEditable
    );
  }

  toggleSpreadOffset() {
    const { spreadOffset } = this.store.getState();
    this.store.setState({ spreadOffset: spreadOffset === 0 ? 1 : 0 });
  }

  updatePageCounter() {
    const state = this.store.getState();
    const { enabled } = state;
    if (!enabled) return;

    const imgs = this.getImages();
    const currentIndex = getPrimaryVisibleImageIndex(imgs, window.innerHeight);
    if (currentIndex !== -1) {
      this.store.setState({ currentVisibleIndex: currentIndex });
    }
  }

  /**
   * @param {string | number} pageNumber 
   */
  jumpToPage(pageNumber) {
    const imgs = this.getImages();
    const index = typeof pageNumber === 'string' ? parseInt(pageNumber, 10) - 1 : pageNumber - 1;
    const targetImg = getImageElementByIndex(imgs, index);

    if (targetImg) {
      targetImg.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (this.pageCounterInput) this.pageCounterInput.blur();
    } else {
      this.updatePageCounter();
      if (this.pageCounterInput) {
        this.pageCounterInput.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
        setTimeout(() => {
          if (this.pageCounterInput) this.pageCounterInput.style.backgroundColor = 'transparent';
        }, 500);
        this.pageCounterInput.blur();
      }
    }
  }

  /**
   * @param {number} direction 
   */
  scrollToImage(direction) {
    const imgs = this.getImages();
    if (imgs.length === 0) return;

    const { isDualViewEnabled } = this.store.getState();
    const currentIndex = getPrimaryVisibleImageIndex(imgs, window.innerHeight);
    let targetIndex = currentIndex + direction;

    if (targetIndex < 0) targetIndex = 0;
    if (targetIndex >= imgs.length) targetIndex = imgs.length - 1;

    const prospectiveTargetImg = imgs[targetIndex];

    if (isDualViewEnabled && direction !== 0 && currentIndex !== -1) {
      const currentImg = imgs[currentIndex];
      if (currentImg && prospectiveTargetImg && prospectiveTargetImg.parentElement === currentImg.parentElement && prospectiveTargetImg.parentElement?.classList.contains('comic-row-wrapper')) {
        targetIndex += direction;
      }
    }

    const finalIndex = Math.max(0, Math.min(targetIndex, imgs.length - 1));
    const finalTarget = imgs[finalIndex];
    if (finalTarget) {
      finalTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * @param {'start' | 'end'} position 
   */
  scrollToEdge(position) {
    const imgs = this.getImages();
    if (imgs.length === 0) return;
    const target = position === 'start' ? imgs[0] : imgs[imgs.length - 1];
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /**
   * @param {WheelEvent} e 
   */
  handleWheel(e) {
    const { enabled, isDualViewEnabled, currentVisibleIndex, isMetadataModalOpen, isHelpModalOpen } = this.store.getState();
    if (!enabled) return;
    
    if (isMetadataModalOpen || isHelpModalOpen) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    const now = Date.now();
    if (now - this.lastWheelTime < this.WHEEL_THROTTLE_MS) return;

    const direction = getNavigationDirection(e, this.WHEEL_THRESHOLD);
    if (direction === 'none') return;

    const imgs = this.getImages();
    if (imgs.length === 0) return;

    this.lastWheelTime = now;
    const step = isDualViewEnabled ? 2 : 1;
    const nextIndex = direction === 'next' 
      ? Math.min(currentVisibleIndex + step, imgs.length - 1)
      : Math.max(currentVisibleIndex - step, 0);
    
    this.jumpToPage(nextIndex + 1);
  }

  /**
   * @param {KeyboardEvent} e 
   */
  onKeyDown(e) {
    if (this.isInputField(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
    const { enabled, isDualViewEnabled, isMetadataModalOpen, isHelpModalOpen } = this.store.getState();
    
    // Handle Escape for all modals
    if (e.key === 'Escape') {
      if (isMetadataModalOpen || isHelpModalOpen) {
        e.preventDefault();
        this.store.setState({ isMetadataModalOpen: false, isHelpModalOpen: false });
        return;
      }
    }

    // Helper function to check if a key matches a shortcut
    /** @param {string} label */
    const isKey = (label) => {
      const sc = SHORTCUTS.find(s => s.label === label);
      return sc ? sc.keys.includes(e.key) : false;
    };

    // Allow toggling help even if already open
    if (isKey('Help') && isHelpModalOpen) {
      e.preventDefault();
      this.store.setState({ isHelpModalOpen: false });
      return;
    }

    if (isMetadataModalOpen || isHelpModalOpen || !enabled) return;

    if (isKey('Next Page')) {
      e.preventDefault();
      this.scrollToImage(1);
    } else if (isKey('Prev Page')) {
      e.preventDefault();
      this.scrollToImage(-1);
    } else if (isKey('Dual View')) {
      e.preventDefault();
      this.store.setState({ isDualViewEnabled: !isDualViewEnabled });
    } else if (isKey('Spread Offset') && isDualViewEnabled) {
      e.preventDefault();
      this.toggleSpreadOffset();
    } else if (isKey('Metadata')) {
      e.preventDefault();
      this.store.setState({ isMetadataModalOpen: !isMetadataModalOpen });
    } else if (isKey('Help')) {
      e.preventDefault();
      this.store.setState({ isHelpModalOpen: !isHelpModalOpen });
    }
  }

  /**
   * @param {number} [forcedIndex] 
   */
  applyLayout(forcedIndex) {
    const { enabled, isDualViewEnabled, spreadOffset } = this.store.getState();
    if (!enabled) return;

    const imgs = this.getImages();
    const currentIndex = forcedIndex !== undefined ? forcedIndex : getPrimaryVisibleImageIndex(imgs, window.innerHeight);

    fitImagesToViewport(CONTAINER_SELECTOR, spreadOffset, isDualViewEnabled);
    this.updatePageCounter();

    if (currentIndex !== -1) {
      const targetImg = imgs[currentIndex];
      if (targetImg) targetImg.scrollIntoView({ block: 'center' });
    }
  }

  updateUI() {
    const state = this.store.getState();
    const { enabled, isDualViewEnabled, guiPos, currentVisibleIndex } = state;
    let container = document.getElementById('comic-helper-ui');

    if (!container) {
      container = createElement('div', { id: 'comic-helper-ui' });
      if (guiPos) {
        Object.assign(container.style, { 
          top: `${guiPos.top}px`, 
          left: `${guiPos.left}px`, 
          bottom: 'auto', 
          right: 'auto' 
        });
      }
      this.draggable = new Draggable(container, {
        onDragEnd: (/** @type {number} */ top, /** @type {number} */ left) => this.store.setState({ guiPos: { top, left } })
      });
      document.body.appendChild(container);
    }

    // Initialize components if they don't exist
    if (!this.powerComp) {
      this.powerComp = createPowerButton({
        isEnabled: enabled,
        onClick: () => {
          const newState = !this.store.getState().enabled;
          if (!newState) {
            revertToOriginal(this.getImages(), CONTAINER_SELECTOR);
          }
          this.store.setState({ enabled: newState });
        }
      });
      container.appendChild(this.powerComp.el);
    }

    const imgs = this.getImages();

    if (!this.counterComp) {
      this.counterComp = createPageCounter({
        current: currentVisibleIndex + 1,
        total: imgs.length,
        onJump: (/** @type {string} */ val) => this.jumpToPage(val)
      });
      this.pageCounterInput = this.counterComp.input;
      container.appendChild(this.counterComp.el);
    }

    if (!this.spreadComp) {
      this.spreadComp = createSpreadControls({
        isDualViewEnabled,
        onToggle: (/** @type {boolean} */ val) => this.store.setState({ isDualViewEnabled: val }),
        onAdjust: this.toggleSpreadOffset
      });
      container.appendChild(this.spreadComp.el);
    }

    if (container.querySelectorAll('.comic-helper-button').length === 0) {
      const navBtns = createNavigationButtons({
        onFirst: () => this.scrollToEdge('start'),
        onPrev: () => this.scrollToImage(-1),
        onNext: () => this.scrollToImage(1),
        onLast: () => this.scrollToEdge('end'),
        onInfo: () => this.store.setState({ isMetadataModalOpen: true }),
        onHelp: () => this.store.setState({ isHelpModalOpen: true })
      });
      navBtns.elements.forEach(btn => container.appendChild(btn));
    }

    // Handle Help Modal
    const { isMetadataModalOpen, isHelpModalOpen, metadata } = state;
    if (isHelpModalOpen) {
      if (!this.helpModalEl) {
        const modal = createHelpModal({
          onClose: () => this.store.setState({ isHelpModalOpen: false })
        });
        this.helpModalEl = modal.el;
        document.body.appendChild(this.helpModalEl);
      }
    } else {
      if (this.helpModalEl) {
        this.helpModalEl.remove();
        this.helpModalEl = null;
      }
    }

    // Handle Metadata Modal
    if (isMetadataModalOpen) {
      if (!this.modalEl) {
        const modal = createMetadataModal({
          metadata,
          onClose: () => this.store.setState({ isMetadataModalOpen: false })
        });
        this.modalEl = modal.el;
        document.body.appendChild(this.modalEl);
      }
    } else {
      if (this.modalEl) {
        this.modalEl.remove();
        this.modalEl = null;
      }
    }

    // Update visibility and state
    this.powerComp.update(enabled);
    
    if (!enabled) {
      container.style.padding = '4px 8px';
      this.counterComp.el.style.display = 'none';
      this.spreadComp.el.style.display = 'none';
      container.querySelectorAll('.comic-helper-button').forEach(btn => {
         /** @type {HTMLElement} */ (btn).style.display = 'none';
      });
      return;
    }

    container.style.padding = '8px';
    this.counterComp.el.style.display = 'flex';
    this.spreadComp.el.style.display = 'flex';
    container.querySelectorAll('.comic-helper-button').forEach(btn => {
       /** @type {HTMLElement} */ (btn).style.display = 'inline-block';
    });

    this.counterComp.update(currentVisibleIndex + 1, imgs.length);
    this.spreadComp.update(isDualViewEnabled);
  }

  init() {
    const container = document.querySelector(CONTAINER_SELECTOR);
    if (!container) return;

    injectStyles();
    this.originalImages = /** @type {HTMLImageElement[]} */ (Array.from(document.querySelectorAll(IMG_SELECTOR)));
    
    // Extract metadata
    const metadata = extractMetadata();
    this.store.setState({ metadata });

    this.originalImages.forEach(img => {
      if (!img.complete) {
        img.addEventListener('load', () => {
          if (this.resizeReq) cancelAnimationFrame(this.resizeReq);
          const { currentVisibleIndex } = this.store.getState();
          this.resizeReq = requestAnimationFrame(() => this.applyLayout(currentVisibleIndex));
        });
      }
    });

    this.store.subscribe((/** @type {any} */ state) => {
      // Check if layout-affecting state changed
      const layoutChanged = 
        state.enabled !== this._lastEnabled ||
        state.isDualViewEnabled !== this._lastDualView ||
        state.spreadOffset !== this._lastSpreadOffset;

      if (layoutChanged) {
        this.applyLayout();
        this._lastEnabled = state.enabled;
        this._lastDualView = state.isDualViewEnabled;
        this._lastSpreadOffset = state.spreadOffset;
      }
      
      this.updateUI();
    });

    const initialState = this.store.getState();
    this._lastEnabled = initialState.enabled;
    this._lastDualView = initialState.isDualViewEnabled;
    this._lastSpreadOffset = initialState.spreadOffset;

    if (initialState.enabled) {
      this.applyLayout();
    }

    this.updateUI();

    window.addEventListener('resize', () => {
      const { enabled, currentVisibleIndex } = this.store.getState();
      
      if (this.draggable) {
        const { top, left } = this.draggable.clampToViewport();
        this.store.setState({ guiPos: { top, left } });
      }

      if (!enabled) return;
      if (this.resizeReq) cancelAnimationFrame(this.resizeReq);
      this.resizeReq = requestAnimationFrame(() => this.applyLayout(currentVisibleIndex));
    });

    window.addEventListener('scroll', () => {
      if (!this.store.getState().enabled) return;
      if (this.scrollReq) cancelAnimationFrame(this.scrollReq);
      this.scrollReq = requestAnimationFrame(() => this.updatePageCounter());
    });

    window.addEventListener('wheel', this.handleWheel, { passive: false });
    document.addEventListener('keydown', this.onKeyDown, true);
  }
}

const app = new App();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', app.init);
} else {
  app.init();
}