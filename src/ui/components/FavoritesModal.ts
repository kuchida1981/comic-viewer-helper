import { createElement } from '../utils';
import { t } from '../../i18n';
import { RelatedWork, HistoryEntry } from '../../types';
import { calculateTrends, filterWorksByTags } from '../../logic';

function normalizeHref(href: string): string {
  try {
    const u = new URL(href, window.location.origin || 'http://localhost');
    return u.origin + u.pathname;
  } catch {
    return href;
  }
}

export interface FavoritesModalProps {
  favorites: RelatedWork[];
  history: HistoryEntry[];
  onRemoveFavorite: (href: string) => void;
  onRemoveHistory: (href: string) => void;
  onToggleFavorite: (work: RelatedWork) => void;
  onClose: () => void;
}

export interface FavoritesModalComponent {
  el: HTMLElement;
  updateFavorites: (favorites: RelatedWork[]) => void;
  updateHistory: (history: HistoryEntry[], favorites: RelatedWork[]) => void;
}

type SortMode = 'lastViewedAt' | 'viewCount' | 'firstViewedAt';

function formatViewCount(count: number): string {
  return t('ui.viewCount').replace('{count}', String(count));
}

function isSafeThumbUrl(thumb: string): boolean {
  return thumb.startsWith('http') || thumb.startsWith('https') || thumb.startsWith('/') || thumb.startsWith('blob:');
}

function createGridItem(
  item: RelatedWork,
  options: {
    isFavorite: boolean;
    onToggleFavorite: (work: RelatedWork) => void;
    onRemove: (href: string) => void;
    viewCount?: number;
  }
): HTMLElement {
  const { isFavorite, onToggleFavorite, onRemove, viewCount } = options;
  const thumb = createElement('img', {
    className: 'comic-helper-search-result-thumb',
    attributes: { src: isSafeThumbUrl(item.thumb) ? item.thumb : '', loading: 'lazy' }
  });
  const title = createElement('div', {
    className: 'comic-helper-search-result-title',
    textContent: item.title
  });

  const titleWrapper = createElement('div', {}, [title]);
  if (viewCount !== undefined) {
    const countEl = createElement('div', {
      className: 'comic-helper-view-count',
      textContent: formatViewCount(viewCount)
    });
    titleWrapper.appendChild(countEl);
  }

  const link = createElement('a', {
    className: 'comic-helper-search-result-item',
    attributes: { href: item.href, target: '_blank' },
    events: { click: (e) => e.stopPropagation() }
  }, [thumb, titleWrapper]);

  const favoriteBtn = createElement('button', {
    className: `comic-helper-item-favorite-btn${isFavorite ? ' active' : ''}`,
    textContent: '♥',
    title: t('ui.favoritesTab'),
    events: {
      click: (e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggleFavorite(item);
      }
    }
  });

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
  }, [link, favoriteBtn, deleteBtn]);
  return wrapper;
}

function sortHistory(history: HistoryEntry[], sortMode: SortMode): HistoryEntry[] {
  const sorted = [...history];
  if (sortMode === 'viewCount') {
    sorted.sort((a, b) => b.viewCount - a.viewCount);
  } else if (sortMode === 'firstViewedAt') {
    sorted.sort((a, b) => a.firstViewedAt - b.firstViewedAt);
  } else {
    sorted.sort((a, b) => b.lastViewedAt - a.lastViewedAt);
  }
  return sorted;
}

function createFavoritesGrid(
  favorites: RelatedWork[],
  onRemoveFavorite: (href: string) => void,
  onToggleFavorite: (work: RelatedWork) => void
): HTMLElement {
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
    const gridItem = createGridItem(item, {
      isFavorite: true,
      onToggleFavorite,
      onRemove: onRemoveFavorite
    });
    grid.appendChild(gridItem);
  });

  return grid;
}

function createHistoryGrid(
  history: HistoryEntry[],
  favorites: RelatedWork[],
  sortMode: SortMode,
  onRemoveHistory: (href: string) => void,
  onToggleFavorite: (work: RelatedWork) => void
): HTMLElement {
  const grid = createElement('div', {
    className: 'comic-helper-search-result-grid'
  });

  if (history.length === 0) {
    grid.appendChild(createElement('div', {
      className: 'comic-helper-search-no-results',
      textContent: t('ui.historyEmpty')
    }));
    return grid;
  }

  const sorted = sortHistory(history, sortMode);
  const favoriteUrls = new Set(favorites.map(f => normalizeHref(f.href)));

  sorted.forEach(item => {
    const isFav = favoriteUrls.has(normalizeHref(item.href));
    const gridItem = createGridItem(item, {
      isFavorite: isFav,
      onToggleFavorite,
      onRemove: onRemoveHistory,
      viewCount: item.viewCount
    });
    grid.appendChild(gridItem);
  });

  return grid;
}

function createSortMenu(
  currentSort: SortMode,
  onSort: (mode: SortMode) => void
): HTMLElement {
  const menu = createElement('div', { className: 'comic-helper-sort-menu' });
  const sorts: { mode: SortMode; label: string }[] = [
    { mode: 'lastViewedAt', label: t('ui.sortByLastViewed') },
    { mode: 'viewCount', label: t('ui.sortByViewCount') },
    { mode: 'firstViewedAt', label: t('ui.sortByFirstViewed') }
  ];
  sorts.forEach(({ mode, label }) => {
    const btn = createElement('button', {
      className: `comic-helper-sort-btn${currentSort === mode ? ' active' : ''}`,
      textContent: label,
      events: { click: () => onSort(mode) }
    });
    menu.appendChild(btn);
  });
  return menu;
}

