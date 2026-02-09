import { createElement } from '../utils';
import { t } from '../../i18n';
import { SearchResultsState, SearchContext, Tag } from '../../types';
import { HistoryRecord } from '../../managers/HistoryManager';
import { createSearchTab, SearchTabComponent } from './SearchTab';
import { createHistoryTab } from './HistoryTab';
import { createAnalysisTab } from './AnalysisTab';

export interface SearchModalProps {
  onSearch: (query: string, context?: SearchContext) => void;
  onPageChange: (url: string) => void;
  onClose: () => void;
  onDeleteHistory: (url: string) => void;
  onClearHistory: () => void;
  searchResults: SearchResultsState | null;
  searchQuery?: string;
  searchContext?: SearchContext;
  searchHistory: string[];
  history: HistoryRecord[];
}

export interface SearchModalComponent {
  el: HTMLElement;
  updateResults: (searchResults: SearchResultsState | null) => void;
  updateHistory: (history: HistoryRecord[]) => void;
  setUpdating: (updating: boolean) => void;
  setTab: (tabId: 'search' | 'history' | 'analysis') => void;
}

export function createSearchModal(props: SearchModalProps): SearchModalComponent {
  const { onSearch, onClose, onDeleteHistory, onClearHistory } = props;

  let activeTabId: 'search' | 'history' | 'analysis' = 'search';
  
  const tabContainer = createElement('div', {
    className: 'comic-helper-tabs'
  });

  const tabButtons: { [key: string]: HTMLElement } = {};

  const createTabBtn = (id: 'search' | 'history' | 'analysis', label: string) => {
    const btn = createElement('button', {
      className: `comic-helper-tab-btn${activeTabId === id ? ' active' : ''}`,
      textContent: label,
      events: {
        click: function handleTabBtnClick() { setTab(id); }
      }
    });
    tabButtons[id] = btn;
    return btn;
  };

  tabContainer.appendChild(createTabBtn('search', t('ui.searchTab')));
  tabContainer.appendChild(createTabBtn('history', t('ui.historyTab')));
  tabContainer.appendChild(createTabBtn('analysis', t('ui.analysisTab')));

  const contentContainer = createElement('div', {
    className: 'comic-helper-tab-container'
  });

  let searchTab: SearchTabComponent | null = null;
  let historyTabEl: HTMLElement | null = null;
  let analysisTabEl: HTMLElement | null = null;

  const renderActiveTab = function renderActiveTab() {
    contentContainer.innerHTML = '';
    if (activeTabId === 'search') {
      if (!searchTab) {
        searchTab = createSearchTab(props);
      }
      contentContainer.appendChild(searchTab.el);
    } else if (activeTabId === 'history') {
      const handleHistoryDelete = function handleHistoryDelete(url: string) { return onDeleteHistory(url); };
      const handleHistoryClear = function handleHistoryClear() { return onClearHistory(); };
      historyTabEl = createHistoryTab({
        history: props.history,
        onDelete: handleHistoryDelete,
        onClear: handleHistoryClear
      });
      contentContainer.appendChild(historyTabEl);
    } else if (activeTabId === 'analysis') {
      analysisTabEl = createAnalysisTab({
        history: props.history,
        onTagClick: function handleAnalysisTagClick(tag: Tag) {
          setTab('search');
          onSearch(tag.href, { type: 'tag', label: tag.text });
        }
      });
      contentContainer.appendChild(analysisTabEl);
    }
  };

  const setTab = function setTab(tabId: 'search' | 'history' | 'analysis') {
    activeTabId = tabId;
    Object.keys(tabButtons).forEach(function updateTabButton(id) {
      const btn = tabButtons[id];
      if (id === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    renderActiveTab();
  };

  const closeBtn = createElement('button', {
    className: 'comic-helper-modal-close',
    textContent: '×',
    title: t('ui.close'),
    events: {
      click: function handleCloseBtnClick(e) {
        e.preventDefault();
        onClose();
      }
    }
  });

  const title = createElement('h2', {
    className: 'comic-helper-modal-title',
    textContent: 'Comic Helper',
    style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
  });

  const updatingIndicator = createElement('span', {
    className: 'comic-helper-search-updating',
    textContent: '...',
    style: { display: 'none', fontSize: '14px', marginLeft: '8px' }
  });
  title.appendChild(updatingIndicator);

  const spinner = createElement('div', { className: 'comic-helper-spinner' });
  const spinnerOverlay = createElement('div', {
    className: 'comic-helper-search-spinner-overlay'
  }, [spinner]);

  const content = createElement('div', {
    className: 'comic-helper-modal-content',
    events: {
      click: function handleContentClick(e: Event) { e.stopPropagation(); }
    }
  }, [closeBtn, title, tabContainer, contentContainer, spinnerOverlay]);
  
  content.addEventListener('wheel', function handleContentWheel(e: Event) { e.stopPropagation(); }, { passive: true });

  const overlay = createElement('div', {
    className: 'comic-helper-modal-overlay',
    events: {
      click: function handleOverlayClick() { onClose(); }
    }
  }, [content]);
  overlay.addEventListener('wheel', function handleOverlayWheel(e: Event) { e.preventDefault(); e.stopPropagation(); }, { passive: false });

  renderActiveTab();

  // Anti-flicker logic state
  let loadingTimeout: number | null = null;
  let loadingStartTime: number = 0;
  const SHOW_DELAY_MS = 200;
  const MIN_SHOW_TIME_MS = 400;

    return {

      el: overlay,

      updateResults: function updateSearchModalResults(newResults: SearchResultsState | null) {

        props.searchResults = newResults;

        if (searchTab) {

          searchTab.updateResults(newResults);

        }

        if (activeTabId === 'search') {

          content.scrollTop = 0;

        }

      },

      updateHistory: function updateSearchModalHistory(newHistory: HistoryRecord[]) {

        props.history = newHistory;

        if (activeTabId === 'history' || activeTabId === 'analysis') {

          renderActiveTab();

        }

      },

      setUpdating: function setSearchModalUpdating(updating: boolean) {

        updatingIndicator.style.display = updating ? 'inline' : 'none';

  

        if (loadingTimeout) {

          clearTimeout(loadingTimeout);

          loadingTimeout = null;

        }

  

        if (updating) {

          if (searchTab) {

            searchTab.input.disabled = true;

          }

          loadingTimeout = window.setTimeout(function showSpinner() {

            spinnerOverlay.classList.add('visible');

            loadingStartTime = Date.now();

            loadingTimeout = null;

          }, SHOW_DELAY_MS);

        } else {

          const hide = function hideSpinner() {

            spinnerOverlay.classList.remove('visible');

            if (searchTab) {

              searchTab.input.disabled = false;

            }

          };

  

          const shownDuration = Date.now() - loadingStartTime;

          if (loadingStartTime > 0 && shownDuration < MIN_SHOW_TIME_MS) {

            window.setTimeout(hide, MIN_SHOW_TIME_MS - shownDuration);

          } else {

            hide();

          }

          loadingStartTime = 0;

        }

      },

      setTab

    };

  }

  