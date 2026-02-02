import { injectStyles } from '../ui/styles.js';
import { createPowerButton } from '../ui/components/PowerButton.js';
import { createPageCounter } from '../ui/components/PageCounter.js';
import { createSpreadControls } from '../ui/components/SpreadControls.js';
import { createNavigationButtons } from '../ui/components/NavigationButtons.js';
import { createMetadataModal } from '../ui/components/MetadataModal.js';
import { createHelpModal } from '../ui/components/HelpModal.js';
import { createProgressBar } from '../ui/components/ProgressBar.js';
import { createResumeToggle } from '../ui/components/ResumeToggle.js';
import { createResumeNotification } from '../ui/components/ResumeNotification.js';
import { Draggable } from '../ui/Draggable.js';
import { createElement } from '../ui/utils.js';

export class UIManager {
  /**
   * @param {import('../global').SiteAdapter} adapter 
   * @param {import('../store.js').Store} store 
   * @param {import('./Navigator.js').Navigator} navigator 
   */
  constructor(adapter, store, navigator) {
    this.adapter = adapter;
    this.store = store;
    this.navigator = navigator;

    // Component references
    this.powerComp = null;
    this.counterComp = null;
    this.spreadComp = null;
    this.resumeToggleComp = null;
    this.progressComp = null;
    this.draggable = null;
    this.modalEl = null;
    this.helpModalEl = null;

    this.updateUI = this.updateUI.bind(this);
    this.init = this.init.bind(this);
  }

  init() {
    injectStyles();
    this.updateUI();
    
    // Subscribe to store changes to update UI
    this.store.subscribe(this.updateUI);

    // Handle window resize for draggable clamping
    window.addEventListener('resize', () => {
      if (this.draggable) {
        const { top, left } = this.draggable.clampToViewport();
        this.store.setState({ guiPos: { top, left } });
      }
    });
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
          // Revert logic is handled by Navigator via store subscription in main orchestration
          this.store.setState({ enabled: newState });
        }
      });
      container.appendChild(this.powerComp.el);
    }

    // We need image count for the counter. Navigator has it.
    const imgs = this.navigator.getImages();

    if (!this.counterComp) {
      this.counterComp = createPageCounter({
        current: currentVisibleIndex + 1,
        total: imgs.length,
        onJump: (/** @type {string} */ val) => {
          const success = this.navigator.jumpToPage(val);
          if (this.counterComp) {
            this.counterComp.input.blur();
            if (!success) {
              this.counterComp.input.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
              setTimeout(() => {
                if (this.counterComp) this.counterComp.input.style.backgroundColor = '';
              }, 500);
            }
          }
        }
      });
      container.appendChild(this.counterComp.el);
    }

    if (!this.spreadComp) {
      this.spreadComp = createSpreadControls({
        isDualViewEnabled,
        onToggle: (/** @type {boolean} */ val) => this.store.setState({ isDualViewEnabled: val }),
        onAdjust: () => {
          const { spreadOffset } = this.store.getState();
          this.store.setState({ spreadOffset: spreadOffset === 0 ? 1 : 0 });
        }
      });
      container.appendChild(this.spreadComp.el);
    }

    if (!this.resumeToggleComp) {
      const { resumeEnabled } = state;
      this.resumeToggleComp = createResumeToggle({
        resumeEnabled,
        onToggle: (/** @type {boolean} */ val) => this.store.setState({ resumeEnabled: val })
      });
      container.appendChild(this.resumeToggleComp.el);
    }

    if (!this.progressComp) {
      this.progressComp = createProgressBar();
      document.body.appendChild(this.progressComp.el);
    }

    if (container.querySelectorAll('.comic-helper-button').length === 0) {
      const navBtns = createNavigationButtons({
        onFirst: () => this.navigator.scrollToEdge('start'),
        onPrev: () => this.navigator.scrollToImage(-1),
        onNext: () => this.navigator.scrollToImage(1),
        onLast: () => this.navigator.scrollToEdge('end'),
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

    this.powerComp.update(enabled);
    
    // Toggle global scrollbar visibility
    document.documentElement.classList.toggle('comic-helper-enabled', enabled);

    if (!enabled) {
      container.style.padding = '4px 8px';
      this.counterComp.el.style.display = 'none';
      this.spreadComp.el.style.display = 'none';
      // this.resumeToggleComp.el.style.display = 'none';
      if (this.progressComp) this.progressComp.el.style.display = 'none';
      container.querySelectorAll('.comic-helper-button').forEach(btn => {
         /** @type {HTMLElement} */ (btn).style.display = 'none';
      });
      return;
    }

    container.style.padding = '8px';
    this.counterComp.el.style.display = 'flex';
    this.spreadComp.el.style.display = 'flex';
    // this.resumeToggleComp.el.style.display = 'flex';
    if (this.progressComp) {
      this.progressComp.el.style.display = 'block';
      this.progressComp.update(currentVisibleIndex, imgs.length);
    }
    container.querySelectorAll('.comic-helper-button').forEach(btn => {
       /** @type {HTMLElement} */ (btn).style.display = 'inline-block';
    });

    this.counterComp.update(currentVisibleIndex + 1, imgs.length);
    this.spreadComp.update(isDualViewEnabled);
    // this.resumeToggleComp.update(state.resumeEnabled);
  }

  /**
   * Show resume notification
   * @param {number} savedIndex
   */
  showResumeNotification(savedIndex) {
    console.log('[UIManager] showResumeNotification called with savedIndex:', savedIndex);
    const imgs = this.navigator.getImages();
    console.log('[UIManager] Total images:', imgs.length);
    const notification = createResumeNotification({
      savedIndex,
      totalPages: imgs.length,
      onResume: () => {
        this.navigator.jumpToPage(savedIndex + 1);
      },
      onSkip: () => {
        // 何もしない（最初から読む）
      }
    });
    console.log('[UIManager] Notification created:', notification);
    console.log('[UIManager] Appending to body...');
    document.body.appendChild(notification.el);
    console.log('[UIManager] Appended! Checking DOM...');
    const check = document.getElementById('comic-helper-resume-notification');
    console.log('[UIManager] DOM check:', check);
  }
}
