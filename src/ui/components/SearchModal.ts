import { createElement } from '../utils';
import { t } from '../../i18n';
import { SearchResultsState } from '../../types';

export interface SearchModalProps {
  onSearch: (query: string) => void;
  onPageChange: (url: string) => void;
  onClose: () => void;
  searchResults: SearchResultsState | null;
  searchQuery?: string;
}

export interface SearchModalComponent {
  el: HTMLElement;
  input: HTMLInputElement;
  updateResults: (searchResults: SearchResultsState | null) => void;
  setUpdating: (updating: boolean) => void;
}

function createResultsSection(searchResults: SearchResultsState | null, onPageChange: (url: string) => void): HTMLElement {
  const section = createElement('div', {
    className: 'comic-helper-search-results-section'
  });

  if (!searchResults) return section;

  const { results, totalCount, pagination } = searchResults;

  const header = createElement('div', {
    className: 'comic-helper-section-title'
  });
  header.textContent = totalCount
    ? `${t('ui.searchResults')} ${totalCount}`
    : t('ui.searchResults');
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

export function createSearchModal({ onSearch, onPageChange, onClose, searchResults, searchQuery }: SearchModalProps): SearchModalComponent {
  const input = createElement('input', {
    className: 'comic-helper-search-input',
    attributes: {
      type: 'text',
      placeholder: t('ui.searchPlaceholder'),
      autofocus: 'true',
      value: searchQuery || ''
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
        handleSubmit();
      }
    }
  }, [input, submitBtn]);

  let resultsSection = createResultsSection(searchResults, onPageChange);

  const container = createElement('div', {
    className: 'comic-helper-search-container'
  }, [form, resultsSection]);

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

  const content = createElement('div', {
    className: 'comic-helper-modal-content',
    events: {
      click: (e) => e.stopPropagation()
    }
  }, [closeBtn, title, container]);
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

  return {
    el: overlay,
    input,
    updateResults: (newResults: SearchResultsState | null) => {
      const newSection = createResultsSection(newResults, onPageChange);
      container.replaceChild(newSection, resultsSection);
      resultsSection = newSection;
      content.scrollTop = 0;
    },
    setUpdating: (updating: boolean) => {
      updatingIndicator.style.display = updating ? 'inline' : 'none';
    }
  };
}
