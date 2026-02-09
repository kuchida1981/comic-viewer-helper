import { createElement } from '../utils';
import { t } from '../../i18n';
import { SearchResultsState, SearchContext } from '../../types';

export interface SearchTabProps {
  onSearch: (query: string, context?: SearchContext) => void;
  onPageChange: (url: string) => void;
  searchResults: SearchResultsState | null;
  searchQuery?: string;
  searchContext?: SearchContext;
  searchHistory: string[];
}

export interface SearchTabComponent {
  el: HTMLElement;
  input: HTMLInputElement;
  updateResults: (searchResults: SearchResultsState | null) => void;
}

function createResultsSection(searchResults: SearchResultsState | null, onPageChange: (url: string) => void): HTMLElement {
  const section = createElement('div', {
    className: 'comic-helper-search-results-section'
  });

  if (!searchResults) return section;

  const { results, totalCount, pagination, searchContext } = searchResults;

  const header = createElement('div', {
    className: 'comic-helper-section-title'
  });

  let titleText = t('ui.searchResults');
  if (searchContext && searchContext.label) {
    const prefix = searchContext.type.charAt(0).toUpperCase() + searchContext.type.slice(1);
    titleText = `${prefix}: ${searchContext.label}`;
  }

  header.textContent = totalCount
    ? `${titleText} (${totalCount})`
    : titleText;
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

  results.forEach(item => {
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

  if (pagination && pagination.length > 0) {
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

export function createSearchTab({ onSearch, onPageChange, searchResults, searchQuery, searchContext, searchHistory }: SearchTabProps): SearchTabComponent {
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
        className: `comic-helper-search-history-item`,
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

  let resultsSection = createResultsSection(searchResults, onPageChange);
  const el = createElement('div', {
    className: 'comic-helper-tab-content active'
  }, [form, historySection, resultsSection]);

  return {
    el,
    input,
    updateResults: (newResults: SearchResultsState | null) => {
      const newSection = createResultsSection(newResults, onPageChange);
      el.replaceChild(newSection, resultsSection);
      resultsSection = newSection;
    }
  };
}
