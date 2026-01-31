import { fitImagesToViewport, getPrimaryVisibleImageIndex, getImageElementByIndex, revertToOriginal, getNavigationDirection } from './logic.js';
import { Store } from './store.js';
import { injectStyles } from './ui/styles.js';
import { createPowerButton } from './ui/components/PowerButton.js';
import { createPageCounter } from './ui/components/PageCounter.js';
import { createSpreadControls } from './ui/components/SpreadControls.js';
import { createNavigationButtons } from './ui/components/NavigationButtons.js';
import { Draggable } from './ui/Draggable.js';
import { createElement } from './ui/utils.js';

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

    this.init = this.init.bind(this);
    this.handleWheel = this.handleWheel.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.updateUI = this.updateUI.bind(this);
    this.applyLayout = this.applyLayout.bind(this);
  }

  getImages() {
    if (this.originalImages.length > 0) return this.originalImages;
    return /** @type {HTMLImageElement[]} */ (Array.from(document.querySelectorAll(IMG_SELECTOR)));
  }

  isInputField(target) {
    if (!(target instanceof HTMLElement)) return false;
    return (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      target.isContentEditable
    );
  }

  updatePageCounter() {
    const { enabled } = this.store.getState();
    if (!enabled || !this.pageCounterInput) return;

    const imgs = this.getImages();
    if (imgs.length === 0) {
      this.pageCounterInput.value = "0";
      if (this.totalCounterEl) this.totalCounterEl.textContent = ' / 0';
      return;
    }

    const currentIndex = getPrimaryVisibleImageIndex(imgs, window.innerHeight);
    if (currentIndex !== -1) {
      this.store.setState({ currentVisibleIndex: currentIndex });
    }
    
    const { currentVisibleIndex } = this.store.getState();
    const current = currentVisibleIndex !== -1 ? currentVisibleIndex + 1 : 1;
    const total = imgs.length;

    if (document.activeElement !== this.pageCounterInput) {
      this.pageCounterInput.value = String(current);
    }
    if (this.totalCounterEl) {
      this.totalCounterEl.textContent = ` / ${total}`;
    }
  }

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

  scrollToEdge(position) {
    const imgs = this.getImages();
    if (imgs.length === 0) return;
    const target = position === 'start' ? imgs[0] : imgs[imgs.length - 1];
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  handleWheel(e) {
    const { enabled, isDualViewEnabled, currentVisibleIndex } = this.store.getState();
    if (!enabled) return;

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

  onKeyDown(e) {
    if (this.isInputField(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
    const { enabled, isDualViewEnabled } = this.store.getState();
    if (!enabled) return;

    if (['ArrowDown', 'PageDown', 'ArrowRight', 'j'].includes(e.key) || (e.key === ' ' && !e.shiftKey)) {
      e.preventDefault();
      this.scrollToImage(1);
    } else if (['ArrowUp', 'PageUp', 'ArrowLeft', 'k'].includes(e.key) || (e.key === ' ' && e.shiftKey)) {
      e.preventDefault();
      this.scrollToImage(-1);
    } else if (e.key === 'd') {
      e.preventDefault();
      this.store.setState({ isDualViewEnabled: !isDualViewEnabled });
    }
  }

  applyLayout(forcedIndex) {
    const { enabled, isDualViewEnabled, spreadOffset, currentVisibleIndex } = this.store.getState();
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
    const { enabled, isDualViewEnabled, guiPos, currentVisibleIndex } = this.store.getState();
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
      new Draggable(container, {
        onDragEnd: (top, left) => this.store.setState({ guiPos: { top, left } })
      });
      document.body.appendChild(container);
    }

    container.innerHTML = '';

    // Power Button
    container.appendChild(createPowerButton({
      isEnabled: enabled,
      onClick: () => {
        const newState = !enabled;
        if (!newState) {
          revertToOriginal(this.getImages(), CONTAINER_SELECTOR);
        }
        this.store.setState({ enabled: newState });
      }
    }));

    if (!enabled) {
      container.style.padding = '4px 8px';
      return;
    }

    container.style.padding = '8px';

    // Page Counter
    const imgs = this.getImages();
    const { wrapper, input, totalLabel } = createPageCounter({
      current: currentVisibleIndex + 1,
      total: imgs.length,
      onJump: (val) => this.jumpToPage(val)
    });
    this.pageCounterInput = input;
    this.totalCounterEl = totalLabel;
    container.appendChild(wrapper);

    // Spread Controls
    const { label, adjustBtn } = createSpreadControls({
      isDualViewEnabled,
      onToggle: (val) => this.store.setState({ isDualViewEnabled: val }),
      onAdjust: () => {
        const { spreadOffset } = this.store.getState();
        this.store.setState({ spreadOffset: spreadOffset === 0 ? 1 : 0 });
      }
    });
    container.appendChild(label);
    if (adjustBtn) container.appendChild(adjustBtn);

    // Navigation Buttons
    const navBtns = createNavigationButtons({
      onFirst: () => this.scrollToEdge('start'),
      onPrev: () => this.scrollToImage(-1),
      onNext: () => this.scrollToImage(1),
      onLast: () => this.scrollToEdge('end')
    });
    navBtns.forEach(btn => container.appendChild(btn));
  }

  init() {
    const container = document.querySelector(CONTAINER_SELECTOR);
    if (!container) return;

    injectStyles();
    this.originalImages = /** @type {HTMLImageElement[]} */ (Array.from(document.querySelectorAll(IMG_SELECTOR)));
    
    this.originalImages.forEach(img => {
      if (!img.complete) {
        img.addEventListener('load', () => {
          if (this.resizeReq) cancelAnimationFrame(this.resizeReq);
          const { currentVisibleIndex } = this.store.getState();
          this.resizeReq = requestAnimationFrame(() => this.applyLayout(currentVisibleIndex));
        });
      }
    });

    this.store.subscribe((state) => {
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
      if (!this.store.getState().enabled) return;
      if (this.resizeReq) cancelAnimationFrame(this.resizeReq);
      const { currentVisibleIndex } = this.store.getState();
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