function createTrendSection(
  favorites: RelatedWork[],
  selectedTagTexts: Set<string>,
  onInternalTagClick: (tagText: string) => void
): HTMLElement {
  const section = createElement('div', {
    className: 'comic-helper-favorites-trend-section'
  });

  const trends = calculateTrends(favorites);
  if (trends.length === 0) {
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
    const activeClass = selectedTagTexts.has(tag.text) ? ' active' : '';
    const btn = createElement('button', {
      className: `comic-helper-tag-chip ${typeClass}${activeClass}`.trim(),
      textContent: `${tag.text} (${count})`,
      events: {
        click: () => onInternalTagClick(tag.text)
      }
    });
    tagsEl.appendChild(btn);
  });

  section.appendChild(label);
  section.appendChild(tagsEl);
  return section;
}

export function createFavoritesModal({ favorites, history, onRemoveFavorite, onRemoveHistory, onToggleFavorite, onClose }: FavoritesModalProps): FavoritesModalComponent {
  let sortMode: SortMode = 'lastViewedAt';
  let currentFavorites = favorites;
  let currentHistory = history;
  let selectedTagTexts: Set<string> = new Set();

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

  // Tabs
  const favTab = createElement('button', {
    className: 'comic-helper-library-tab active',
    textContent: t('ui.favoritesTab'),
    events: { click: () => switchTab('favorites') }
  });
  const histTab = createElement('button', {
    className: 'comic-helper-library-tab',
    textContent: t('ui.historyTab'),
    events: { click: () => switchTab('history') }
  });
  const tabs = createElement('div', { className: 'comic-helper-library-tabs' }, [favTab, histTab]);

  function handleTrendTagClick(tagText: string): void {
    if (selectedTagTexts.has(tagText)) {
      selectedTagTexts.delete(tagText);
    } else {
      selectedTagTexts.add(tagText);
    }
    rerenderFavoritesPanel();
  }

  function rerenderFavoritesPanel(): void {
    const newTrendSection = createTrendSection(currentFavorites, selectedTagTexts, handleTrendTagClick);
    favPanel.replaceChild(newTrendSection, trendSection);
    trendSection = newTrendSection;

    const filtered = filterWorksByTags(currentFavorites, selectedTagTexts);
    const newFavGrid = createFavoritesGrid(filtered, onRemoveFavorite, onToggleFavorite);
    favPanel.replaceChild(newFavGrid, favGrid);
    favGrid = newFavGrid;
  }

  // Content area
  let trendSection = createTrendSection(currentFavorites, selectedTagTexts, handleTrendTagClick);
  let favGrid = createFavoritesGrid(filterWorksByTags(currentFavorites, selectedTagTexts), onRemoveFavorite, onToggleFavorite);
  const favPanel = createElement('div', { className: 'comic-helper-favorites-panel' }, [trendSection, favGrid]);

  let sortMenu = createSortMenu(sortMode, handleSort);
  let histGrid = createHistoryGrid(currentHistory, currentFavorites, sortMode, onRemoveHistory, onToggleFavorite);
  const histPanel = createElement('div', { className: 'comic-helper-history-panel' }, [sortMenu, histGrid]);
  histPanel.style.display = 'none';

  const container = createElement('div', {
    className: 'comic-helper-search-container'
  }, [favPanel, histPanel]);

  function switchTab(tab: 'favorites' | 'history'): void {
    favTab.classList.toggle('active', tab === 'favorites');
    histTab.classList.toggle('active', tab === 'history');
    favPanel.style.display = (tab === 'favorites') ? '' : 'none';
    histPanel.style.display = (tab === 'history') ? '' : 'none';
  }

  function handleSort(mode: SortMode): void {
    sortMode = mode;
    const newSortMenu = createSortMenu(sortMode, handleSort);
    histPanel.replaceChild(newSortMenu, sortMenu);
    sortMenu = newSortMenu;

    const newHistGrid = createHistoryGrid(currentHistory, currentFavorites, sortMode, onRemoveHistory, onToggleFavorite);
    histPanel.replaceChild(newHistGrid, histGrid);
    histGrid = newHistGrid;
  }

  const content = createElement('div', {
    className: 'comic-helper-modal-content',
    events: {
      click: (e) => e.stopPropagation()
    }
  }, [closeBtn, titleEl, tabs, container]);
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
      currentFavorites = newFavorites;
      selectedTagTexts = new Set();
      rerenderFavoritesPanel();

      // Also refresh history grid to update favorite icons
      const newHistGrid = createHistoryGrid(currentHistory, currentFavorites, sortMode, onRemoveHistory, onToggleFavorite);
      histPanel.replaceChild(newHistGrid, histGrid);
      histGrid = newHistGrid;
    },
    updateHistory: (newHistory: HistoryEntry[], newFavorites: RelatedWork[]) => {
      currentHistory = newHistory;
      currentFavorites = newFavorites;

      const newHistGrid = createHistoryGrid(currentHistory, currentFavorites, sortMode, onRemoveHistory, onToggleFavorite);
      histPanel.replaceChild(newHistGrid, histGrid);
      histGrid = newHistGrid;
    }
  };
}
