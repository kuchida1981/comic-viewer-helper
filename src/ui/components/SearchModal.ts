import { createElement } from '../utils';
import { t } from '../../i18n';
import { SearchResultsState, SearchContext, Tag, RelatedWork } from '../../types';
import { filterWorksByTags, enrichWorksWithCachedTags } from '../../logic';
import { createTrendSection } from './TrendSection';

export interface SearchModalProps {
  onSearch: (query: string, context?: SearchContext) => void;
  onPageChange: (url: string) => void;
  onClose: () => void;
  searchResults: SearchResultsState | null;
  searchQuery?: string;
  searchContext?: SearchContext;
  searchHistory: string[];
  workTagsCache?: Record<string, Tag[]>;
  pinnedTags?: string[];
  onTogglePinTag?: (tagText: string) => void;
}

export interface SearchModalComponent {
  el: HTMLElement;
  input: HTMLInputElement;
  updateResults: (searchResults: SearchResultsState | null) => void;
  setUpdating: (updating: boolean) => void;
  updateWorkTagsCache: (cache: Record<string, Tag[]>) => void;
  updatePinnedTags: (pinnedTags: string[]) => void;
}

function createResultsSection(
  searchResults: SearchResultsState | null,
  onPageChange: (url: string) => void,
  onTagCompletion: (label: string) => void,
  filteredResults?: RelatedWork[]
): HTMLElement {
  const section = createElement('div', {
    className: 'comic-helper-search-results-section'
  });

  if (!searchResults) return section;

  const { results, totalCount, pagination, searchContext } = searchResults;
  const displayResults: { title: string; href: string; thumb: string }[] = (filteredResults ?? results);

  const header = createElement('div', {
    className: 'comic-helper-section-title'
  });

  if (searchContext?.label) {
    const prefix = searchContext.type.charAt(0).toUpperCase() + searchContext.type.slice(1);
    const prefixEl = document.createTextNode(`${prefix}: `);
    const tagEl = createElement('span', {
      className: 'comic-helper-search-header-tag',
      textContent: searchContext.label,
      events: {
        click: (e) => {
          e.preventDefault();
          onTagCompletion(searchContext.label || '');
        }
      }
    });
    header.appendChild(prefixEl);
    header.appendChild(tagEl);
    if (totalCount) {
      header.appendChild(document.createTextNode(` (${totalCount})`));
    }
  } else {
    header.textContent = totalCount
      ? `${t('ui.searchResults')} (${totalCount})`
      : t('ui.searchResults');
  }
  section.appendChild(header);

  if (results.length === 0) {
    section.appendChild(createElement('div', {
      className: 'comic-helper-search-no-results',
      textContent: t('ui.searchNoResults')
    }));
    return section;
  }

  const grid = createElement('div', {
    className: 'comic-helper-search-result-grid'
  });

  displayResults.forEach(item => {
    const thumb = createElement('img', {
      className: 'comic-helper-search-result-thumb',
      attributes: { src: item.thumb, loading: 'lazy' }
    });
    const title = createElement('div', {
      className: 'comic-helper-search-result-title',
      textContent: item.title
    });
    const link = createElement('a', {
      className: 'comic-helper-search-result-item',
      attributes: { href: item.href, target: '_blank' },
      events: { click: (e) => e.stopPropagation() }
    }, [thumb, title]);
    grid.appendChild(link);
  });
  section.appendChild(grid);

  if (pagination.length > 0) {
    const nav = createElement('div', {
      className: 'comic-helper-search-pagination'
    });

    pagination.forEach(item => {
      const label = item.type === 'next' ? t('ui.goNext') : item.type === 'prev' ? t('ui.goPrev') : item.label;
      const btn = createElement('button', {
        className: `comic-helper-search-page-btn${item.isCurrent ? ' active' : ''} type-${item.type}`,
        textContent: item.label,
        attributes: {
          title: label,
          ...( (!item.url || item.isCurrent) ? { disabled: 'true' } : {} )
        },
        events: {
          click: (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (item.url) onPageChange(item.url);
          }
        }
      });
      nav.appendChild(btn);
    });
    section.appendChild(nav);
  }

  return section;
}

