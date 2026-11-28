import { createElement } from '../utils';
import { t } from '../../i18n';
import { RelatedWork, HistoryEntry, TagGraphViewFactory } from '../../types';
import { calculateTrends, calculateTagCloudLevel, filterWorksByTags, getTagTypes, toggleTagTypeFilter, arrangeTagCloud } from '../../logic';
import { createPinFilledIcon } from '../icons';

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
  pinnedTags: string[];
  onRemoveFavorite: (href: string) => void;
  onRemoveHistory: (href: string) => void;
  onToggleFavorite: (work: RelatedWork) => void;
  onTogglePinTag: (tagText: string) => void;
  onClose: () => void;
  createTagGraph: TagGraphViewFactory;
}

export interface FavoritesModalComponent {
  el: HTMLElement;
  updateFavorites: (favorites: RelatedWork[]) => void;
  updateHistory: (history: HistoryEntry[], favorites: RelatedWork[]) => void;
  updatePinnedTags: (pinnedTags: string[]) => void;
  /** Release running resources; call before removing the element */
  destroy: () => void;
}

type FavoritesView = 'list' | 'cloud' | 'graph';

const TAG_CLOUD_LIMIT = 200;
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

  // Stored in insertion order (oldest first); display newest first without mutating the source
  [...favorites].reverse().forEach(item => {
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
  pinnedTags: string[],
  onInternalTagClick: (tagText: string) => void,
  onTogglePinTag: (tagText: string) => void,
  showAllTags: boolean,
  onToggleShowAll: () => void
): HTMLElement {
  const section = createElement('div', {
    className: 'comic-helper-favorites-trend-section'
  });

  const trends = calculateTrends(favorites, showAllTags ? 0 : 10, pinnedTags, Array.from(selectedTagTexts));
  if (trends.length === 0) {
    section.style.display = 'none';
    return section;
  }

  const toggleBtn = createElement('button', {
    className: 'comic-helper-trend-toggle-btn',
    textContent: showAllTags ? t('ui.showTopTags') : t('ui.showAllTags'),
    events: { click: onToggleShowAll }
  });

  const labelRow = createElement('div', {
    className: 'comic-helper-favorites-trend-label-row'
  }, [
    createElement('div', {
      className: 'comic-helper-favorites-trend-label',
      textContent: t('ui.favoritesTrend')
    }),
    toggleBtn
  ]);

  const tagsEl = createElement('div', {
    className: 'comic-helper-favorites-trend-tags'
  });

  trends.forEach(({ tag, count, isPinned }) => {
    const typeClass = tag.type ? `comic-helper-tag-chip--${tag.type}` : '';
    const activeClass = selectedTagTexts.has(tag.text) ? ' active' : '';
    const chip = createElement('button', {
      className: `comic-helper-tag-chip${activeClass}`,
      textContent: `${tag.text} (${count})`,
      events: {
        click: () => onInternalTagClick(tag.text)
      }
    });

    const pinBtn = createElement('button', {
      className: `comic-helper-tag-pin${isPinned ? ' active' : ''}`,
      title: isPinned ? t('ui.unpinTag') : t('ui.pinTag'),
      events: {
        click: (e) => {
          e.stopPropagation();
          onTogglePinTag(tag.text);
        }
      }
    });
    pinBtn.appendChild(createPinFilledIcon());

    const container = createElement('div', {
      className: `comic-helper-tag-chip-container${typeClass ? ` ${typeClass}` : ''}`
    }, [chip, pinBtn]);
    tagsEl.appendChild(container);
  });

  section.appendChild(labelRow);
  section.appendChild(tagsEl);
  return section;
}

function createTagTypeChips(
  types: Array<string | null>,
  excludedTypes: ReadonlySet<string | null>,
  onToggleType: (type: string | null) => void,
  onResetTypes: () => void
): HTMLElement {
  const row = createElement('div', { className: 'comic-helper-tag-type-filter' });
  types.forEach(type => {
    const typeClass = type ? ` comic-helper-tag-chip--${type}` : '';
    const disabledClass = excludedTypes.has(type) ? ' disabled' : '';
    row.appendChild(createElement('button', {
      className: `comic-helper-tag-chip comic-helper-tag-type-chip${typeClass}${disabledClass}`,
      textContent: type ?? t('ui.tagTypeOther'),
      events: { click: () => onToggleType(type) }
    }));
  });
  const resetBtn = createElement('button', {
    className: 'comic-helper-tag-type-reset',
    textContent: t('ui.tagTypeReset'),
    events: { click: () => onResetTypes() }
  }) as HTMLButtonElement;
  resetBtn.disabled = excludedTypes.size === 0;
  row.appendChild(resetBtn);
  return row;
}

function createTagCloudSection(
  favorites: RelatedWork[],
  onTagClick: (tagText: string) => void,
  excludedTypes: ReadonlySet<string | null>,
  onToggleType: (type: string | null) => void,
  onResetTypes: () => void
): HTMLElement {
  const section = createElement('div', { className: 'comic-helper-tag-cloud' });
  const types = getTagTypes(favorites);
  if (types.length >= 2) {
    section.appendChild(createTagTypeChips(types, excludedTypes, onToggleType, onResetTypes));
  }

  const trends = calculateTrends(favorites, TAG_CLOUD_LIMIT, [], [], excludedTypes);
  if (trends.length === 0) {
    section.appendChild(createElement('div', {
      className: 'comic-helper-search-no-results',
      textContent: t('ui.tagCloudEmpty')
    }));
    return section;
  }

  const counts = trends.map(({ count }) => count);
  const min = Math.min(...counts);
  const max = Math.max(...counts);
  const arranged = arrangeTagCloud(trends);

  arranged.forEach(({ tag, count }) => {
    const level = calculateTagCloudLevel(count, min, max);
    section.appendChild(createElement('button', {
      className: `comic-helper-tag-cloud-item comic-helper-tag-cloud-item--level-${level}`,
      textContent: tag.text,
      title: `${tag.text} (${count})`,
      events: { click: () => onTagClick(tag.text) }
    }));
  });
  return section;
}

export function createFavoritesModal({ favorites, history, pinnedTags, onRemoveFavorite, onRemoveHistory, onToggleFavorite, onTogglePinTag, onClose, createTagGraph }: FavoritesModalProps): FavoritesModalComponent {
  let sortMode: SortMode = 'lastViewedAt';
  let currentFavorites = favorites;
  let currentHistory = history;
  let currentPinnedTags = pinnedTags;
  let selectedTagTexts: Set<string> = new Set();
  let showAllTags: boolean = false;
  let excludedTypes: Set<string | null> = new Set();
  let favoritesView: FavoritesView = 'list';
  let graphExcludedTypes: Set<string | null> = new Set();

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

  function handleToggleShowAll(): void {
    showAllTags = !showAllTags;
    const newTrendSection = createTrendSection(currentFavorites, selectedTagTexts, currentPinnedTags, handleTrendTagClick, onTogglePinTag, showAllTags, handleToggleShowAll);
    listView.replaceChild(newTrendSection, trendSection);
    trendSection = newTrendSection;
  }

  function rerenderCloudView(): void {
    const newCloud = createTagCloudSection(currentFavorites, handleCloudTagClick, excludedTypes, handleToggleType, handleResetTypes);
    cloudView.replaceWith(newCloud);
    cloudView = newCloud;
    cloudView.style.display = favoritesView === 'cloud' ? '' : 'none';
  }

  function handleToggleType(type: string | null): void {
    excludedTypes = toggleTagTypeFilter(excludedTypes, getTagTypes(currentFavorites), type);
    rerenderCloudView();
  }

  function handleResetTypes(): void {
    excludedTypes = new Set();
    rerenderCloudView();
  }

  function handleCloudTagClick(tagText: string): void {
    selectedTagTexts.add(tagText);
    setFavoritesView('list');
  }

  function handleToggleGraphType(type: string | null): void {
    graphExcludedTypes = toggleTagTypeFilter(graphExcludedTypes, getTagTypes(currentFavorites), type);
    rerenderGraphView();
  }

  function handleResetGraphTypes(): void {
    graphExcludedTypes = new Set();
    rerenderGraphView();
  }

  function rerenderGraphView(): void {
    const types = getTagTypes(currentFavorites);
    const hasChips = types.length >= 2;
    // Forget types that no longer exist
    graphExcludedTypes = new Set(types.filter(type => graphExcludedTypes.has(type)));
    // Drop the filter if it cannot be undone (no chips) or would hide every type
    if (!hasChips || graphExcludedTypes.size === types.length) graphExcludedTypes = new Set();
    graphTypeFilter.replaceChildren(...(hasChips
      ? [createTagTypeChips(types, graphExcludedTypes, handleToggleGraphType, handleResetGraphTypes)]
      : []));
    tagGraph.update(currentFavorites, graphExcludedTypes);
  }

  function setFavoritesView(view: FavoritesView): void {
    favoritesView = view;
    listViewBtn.classList.toggle('active', view === 'list');
    cloudViewBtn.classList.toggle('active', view === 'cloud');
    listView.style.display = view === 'list' ? '' : 'none';
    cloudView.style.display = view === 'cloud' ? '' : 'none';
    graphViewBtn.classList.toggle('active', view === 'graph');
    graphView.style.display = view === 'graph' ? '' : 'none';
    rerenderFavoritesPanel();
    tagGraph.setActive(view === 'graph');
  }

  function rerenderFavoritesPanel(): void {
    rerenderCloudView();
    rerenderGraphView();

    const newTrendSection = createTrendSection(currentFavorites, selectedTagTexts, currentPinnedTags, handleTrendTagClick, onTogglePinTag, showAllTags, handleToggleShowAll);
    listView.replaceChild(newTrendSection, trendSection);
    trendSection = newTrendSection;

    const filtered = filterWorksByTags(currentFavorites, selectedTagTexts);
    const newFavGrid = createFavoritesGrid(filtered, onRemoveFavorite, onToggleFavorite);
    listView.replaceChild(newFavGrid, favGrid);
    favGrid = newFavGrid;
  }

  // Content area
  let trendSection = createTrendSection(currentFavorites, selectedTagTexts, currentPinnedTags, handleTrendTagClick, onTogglePinTag, showAllTags, handleToggleShowAll);
  let favGrid = createFavoritesGrid(filterWorksByTags(currentFavorites, selectedTagTexts), onRemoveFavorite, onToggleFavorite);
  const listView = createElement('div', { className: 'comic-helper-favorites-list-view' }, [trendSection, favGrid]);
  let cloudView = createTagCloudSection(currentFavorites, handleCloudTagClick, excludedTypes, handleToggleType, handleResetTypes);
  cloudView.style.display = 'none';
  const listViewBtn = createElement('button', {
    className: 'comic-helper-favorites-view-btn active',
    textContent: t('ui.favoritesViewList'),
    events: { click: () => setFavoritesView('list') }
  });
  const cloudViewBtn = createElement('button', {
    className: 'comic-helper-favorites-view-btn',
    textContent: t('ui.favoritesViewCloud'),
    events: { click: () => setFavoritesView('cloud') }
  });
  const graphViewBtn = createElement('button', {
    className: 'comic-helper-favorites-view-btn',
    textContent: t('ui.favoritesViewGraph'),
    events: { click: () => setFavoritesView('graph') }
  });
  const tagGraph = createTagGraph({ onSelectTag: handleCloudTagClick });
  const graphTypeFilter = createElement('div');
  const graphView = createElement('div', { className: 'comic-helper-tag-graph-view' }, [graphTypeFilter, tagGraph.el]);
  graphView.style.display = 'none';
  rerenderGraphView();
  const viewSwitch = createElement('div', { className: 'comic-helper-favorites-view-switch' }, [listViewBtn, cloudViewBtn, graphViewBtn]);
  const favPanel = createElement('div', { className: 'comic-helper-favorites-panel' }, [viewSwitch, listView, cloudView, graphView]);

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
    tagGraph.setActive(tab === 'favorites' && favoritesView === 'graph');
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

  // A drag that starts inside the modal and ends outside fires `click` on the overlay
  let pressedInside = false;
  const overlay = createElement('div', {
    className: 'comic-helper-modal-overlay',
    events: {
      click: () => {
        if (!pressedInside) onClose();
      }
    }
  }, [content]);
  // Capture phase, so that handlers stopping propagation inside the modal do not hide the press
  overlay.addEventListener('pointerdown', (e) => { pressedInside = e.target !== overlay; }, true);
  overlay.addEventListener('wheel', (e) => { e.preventDefault(); e.stopPropagation(); }, { passive: false });

  return {
    el: overlay,
    destroy: () => tagGraph.destroy(),
    updateFavorites: (newFavorites: RelatedWork[]) => {
      currentFavorites = newFavorites;
      selectedTagTexts = new Set();
      showAllTags = false;
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
    },
    updatePinnedTags: (newPinnedTags: string[]) => {
      currentPinnedTags = newPinnedTags;
      const newTrendSection = createTrendSection(currentFavorites, selectedTagTexts, currentPinnedTags, handleTrendTagClick, onTogglePinTag, showAllTags, handleToggleShowAll);
      listView.replaceChild(newTrendSection, trendSection);
      trendSection = newTrendSection;
    }
  };
}
