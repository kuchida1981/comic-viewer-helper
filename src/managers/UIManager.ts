import { injectStyles } from '../ui/styles';
import { createPowerButton, PowerButtonComponent } from '../ui/components/PowerButton';
import { createPageCounter, PageCounterComponent } from '../ui/components/PageCounter';
import { createSpreadControls, SpreadControlsComponent } from '../ui/components/SpreadControls';
import { createNavigationButtons } from '../ui/components/NavigationButtons';
import { createMetadataModal } from '../ui/components/MetadataModal';
import { createHelpModal } from '../ui/components/HelpModal';
import { createSearchModal } from '../ui/components/SearchModal';
import { createProgressBar, ProgressBarComponent } from '../ui/components/ProgressBar';
import { createResumeNotification } from '../ui/components/ResumeNotification';
import { createLoadingIndicator, LoadingIndicatorComponent } from '../ui/components/LoadingIndicator';
import { Draggable } from '../ui/Draggable';
import { createElement } from '../ui/utils';
import { jumpToRandomWork } from '../logic';
import { Store } from '../store';
import { Navigator } from './Navigator';
import { SiteAdapter } from '../types';


export class UIManager {
  private adapter: SiteAdapter;
  private store: Store;
  private navigator: Navigator;

  // Component references
  private powerComp: PowerButtonComponent | null;
  private counterComp: PageCounterComponent | null;
  private spreadComp: SpreadControlsComponent | null;
  private progressComp: ProgressBarComponent | null;
  private loadingComp: LoadingIndicatorComponent | null;
  private draggable: Draggable | null;
  private modalEl: HTMLElement | null;
  private helpModalEl: HTMLElement | null;
  private searchModalEl: HTMLElement | null;

  constructor(adapter: SiteAdapter, store: Store, navigator: Navigator) {
    this.adapter = adapter;
    this.store = store;
    this.navigator = navigator;

    // Component references
    this.powerComp = null;
    this.counterComp = null;
    this.spreadComp = null;
    this.progressComp = null;
    this.loadingComp = null;
    this.draggable = null;
    this.modalEl = null;
    this.helpModalEl = null;
    this.searchModalEl = null;

    this.updateUI = this.updateUI.bind(this);
    this.init = this.init.bind(this);
  }

  init(): void {
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

  updateUI(): void {
    const state = this.store.getState();
    const { enabled, isDualViewEnabled, guiPos, currentVisibleIndex, isLoading } = state;
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
        onDragEnd: (top: number, left: number) => this.store.setState({ guiPos: { top, left } })
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
        onJump: (val: string) => {
          (async () => {
            const success = await this.navigator.jumpToPage(val);
            if (this.counterComp) {
              this.counterComp.input.blur();
              if (!success) {
                this.counterComp.input.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
                setTimeout(() => {
                  if (this.counterComp) this.counterComp.input.style.backgroundColor = '';
                }, 500);
              }
            }
          })();
        }
      });
      container.appendChild(this.counterComp.el);
    }

    if (!this.spreadComp) {
      this.spreadComp = createSpreadControls({
        isDualViewEnabled,
        onToggle: (val: boolean) => this.store.setState({ isDualViewEnabled: val }),
        onAdjust: () => {
          const { spreadOffset } = this.store.getState();
          this.store.setState({ spreadOffset: spreadOffset === 0 ? 1 : 0 });
        }
      });
      container.appendChild(this.spreadComp.el);
    }

    if (!this.progressComp) {
      this.progressComp = createProgressBar();
      document.body.appendChild(this.progressComp.el);
    }

    if (!this.loadingComp) {
      this.loadingComp = createLoadingIndicator({ isLoading });
      document.body.appendChild(this.loadingComp.el);
    }

    if (container.querySelectorAll('.comic-helper-button').length === 0) {
      const { metadata } = state;

      const navBtns = createNavigationButtons({
        onFirst: () => { void this.navigator.scrollToEdge('start'); },
        onPrev: () => { void this.navigator.scrollToImage(-1); },
        onNext: () => { void this.navigator.scrollToImage(1); },
        onLast: () => { void this.navigator.scrollToEdge('end'); },
        onInfo: () => this.store.setState({ isMetadataModalOpen: true }),
        onHelp: () => this.store.setState({ isHelpModalOpen: true }),
        onSearch: () => this.store.setState({ isSearchModalOpen: true }),
        onLucky: () => { jumpToRandomWork(metadata); }
      });
      navBtns.elements.forEach(btn => container?.appendChild(btn));
    }

    // Handle Help Modal
    const { isMetadataModalOpen, isHelpModalOpen, isSearchModalOpen, metadata } = state;
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

    // Handle Search Modal
    if (isSearchModalOpen) {
      if (!this.searchModalEl) {
        const modal = createSearchModal({
          onSearch: (query: string) => {
            this.store.setState({ isSearchModalOpen: false });
            if (this.adapter.getSearchUrl) {
              window.location.href = this.adapter.getSearchUrl(query);
            }
          },
          onClose: () => this.store.setState({ isSearchModalOpen: false })
        });
        this.searchModalEl = modal.el;
        document.body.appendChild(this.searchModalEl);
      }
    } else {
      if (this.searchModalEl) {
        this.searchModalEl.remove();
        this.searchModalEl = null;
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
    this.loadingComp.update(isLoading);

    // Toggle global scrollbar visibility
    document.documentElement.classList.toggle('comic-helper-enabled', enabled);


    if (!enabled) {
      container.style.padding = '4px 8px';
      this.counterComp.el.style.display = 'none';
      this.spreadComp.el.style.display = 'none';
      if (this.progressComp) this.progressComp.el.style.display = 'none';
      container.querySelectorAll('.comic-helper-button').forEach(btn => {
        (btn as HTMLElement).style.display = 'none';
      });
      return;
    }

    container.style.padding = '8px';
    this.counterComp.el.style.display = 'flex';
    this.spreadComp.el.style.display = 'flex';
    if (this.progressComp) {
      this.progressComp.el.style.display = 'block';
      this.progressComp.update(currentVisibleIndex, imgs.length);
    }
    container.querySelectorAll('.comic-helper-button').forEach(btn => {
      (btn as HTMLElement).style.display = 'inline-block';
    });

    this.counterComp.update(currentVisibleIndex + 1, imgs.length);
    this.spreadComp.update(isDualViewEnabled);
  }

  /**
   * Show resume notification
   */
  showResumeNotification(savedIndex: number): void {
    const notification = createResumeNotification({
      savedIndex,
      onResume: () => {
        this.navigator.jumpToPage(savedIndex + 1);
      },
      onSkip: () => {
        // 何もしない（最初から読む）
      }
    });
    document.body.appendChild(notification.el);
  }
}