export function createSearchModal({ onSearch, onPageChange, onClose, searchResults, searchQuery, searchContext, searchHistory, workTagsCache: initialWorkTagsCache, pinnedTags: initialPinnedTags, onTogglePinTag }: SearchModalProps): SearchModalComponent {
  let currentWorkTagsCache: Record<string, Tag[]> = initialWorkTagsCache ?? {};
  let currentPinnedTags: string[] = initialPinnedTags ?? [];
  let currentSearchResults: SearchResultsState | null = searchResults;
  let selectedTagTexts: Set<string> = new Set();
  let showAllTags = false;

  const displayValue = (searchContext?.type === 'keyword') ? (searchQuery || '') : '';

  const input = createElement('input', {
    className: 'comic-helper-search-input',
    attributes: {
      type: 'text',
      placeholder: t('ui.searchPlaceholder'),
      autofocus: 'true',
      value: displayValue
    }
  }) as HTMLInputElement;

  const submitBtn = createElement('button', {
    className: 'comic-helper-search-submit',
    textContent: t('ui.search'),
    attributes: {
      type: 'submit'
    }
  });

  const handleSubmit = () => {
    const query = input.value.trim();
    if (query) onSearch(query);
  };

  const form = createElement('form', {
    className: 'comic-helper-search-form',
    events: {
      submit: (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleSubmit();
      }
    }
  }, [input, submitBtn]);

  const historySection = createElement('div', {
    className: 'comic-helper-search-history'
  });

  if (searchHistory.length > 0) {
    historySection.appendChild(createElement('span', {
      className: 'comic-helper-search-history-label',
      textContent: `${t('ui.searchHistory')}:`
    }));

    searchHistory.forEach(historyItem => {
      const btn = createElement('button', {
        className: 'comic-helper-search-history-item',
        textContent: historyItem,
        events: {
          click: (e) => {
            e.preventDefault();
            input.value = historyItem;
            onSearch(historyItem);
          }
        }
      });
      historySection.appendChild(btn);
    });
  }

  const onTagCompletion = (label: string) => {
    input.value = label + ' ';
    input.focus();
  };

  function getEnrichedResults(): RelatedWork[] {
    if (!currentSearchResults) return [];
    const asWorks: RelatedWork[] = currentSearchResults.results.map(r => ({ title: r.title, href: r.href, thumb: r.thumb }));
    return enrichWorksWithCachedTags(asWorks, currentWorkTagsCache);
  }

  function makeSearchTrendSection(): HTMLElement {
    return createTrendSection({
      works: getEnrichedResults(),
      selectedTagTexts,
      pinnedTags: currentPinnedTags,
      onTagClick: (tagText: string) => {
        if (selectedTagTexts.has(tagText)) {
          selectedTagTexts.delete(tagText);
        } else {
          selectedTagTexts.add(tagText);
        }
        rerenderSearchTrend();
      },
      onTogglePinTag,
      showAllTags,
      onToggleShowAll: () => {
        showAllTags = !showAllTags;
        rerenderSearchTrend();
      }
    });
  }

  function getFilteredResults(): RelatedWork[] | undefined {
    if (selectedTagTexts.size === 0) return undefined;
    return filterWorksByTags(getEnrichedResults(), selectedTagTexts);
  }

  function rerenderSearchTrend(): void {
    const newTrend = makeSearchTrendSection();
    container.replaceChild(newTrend, searchTrendSection);
    searchTrendSection = newTrend;

    const newSection = createResultsSection(currentSearchResults, onPageChange, onTagCompletion, getFilteredResults());
    container.replaceChild(newSection, resultsSection);
    resultsSection = newSection;
  }

  let searchTrendSection = makeSearchTrendSection();
  let resultsSection = createResultsSection(searchResults, onPageChange, onTagCompletion);
  const container = createElement('div', {
    className: 'comic-helper-search-container'
  }, [form, historySection, searchTrendSection, resultsSection]);

  const closeBtn = createElement('button', {
    className: 'comic-helper-modal-close',
    textContent: '×',
    title: t('ui.close'),
    events: {
      click: (e) => {
        e.preventDefault();
        onClose();
      }
    }
  });

  const title = createElement('h2', {
    className: 'comic-helper-modal-title',
    textContent: t('ui.search')
  });

  const updatingIndicator = createElement('span', {
    className: 'comic-helper-search-updating',
    textContent: '...',
    style: { display: 'none' }
  });
  title.appendChild(updatingIndicator);

  const spinner = createElement('div', { className: 'comic-helper-spinner' });
  const spinnerOverlay = createElement('div', {
    className: 'comic-helper-search-spinner-overlay'
  }, [spinner]);

  const content = createElement('div', {
    className: 'comic-helper-modal-content',
    events: {
      click: (e) => e.stopPropagation()
    }
  }, [closeBtn, title, container, spinnerOverlay]);
  content.addEventListener('click', (e) => e.stopPropagation());
  content.addEventListener('wheel', (e) => e.stopPropagation(), { passive: true });

  const overlay = createElement('div', {
    className: 'comic-helper-modal-overlay',
    events: {
      click: onClose
    }
  }, [content]);
  overlay.addEventListener('wheel', (e) => { e.preventDefault(); e.stopPropagation(); }, { passive: false });

  // Autofocus doesn't always work when dynamically added
  setTimeout(() => input.focus(), 50);

  // Anti-flicker logic state
  let loadingTimeout: number | null = null;
  let loadingStartTime: number = 0;
  const SHOW_DELAY_MS = 200;
  const MIN_SHOW_TIME_MS = 400;

  return {
    el: overlay,
    input,
    updateResults: (newResults: SearchResultsState | null) => {
      currentSearchResults = newResults;
      selectedTagTexts = new Set();
      showAllTags = false;
      const newTrend = makeSearchTrendSection();
      container.replaceChild(newTrend, searchTrendSection);
      searchTrendSection = newTrend;
      const newSection = createResultsSection(newResults, onPageChange, onTagCompletion);
      container.replaceChild(newSection, resultsSection);
      resultsSection = newSection;
      content.scrollTop = 0;
    },
    updateWorkTagsCache: (cache: Record<string, Tag[]>) => {
      currentWorkTagsCache = cache;
      rerenderSearchTrend();
    },
    updatePinnedTags: (newPinnedTags: string[]) => {
      currentPinnedTags = newPinnedTags;
      rerenderSearchTrend();
    },
    setUpdating: (updating: boolean) => {
      updatingIndicator.style.display = updating ? 'inline' : 'none';

      // Always clear any pending timeout when state changes
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        loadingTimeout = null;
      }

      if (updating) {
        // Disable inputs immediately to prevent double submission
        input.disabled = true;
        submitBtn.disabled = true;

        // Delay showing the spinner to avoid flickering for fast searches
        loadingTimeout = window.setTimeout(() => {
          spinnerOverlay.classList.add('visible');
          loadingStartTime = Date.now();
          loadingTimeout = null;
        }, SHOW_DELAY_MS);
      } else {
        const hide = () => {
          spinnerOverlay.classList.remove('visible');
          input.disabled = false;
          submitBtn.disabled = false;
        };

        const shownDuration = Date.now() - loadingStartTime;
        if (loadingStartTime > 0 && shownDuration < MIN_SHOW_TIME_MS) {
          // Ensure it stays visible for a minimum duration if it was already shown
          window.setTimeout(hide, MIN_SHOW_TIME_MS - shownDuration);
        } else {
          hide();
        }
        loadingStartTime = 0;
      }
    }
  };
}
