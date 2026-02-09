import { createElement } from '../utils';
import { t } from '../../i18n';
import { HistoryRecord } from '../../managers/HistoryManager';

export interface HistoryTabProps {
  history: HistoryRecord[];
  onDelete: (url: string) => void;
  onClear: () => void;
}

export function createHistoryTab({ history, onDelete, onClear }: HistoryTabProps): HTMLElement {
  const container = createElement('div', {
    className: 'comic-helper-tab-content comic-helper-search-container'
  });

  if (history.length === 0) {
    container.appendChild(createElement('div', {
      className: 'comic-helper-search-no-results',
      textContent: t('ui.noHistory')
    }));
    return container;
  }

  const clearBtn = createElement('button', {
    className: 'comic-helper-button',
    textContent: t('ui.clearHistory'),
    style: { marginBottom: '12px' },
    events: { click: onClear }
  });
  container.appendChild(clearBtn);

  const grid = createElement('div', {
    className: 'comic-helper-search-result-grid'
  });

  history.forEach(item => {
    const thumb = createElement('img', {
      className: 'comic-helper-search-result-thumb',
      attributes: { src: item.thumb, loading: 'lazy' }
    });
    const title = createElement('div', {
      className: 'comic-helper-search-result-title',
      textContent: item.title
    });
    
    const date = new Date(item.lastViewedAt).toLocaleDateString();
    const dateEl = createElement('div', {
      className: 'comic-helper-history-date',
      textContent: date,
      style: { fontSize: '10px', opacity: '0.7' }
    });

    const deleteBtn = createElement('button', {
      className: 'comic-helper-history-delete',
      textContent: '×',
      title: t('ui.close'),
      style: { position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
      events: {
        click: (e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(item.url);
        }
      }
    });

    const link = createElement('a', {
      className: 'comic-helper-search-result-item',
      attributes: { href: item.url, target: '_blank' },
      style: { position: 'relative' },
      events: { click: (e) => e.stopPropagation() }
    }, [thumb, title, dateEl, deleteBtn]);
    grid.appendChild(link);
  });

  container.appendChild(grid);
  return container;
}
