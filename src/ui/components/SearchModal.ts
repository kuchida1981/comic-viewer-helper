import { createElement } from '../utils';
import { t } from '../../i18n';
import { SearchResultsState } from '../../types';

export interface SearchModalProps {
  onSearch: (query: string) => void;
  onClose: () => void;
  searchResults: SearchResultsState | null;
}

export interface SearchModalComponent {
  el: HTMLElement;
  input: HTMLInputElement;
  updateResults: (searchResults: SearchResultsState | null) => void;
}

function createResultsSection(searchResults: SearchResultsState | null): HTMLElement {
  const section = createElement('div', {
    className: 'comic-helper-search-results-section'
  });

  if (!searchResults) return section;

  const { results, totalCount, nextPageUrl } = searchResults;

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

  if (nextPageUrl) {
    section.appendChild(createElement('a', {
      className: 'comic-helper-search-more-link',
      textContent: t('ui.searchMoreLink'),
      attributes: { href: nextPageUrl, target: '_blank' },
      events: { click: (e) => e.stopPropagation() }
    }));
  }

  return section;
}

export function createSearchModal({ onSearch, onClose, searchResults }: SearchModalProps): SearchModalComponent {
  const input = createElement('input', {
    className: 'comic-helper-search-input',
    attributes: {
      type: 'text',
      placeholder: t('ui.searchPlaceholder'),
      autofocus: 'true'
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

  let resultsSection = createResultsSection(searchResults);

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

  const content = createElement('div', {
    className: 'comic-helper-modal-content',
    events: {
      click: (e) => e.stopPropagation()
    }
  }, [closeBtn, title, container]);

  const overlay = createElement('div', {
    className: 'comic-helper-modal-overlay',
    events: {
      click: onClose
    }
  }, [content]);

  // Autofocus doesn't always work when dynamically added
  setTimeout(() => input.focus(), 50);

  return {
    el: overlay,
    input,
    updateResults: (newResults: SearchResultsState | null) => {
      const newSection = createResultsSection(newResults);
      container.replaceChild(newSection, resultsSection);
      resultsSection = newSection;
    }
  };
}
