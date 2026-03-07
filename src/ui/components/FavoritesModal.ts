import { createElement } from '../utils';
import { t } from '../../i18n';
import { RelatedWork, Tag } from '../../types';

export interface FavoritesModalProps {
  favorites: RelatedWork[];
  onRemove: (href: string) => void;
  onClose: () => void;
  onTagClick?: (tag: Tag) => void;
}

export interface FavoritesModalComponent {
  el: HTMLElement;
  updateFavorites: (favorites: RelatedWork[]) => void;
}

export function calculateTrends(favorites: RelatedWork[]): Array<{ tag: Tag; count: number }> {
  const map = new Map<string, { tag: Tag; count: number }>();
  for (const fav of favorites) {
    for (const tag of (fav.tags ?? [])) {
      const entry = map.get(tag.text);
      if (entry) {
        entry.count++;
      } else {
        map.set(tag.text, { tag, count: 1 });
      }
    }
  }
  return Array.from(map.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function createGrid(favorites: RelatedWork[], onRemove: (href: string) => void): HTMLElement {
  const grid = createElement('div', {
    className: 'comic-helper-search-result-grid'
  });

  if (favorites.length === 0) {
    grid.appendChild(createElement('div', {
      className: 'comic-helper-search-no-results',
      textContent: t('ui.favoritesEmpty')
    }));
    return grid;
  }

  favorites.forEach(item => {
    const isSafeThumb = item.thumb.startsWith('http') || item.thumb.startsWith('https') || item.thumb.startsWith('/') || item.thumb.startsWith('blob:');
    const thumb = createElement('img', {
      className: 'comic-helper-search-result-thumb',
      attributes: { src: isSafeThumb ? item.thumb : '', loading: 'lazy' }
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
    const deleteBtn = createElement('button', {
      className: 'comic-helper-favorites-delete-btn',
      textContent: '×',
      title: t('ui.close'),
      events: {
        click: (e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove(item.href);
        }
      }
    });
    const wrapper = createElement('div', {
      className: 'comic-helper-favorites-item'
    }, [link, deleteBtn]);
    grid.appendChild(wrapper);
  });

  return grid;
}

function createTrendSection(favorites: RelatedWork[], onTagClick?: (tag: Tag) => void): HTMLElement {
  const section = createElement('div', {
    className: 'comic-helper-favorites-trend-section'
  });

  const trends = calculateTrends(favorites);
  if (trends.length === 0 || !onTagClick) {
    section.style.display = 'none';
    return section;
  }

  const label = createElement('div', {
    className: 'comic-helper-favorites-trend-label',
    textContent: t('ui.favoritesTrend')
  });

  const tagsEl = createElement('div', {
    className: 'comic-helper-favorites-trend-tags'
  });

  trends.forEach(({ tag, count }) => {
    const typeClass = tag.type ? `comic-helper-tag-chip--${tag.type}` : '';
    const btn = createElement('button', {
      className: `comic-helper-tag-chip ${typeClass}`.trim(),
      textContent: `${tag.text} (${count})`,
      events: {
        click: () => onTagClick(tag)
      }
    });
    tagsEl.appendChild(btn);
  });

  section.appendChild(label);
  section.appendChild(tagsEl);
  return section;
}

export function createFavoritesModal({ favorites, onRemove, onClose, onTagClick }: FavoritesModalProps): FavoritesModalComponent {
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

  const titleEl = createElement('h2', {
    className: 'comic-helper-modal-title',
    textContent: t('ui.favoritesList')
  });

  let trendSection = createTrendSection(favorites, onTagClick);
  let grid = createGrid(favorites, onRemove);

  const container = createElement('div', {
    className: 'comic-helper-search-container'
  }, [trendSection, grid]);

  const content = createElement('div', {
    className: 'comic-helper-modal-content',
    events: {
      click: (e) => e.stopPropagation()
    }
  }, [closeBtn, titleEl, container]);
  content.addEventListener('wheel', (e) => e.stopPropagation(), { passive: true });

  const overlay = createElement('div', {
    className: 'comic-helper-modal-overlay',
    events: {
      click: onClose
    }
  }, [content]);
  overlay.addEventListener('wheel', (e) => { e.preventDefault(); e.stopPropagation(); }, { passive: false });

  return {
    el: overlay,
    updateFavorites: (newFavorites: RelatedWork[]) => {
      const newTrendSection = createTrendSection(newFavorites, onTagClick);
      container.replaceChild(newTrendSection, trendSection);
      trendSection = newTrendSection;

      const newGrid = createGrid(newFavorites, onRemove);
      container.replaceChild(newGrid, grid);
      grid = newGrid;
    }
  };
}
