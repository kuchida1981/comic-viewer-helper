import { describe, it, expect, vi } from 'vitest';
import { createFavoritesModal } from './FavoritesModal';
import { calculateTrends } from '../../logic';
import { t } from '../../i18n';
import { RelatedWork, HistoryEntry } from '../../types';

const sampleFavorites: RelatedWork[] = [
  { title: 'Work A', href: '/work/1/', thumb: '/thumb/1.webp' },
  { title: 'Work B', href: '/work/2/', thumb: '/thumb/2.webp' }
];

const taggedFavorites: RelatedWork[] = [
  {
    title: 'Work A', href: '/work/1/', thumb: '/thumb/1.webp',
    tags: [
      { text: 'fantasy', href: '/tags/fantasy', type: 'genre' },
      { text: 'alice', href: '/artists/alice', type: 'artist' }
    ]
  },
  {
    title: 'Work B', href: '/work/2/', thumb: '/thumb/2.webp',
    tags: [
      { text: 'fantasy', href: '/tags/fantasy', type: 'genre' },
      { text: 'bob', href: '/artists/bob', type: 'artist' }
    ]
  },
  {
    title: 'Work C', href: '/work/3/', thumb: '/thumb/3.webp'
    // no tags - tests backward compatibility
  }
];

const sampleHistory: HistoryEntry[] = [
  { title: 'History A', href: '/work/10/', thumb: '/thumb/10.webp', viewCount: 5, firstViewedAt: 1000, lastViewedAt: 5000 },
  { title: 'History B', href: '/work/11/', thumb: '/thumb/11.webp', viewCount: 2, firstViewedAt: 2000, lastViewedAt: 3000 }
];

const defaultProps = {
  favorites: sampleFavorites,
  history: sampleHistory,
  pinnedTags: [],
  onRemoveFavorite: () => {},
  onRemoveHistory: () => {},
  onToggleFavorite: () => {},
  onTogglePinTag: () => {},
  onClose: () => {}
};

describe('calculateTrends', () => {
  it('should count tag occurrences across favorites', () => {
    const trends = calculateTrends(taggedFavorites);
    const fantasy = trends.find(t => t.tag.text === 'fantasy');
    expect(fantasy?.count).toBe(2);
  });

  it('should sort by count descending', () => {
    const trends = calculateTrends(taggedFavorites);
    expect(trends[0].tag.text).toBe('fantasy');
  });

  it('should return at most 10 items', () => {
    const manyTagFavorites: RelatedWork[] = [
      {
        title: 'Work', href: '/work/1/', thumb: '',
        tags: Array.from({ length: 15 }, (_, i) => ({ text: `tag${i}`, href: `/tags/tag${i}`, type: null }))
      }
    ];
    const trends = calculateTrends(manyTagFavorites);
    expect(trends.length).toBeLessThanOrEqual(10);
  });

  it('should handle favorites with no tags (backward compatibility)', () => {
    const trends = calculateTrends(sampleFavorites);
    expect(trends).toHaveLength(0);
  });

  it('should handle mixed favorites with and without tags', () => {
    const trends = calculateTrends(taggedFavorites);
    expect(trends.length).toBeGreaterThan(0);
    expect(trends.every(t => t.count > 0)).toBe(true);
  });
});

describe('FavoritesModal', () => {
  it('should render title', () => {
    const { el } = createFavoritesModal(defaultProps);
    expect(el.textContent).toContain(t('ui.favoritesList'));
  });

  it('should render tabs', () => {
    const { el } = createFavoritesModal(defaultProps);
    const tabs = el.querySelectorAll('.comic-helper-library-tab');
    expect(tabs).toHaveLength(2);
    expect(tabs[0].textContent).toContain(t('ui.favoritesTab'));
    expect(tabs[1].textContent).toContain(t('ui.historyTab'));
  });

  it('should show favorites tab by default', () => {
    const { el } = createFavoritesModal(defaultProps);
    const favTab = el.querySelector('.comic-helper-library-tab') as HTMLElement;
    expect(favTab.classList.contains('active')).toBe(true);
    const favPanel = el.querySelector('.comic-helper-favorites-panel') as HTMLElement;
    const items = favPanel.querySelectorAll('.comic-helper-search-result-item');
    expect(items).toHaveLength(2);
  });

  it('should switch to history tab when clicked', () => {
    const { el } = createFavoritesModal(defaultProps);
    const histTab = el.querySelectorAll('.comic-helper-library-tab')[1] as HTMLElement;
    histTab.click();

    const histTabBtn = el.querySelectorAll('.comic-helper-library-tab')[1];
    expect(histTabBtn.classList.contains('active')).toBe(true);

    const histPanel = el.querySelector('.comic-helper-history-panel') as HTMLElement;
    const items = histPanel.querySelectorAll('.comic-helper-search-result-item');
    expect(items).toHaveLength(2);
    expect(histPanel.textContent).toContain('History A');
  });

  it('should switch back to favorites tab from history tab', () => {
    const { el } = createFavoritesModal(defaultProps);
    const tabs = el.querySelectorAll('.comic-helper-library-tab');
    const favTabBtn = tabs[0] as HTMLElement;
    const histTabBtn = tabs[1] as HTMLElement;
    histTabBtn.click();
    expect(histTabBtn.classList.contains('active')).toBe(true);

    favTabBtn.click();
    expect(favTabBtn.classList.contains('active')).toBe(true);
    expect(histTabBtn.classList.contains('active')).toBe(false);

    const favPanel = el.querySelector('.comic-helper-favorites-panel') as HTMLElement;
    const histPanel = el.querySelector('.comic-helper-history-panel') as HTMLElement;
    expect(favPanel.style.display).not.toBe('none');
    expect(histPanel.style.display).toBe('none');
  });

  it('should show sort menu in history tab', () => {
    const { el } = createFavoritesModal(defaultProps);
    const histTab = el.querySelectorAll('.comic-helper-library-tab')[1] as HTMLElement;
    histTab.click();

    const sortMenu = el.querySelector('.comic-helper-sort-menu') as HTMLElement;
    expect(sortMenu).not.toBeNull();
    expect(sortMenu.style.display).not.toBe('none');
  });

  it('should sort history by viewCount when sort button clicked', () => {
    const { el } = createFavoritesModal(defaultProps);
    const histTab = el.querySelectorAll('.comic-helper-library-tab')[1] as HTMLElement;
    histTab.click();

    const sortBtns = el.querySelectorAll('.comic-helper-sort-btn');
    // Second button is 'viewCount'
    (sortBtns[1] as HTMLElement).click();

    const histPanel = el.querySelector('.comic-helper-history-panel') as HTMLElement;
    const items = histPanel.querySelectorAll('.comic-helper-search-result-item');
    // History A has viewCount=5, History B has viewCount=2, so A should be first
    expect(items[0].textContent).toContain('History A');
  });

  it('should sort history by firstViewedAt (oldest) when button clicked', () => {
    const { el } = createFavoritesModal(defaultProps);
    const histTab = el.querySelectorAll('.comic-helper-library-tab')[1] as HTMLElement;
    histTab.click();

    const sortBtns = el.querySelectorAll('.comic-helper-sort-btn');
    (sortBtns[2] as HTMLElement).click(); // 'firstViewedAt'

    const histPanel = el.querySelector('.comic-helper-history-panel') as HTMLElement;
    const items = histPanel.querySelectorAll('.comic-helper-search-result-item');
    // History A firstViewedAt=1000, History B firstViewedAt=2000 → A first (oldest)
    expect(items[0].textContent).toContain('History A');
  });

  it('should render favorites grid with items', () => {
    const { el } = createFavoritesModal(defaultProps);
    const favPanel = el.querySelector('.comic-helper-favorites-panel') as HTMLElement;
    const items = favPanel.querySelectorAll('.comic-helper-search-result-item');
    expect(items).toHaveLength(2);
  });

  it('should display titles and thumbnails', () => {
    const { el } = createFavoritesModal(defaultProps);
    expect(el.textContent).toContain('Work A');
    expect(el.textContent).toContain('Work B');
    const thumbs = el.querySelectorAll('.comic-helper-search-result-thumb') as NodeListOf<HTMLImageElement>;
    expect(thumbs[0].src).toContain('/thumb/1.webp');
  });

  it('should not set unsafe thumb URLs as src', () => {
    const unsafe: RelatedWork[] = [
      { title: 'Bad', href: '/work/bad/', thumb: 'javascript:alert(1)' },
      { title: 'Data', href: '/work/data/', thumb: 'data:text/html,<script>alert(1)</script>' }
    ];
    const { el } = createFavoritesModal({ ...defaultProps, favorites: unsafe });
    const thumbs = el.querySelectorAll('.comic-helper-search-result-thumb') as NodeListOf<HTMLImageElement>;
    expect(thumbs[0].getAttribute('src')).toBe('');
    expect(thumbs[1].getAttribute('src')).toBe('');
  });

  it('should show empty message when no favorites', () => {
    const { el } = createFavoritesModal({ ...defaultProps, favorites: [] });
    const favPanel = el.querySelector('.comic-helper-favorites-panel') as HTMLElement;
    expect(favPanel.textContent).toContain(t('ui.favoritesEmpty'));
    expect(favPanel.querySelector('.comic-helper-search-result-item')).toBeNull();
  });

  it('should show empty history message when history tab is active and empty', () => {
    const { el } = createFavoritesModal({ ...defaultProps, history: [] });
    const histTab = el.querySelectorAll('.comic-helper-library-tab')[1] as HTMLElement;
    histTab.click();
    expect(el.textContent).toContain(t('ui.historyEmpty'));
  });

  it('should call onClose when clicking overlay', () => {
    const onClose = vi.fn();
    const { el } = createFavoritesModal({ ...defaultProps, onClose });
    el.click();
    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose when clicking close button', () => {
    const onClose = vi.fn();
    const { el } = createFavoritesModal({ ...defaultProps, onClose });
    const closeBtn = el.querySelector('.comic-helper-modal-close') as HTMLElement;
    closeBtn.click();
    expect(onClose).toHaveBeenCalled();
  });

  it('should not close when clicking content', () => {
    const onClose = vi.fn();
    const { el } = createFavoritesModal({ ...defaultProps, onClose });
    const content = el.querySelector('.comic-helper-modal-content') as HTMLElement;
    content.click();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should call onRemoveFavorite with the correct href when delete button is clicked', () => {
    const onRemoveFavorite = vi.fn();
    const { el } = createFavoritesModal({ ...defaultProps, onRemoveFavorite });
    const deleteBtns = el.querySelectorAll('.comic-helper-favorites-delete-btn');
    (deleteBtns[0] as HTMLElement).click();
    expect(onRemoveFavorite).toHaveBeenCalledWith('/work/1/');
  });

  it('should call onRemoveHistory when delete button clicked in history tab', () => {
    const onRemoveHistory = vi.fn();
    const { el } = createFavoritesModal({ ...defaultProps, onRemoveHistory });
    const histTab = el.querySelectorAll('.comic-helper-library-tab')[1] as HTMLElement;
    histTab.click();
    const histPanel = el.querySelector('.comic-helper-history-panel') as HTMLElement;
    const deleteBtns = histPanel.querySelectorAll('.comic-helper-favorites-delete-btn');
    (deleteBtns[0] as HTMLElement).click();
    expect(onRemoveHistory).toHaveBeenCalledWith('/work/10/');
  });

  it('should call onToggleFavorite when favorite button clicked', () => {
    const onToggleFavorite = vi.fn();
    const { el } = createFavoritesModal({ ...defaultProps, onToggleFavorite });
    const favBtns = el.querySelectorAll('.comic-helper-item-favorite-btn');
    (favBtns[0] as HTMLElement).click();
    expect(onToggleFavorite).toHaveBeenCalledWith(sampleFavorites[0]);
  });

  it('should call onToggleFavorite from history tab', () => {
    const onToggleFavorite = vi.fn();
    const { el } = createFavoritesModal({ ...defaultProps, onToggleFavorite });
    const histTab = el.querySelectorAll('.comic-helper-library-tab')[1] as HTMLElement;
    histTab.click();
    const favBtns = el.querySelectorAll('.comic-helper-item-favorite-btn');
    (favBtns[0] as HTMLElement).click();
    expect(onToggleFavorite).toHaveBeenCalled();
  });

  it('should show favorite button as active in history for favorited items', () => {
    const favoritedHistory: HistoryEntry[] = [
      { title: 'History A', href: '/work/1/', thumb: '', viewCount: 1, firstViewedAt: 1000, lastViewedAt: 1000 }
    ];
    const favs: RelatedWork[] = [{ title: 'Work A', href: '/work/1/', thumb: '' }];
    const { el } = createFavoritesModal({ ...defaultProps, favorites: favs, history: favoritedHistory });
    const histTab = el.querySelectorAll('.comic-helper-library-tab')[1] as HTMLElement;
    histTab.click();
    const favBtn = el.querySelector('.comic-helper-item-favorite-btn') as HTMLElement;
    expect(favBtn.classList.contains('active')).toBe(true);
  });

  it('should not close modal when delete button is clicked', () => {
    const onClose = vi.fn();
    const { el } = createFavoritesModal({ ...defaultProps, onClose });
    const deleteBtn = el.querySelector('.comic-helper-favorites-delete-btn') as HTMLElement;
    deleteBtn.click();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should open work in new tab when tile is clicked', () => {
    const { el } = createFavoritesModal(defaultProps);
    const link = el.querySelector('.comic-helper-search-result-item') as HTMLAnchorElement;
    expect(link.href).toContain('/work/1/');
    expect(link.target).toBe('_blank');
  });

  it('should update favorites via updateFavorites()', () => {
    const { el, updateFavorites } = createFavoritesModal({ ...defaultProps, favorites: [] });
    const favPanel = el.querySelector('.comic-helper-favorites-panel') as HTMLElement;
    expect(favPanel.querySelector('.comic-helper-search-result-item')).toBeNull();
    updateFavorites(sampleFavorites);
    const items = favPanel.querySelectorAll('.comic-helper-search-result-item');
    expect(items).toHaveLength(2);
  });

  it('should show empty message after updateFavorites with empty list', () => {
    const { el, updateFavorites } = createFavoritesModal(defaultProps);
    updateFavorites([]);
    expect(el.textContent).toContain(t('ui.favoritesEmpty'));
  });

  it('should update history via updateHistory()', () => {
    const { el, updateHistory } = createFavoritesModal({ ...defaultProps, history: [] });
    const histTab = el.querySelectorAll('.comic-helper-library-tab')[1] as HTMLElement;
    histTab.click();
    const histPanel = el.querySelector('.comic-helper-history-panel') as HTMLElement;
    expect(histPanel.textContent).toContain(t('ui.historyEmpty'));

    updateHistory(sampleHistory, sampleFavorites);
    const items = histPanel.querySelectorAll('.comic-helper-search-result-item');
    expect(items).toHaveLength(2);
  });

  it('should prevent wheel event on overlay', () => {
    const { el } = createFavoritesModal(defaultProps);
    const wheelEvent = new WheelEvent('wheel', { bubbles: true, cancelable: true });
    const stopSpy = vi.spyOn(wheelEvent, 'stopPropagation');
    el.dispatchEvent(wheelEvent);
    expect(stopSpy).toHaveBeenCalled();
    expect(wheelEvent.defaultPrevented).toBe(true);
  });

  it('should stop wheel propagation on content but allow default scroll', () => {
    const { el } = createFavoritesModal(defaultProps);
    const content = el.querySelector('.comic-helper-modal-content') as HTMLElement;
    const wheelEvent = new WheelEvent('wheel', { bubbles: true, cancelable: true });
    const stopSpy = vi.spyOn(wheelEvent, 'stopPropagation');
    content.dispatchEvent(wheelEvent);
    expect(stopSpy).toHaveBeenCalled();
    expect(wheelEvent.defaultPrevented).toBe(false);
  });

  it('should render trend section when favorites have tags', () => {
    const { el } = createFavoritesModal({ ...defaultProps, favorites: taggedFavorites });
    const trendSection = el.querySelector('.comic-helper-favorites-trend-section') as HTMLElement;
    expect(trendSection).not.toBeNull();
    expect(trendSection.style.display).not.toBe('none');
    expect(el.textContent).toContain(t('ui.favoritesTrend'));
  });

  it('should hide trend section when no tags in favorites', () => {
    const { el } = createFavoritesModal(defaultProps);
    const trendSection = el.querySelector('.comic-helper-favorites-trend-section') as HTMLElement;
    expect(trendSection.style.display).toBe('none');
  });

  it('should filter favorites grid when trend tag is clicked', () => {
    const { el } = createFavoritesModal({ ...defaultProps, favorites: taggedFavorites });
    const favPanel = el.querySelector('.comic-helper-favorites-panel') as HTMLElement;
    expect(favPanel.querySelectorAll('.comic-helper-search-result-item')).toHaveLength(3);

    const tagBtn = el.querySelector('.comic-helper-favorites-trend-tags button') as HTMLElement;
    tagBtn.click();

    // After clicking 'fantasy', only works with that tag should show
    const items = favPanel.querySelectorAll('.comic-helper-search-result-item');
    expect(items).toHaveLength(2);
  });

  it('should toggle active class on trend tag when clicked', () => {
    const { el } = createFavoritesModal({ ...defaultProps, favorites: taggedFavorites });
    const tagBtn = el.querySelector('.comic-helper-favorites-trend-tags button') as HTMLElement;
    expect(tagBtn.classList.contains('active')).toBe(false);

    tagBtn.click();
    const activeBtn = el.querySelector('.comic-helper-favorites-trend-tags button') as HTMLElement;
    expect(activeBtn.classList.contains('active')).toBe(true);
  });

  it('should deselect tag and restore all favorites when active tag is clicked again', () => {
    const { el } = createFavoritesModal({ ...defaultProps, favorites: taggedFavorites });
    const favPanel = el.querySelector('.comic-helper-favorites-panel') as HTMLElement;
    const tagBtn = el.querySelector('.comic-helper-favorites-trend-tags button') as HTMLElement;
    tagBtn.click();
    expect(favPanel.querySelectorAll('.comic-helper-search-result-item')).toHaveLength(2);

    // Click again to deselect
    const activeTagBtn = el.querySelector('.comic-helper-favorites-trend-tags button') as HTMLElement;
    activeTagBtn.click();
    expect(favPanel.querySelectorAll('.comic-helper-search-result-item')).toHaveLength(3);
  });

  it('should reset tag selection when updateFavorites is called', () => {
    const { el, updateFavorites } = createFavoritesModal({ ...defaultProps, favorites: taggedFavorites });
    const tagBtn = el.querySelector('.comic-helper-favorites-trend-tags button') as HTMLElement;
    tagBtn.click();

    updateFavorites(taggedFavorites);
    const favPanel = el.querySelector('.comic-helper-favorites-panel') as HTMLElement;
    expect(favPanel.querySelectorAll('.comic-helper-search-result-item')).toHaveLength(3);
  });

  it('should update trend section when updateFavorites is called', () => {
    const { el, updateFavorites } = createFavoritesModal(defaultProps);
    let trendSection = el.querySelector('.comic-helper-favorites-trend-section') as HTMLElement;
    expect(trendSection.style.display).toBe('none');

    updateFavorites(taggedFavorites);
    trendSection = el.querySelector('.comic-helper-favorites-trend-section') as HTMLElement;
    expect(trendSection.style.display).not.toBe('none');
  });

  it('should stop click propagation on favorite tile to prevent modal close', () => {
    const onClose = vi.fn();
    const { el } = createFavoritesModal({ ...defaultProps, onClose });
    const link = el.querySelector('.comic-helper-search-result-item') as HTMLElement;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    const stopSpy = vi.spyOn(event, 'stopPropagation');
    link.dispatchEvent(event);
    expect(onClose).not.toHaveBeenCalled();
    expect(stopSpy).toHaveBeenCalled();
  });

  describe('show all tags toggle', () => {
    const manyTagFavorites: RelatedWork[] = [
      {
        title: 'Work A', href: '/work/1/', thumb: '',
        tags: Array.from({ length: 15 }, (_, i) => ({ text: `tag${i}`, href: `/tags/tag${i}`, type: null }))
      }
    ];

    it('should show toggle button in trend section', () => {
      const { el } = createFavoritesModal({ ...defaultProps, favorites: manyTagFavorites });
      const toggleBtn = el.querySelector('.comic-helper-trend-toggle-btn') as HTMLElement;
      expect(toggleBtn).not.toBeNull();
      expect(toggleBtn.textContent).toContain(t('ui.showAllTags'));
    });

    it('should show all tags when toggle button is clicked', () => {
      const { el } = createFavoritesModal({ ...defaultProps, favorites: manyTagFavorites });
      const tagsContainer = el.querySelector('.comic-helper-favorites-trend-tags') as HTMLElement;
      expect(tagsContainer.querySelectorAll('.comic-helper-tag-chip-container').length).toBe(10);

      const toggleBtn = el.querySelector('.comic-helper-trend-toggle-btn') as HTMLElement;
      toggleBtn.click();

      const updatedTags = el.querySelector('.comic-helper-favorites-trend-tags') as HTMLElement;
      expect(updatedTags.querySelectorAll('.comic-helper-tag-chip-container').length).toBe(15);
    });

    it('should change toggle button text to showTopTags after expanding', () => {
      const { el } = createFavoritesModal({ ...defaultProps, favorites: manyTagFavorites });
      const toggleBtn = el.querySelector('.comic-helper-trend-toggle-btn') as HTMLElement;
      toggleBtn.click();

      const updatedBtn = el.querySelector('.comic-helper-trend-toggle-btn') as HTMLElement;
      expect(updatedBtn.textContent).toContain(t('ui.showTopTags'));
    });

    it('should collapse back to top 10 when toggle button is clicked again', () => {
      const { el } = createFavoritesModal({ ...defaultProps, favorites: manyTagFavorites });
      const toggleBtn = el.querySelector('.comic-helper-trend-toggle-btn') as HTMLElement;
      toggleBtn.click();
      const collapseBtn = el.querySelector('.comic-helper-trend-toggle-btn') as HTMLElement;
      collapseBtn.click();

      const updatedTags = el.querySelector('.comic-helper-favorites-trend-tags') as HTMLElement;
      expect(updatedTags.querySelectorAll('.comic-helper-tag-chip-container').length).toBe(10);
    });

    it('should reset showAllTags to false when updateFavorites is called', () => {
      const { el, updateFavorites } = createFavoritesModal({ ...defaultProps, favorites: manyTagFavorites });
      const toggleBtn = el.querySelector('.comic-helper-trend-toggle-btn') as HTMLElement;
      toggleBtn.click();
      expect(el.querySelector('.comic-helper-favorites-trend-tags')!.querySelectorAll('.comic-helper-tag-chip-container').length).toBe(15);

      updateFavorites(manyTagFavorites);
      expect(el.querySelector('.comic-helper-favorites-trend-tags')!.querySelectorAll('.comic-helper-tag-chip-container').length).toBe(10);
    });
  });

  describe('pinned tags', () => {
    it('should render pin buttons for each tag chip', () => {
      const { el } = createFavoritesModal({ ...defaultProps, favorites: taggedFavorites });
      const pinBtns = el.querySelectorAll('.comic-helper-tag-pin');
      expect(pinBtns.length).toBeGreaterThan(0);
    });

    it('should render pin button as active when tag is pinned', () => {
      const { el } = createFavoritesModal({ ...defaultProps, favorites: taggedFavorites, pinnedTags: ['alice'] });
      const activePin = el.querySelector('.comic-helper-tag-pin.active');
      expect(activePin).not.toBeNull();
    });

    it('should call onTogglePinTag when pin button is clicked', () => {
      const onTogglePinTag = vi.fn();
      const { el } = createFavoritesModal({ ...defaultProps, favorites: taggedFavorites, onTogglePinTag });
      const pinBtn = el.querySelector('.comic-helper-tag-pin') as HTMLElement;
      pinBtn.click();
      expect(onTogglePinTag).toHaveBeenCalledWith(expect.any(String));
    });

    it('should update pin state via updatePinnedTags', () => {
      const { el, updatePinnedTags } = createFavoritesModal({ ...defaultProps, favorites: taggedFavorites });
      expect(el.querySelector('.comic-helper-tag-pin.active')).toBeNull();

      updatePinnedTags(['fantasy']);
      expect(el.querySelector('.comic-helper-tag-pin.active')).not.toBeNull();
    });
  });

  describe('history trend section', () => {
    const historyWithTags: HistoryEntry[] = [
      {
        title: 'History A', href: '/work/10/', thumb: '', viewCount: 5, firstViewedAt: 1000, lastViewedAt: 5000,
        tags: [{ text: 'fantasy', href: '/tags/fantasy', type: 'genre' }]
      },
      {
        title: 'History B', href: '/work/11/', thumb: '', viewCount: 2, firstViewedAt: 2000, lastViewedAt: 3000
      }
    ];

    it('should show history trend section when history items have tags', () => {
      const { el } = createFavoritesModal({ ...defaultProps, history: historyWithTags });
      const histTab = el.querySelectorAll('.comic-helper-library-tab')[1] as HTMLElement;
      histTab.click();

      const histPanel = el.querySelector('.comic-helper-history-panel') as HTMLElement;
      const trendSection = histPanel.querySelector('.comic-helper-favorites-trend-section') as HTMLElement;
      expect(trendSection.style.display).not.toBe('none');
    });

    it('should filter history when trend tag is clicked', () => {
      const { el } = createFavoritesModal({ ...defaultProps, history: historyWithTags });
      const histTab = el.querySelectorAll('.comic-helper-library-tab')[1] as HTMLElement;
      histTab.click();

      const histPanel = el.querySelector('.comic-helper-history-panel') as HTMLElement;
      expect(histPanel.querySelectorAll('.comic-helper-search-result-item')).toHaveLength(2);

      const tagBtn = histPanel.querySelector('.comic-helper-favorites-trend-tags button') as HTMLElement;
      tagBtn.click();

      expect(histPanel.querySelectorAll('.comic-helper-search-result-item')).toHaveLength(1);

      // Deselect
      const activeBtn = histPanel.querySelector('.comic-helper-favorites-trend-tags button') as HTMLElement;
      activeBtn.click();
      expect(histPanel.querySelectorAll('.comic-helper-search-result-item')).toHaveLength(2);
    });

    it('should update workTagsCache and show trend section in history tab', () => {
      const { el, updateWorkTagsCache } = createFavoritesModal(defaultProps);
      const histTab = el.querySelectorAll('.comic-helper-library-tab')[1] as HTMLElement;
      histTab.click();

      const histPanel = el.querySelector('.comic-helper-history-panel') as HTMLElement;
      const trendSection = histPanel.querySelector('.comic-helper-favorites-trend-section') as HTMLElement;
      expect(trendSection.style.display).toBe('none');

      updateWorkTagsCache({
        '/work/10/': [{ text: 'fantasy', href: '/tags/fantasy', type: 'genre' }]
      });

      const updatedTrend = histPanel.querySelector('.comic-helper-favorites-trend-section') as HTMLElement;
      expect(updatedTrend.style.display).not.toBe('none');
    });

    it('should toggle show all tags in history trend section', () => {
      const manyTagHistory: HistoryEntry[] = [
        {
          title: 'History A', href: '/work/10/', thumb: '', viewCount: 1, firstViewedAt: 1000, lastViewedAt: 1000,
          tags: Array.from({ length: 15 }, (_, i) => ({ text: `tag${i}`, href: `/tags/tag${i}`, type: null }))
        }
      ];
      const { el } = createFavoritesModal({ ...defaultProps, history: manyTagHistory });
      const histTab = el.querySelectorAll('.comic-helper-library-tab')[1] as HTMLElement;
      histTab.click();

      const histPanel = el.querySelector('.comic-helper-history-panel') as HTMLElement;
      expect(histPanel.querySelectorAll('.comic-helper-tag-chip-container').length).toBe(10);

      const toggleBtn = histPanel.querySelector('.comic-helper-trend-toggle-btn') as HTMLElement;
      toggleBtn.click();
      expect(histPanel.querySelectorAll('.comic-helper-tag-chip-container').length).toBe(15);
    });
  });

  describe('selected tags sorting', () => {
    it('should move clicked tag to the front of the trend list', () => {
      // taggedFavorites: fantasy(count=2), alice(count=1), bob(count=1)
      // Initially, fantasy is first (highest count)
      const { el } = createFavoritesModal({ ...defaultProps, favorites: taggedFavorites });
      const initialChips = el.querySelectorAll<HTMLElement>('.comic-helper-favorites-trend-tags .comic-helper-tag-chip');
      expect(initialChips[0].textContent).toContain('fantasy');

      // Click alice (not at the front) — DOM gets re-rendered after click
      const aliceChip = Array.from(initialChips).find(c => c.textContent.includes('alice')) as HTMLElement;
      aliceChip.click();

      // Query from el again after re-render
      const updatedChips = el.querySelectorAll<HTMLElement>('.comic-helper-favorites-trend-tags .comic-helper-tag-chip');
      expect(updatedChips[0].textContent).toContain('alice');
    });

    it('should show selected tag as active when it moves to front', () => {
      const { el } = createFavoritesModal({ ...defaultProps, favorites: taggedFavorites });
      const initialChips = el.querySelectorAll<HTMLElement>('.comic-helper-favorites-trend-tags .comic-helper-tag-chip');
      const aliceChip = Array.from(initialChips).find(c => c.textContent.includes('alice')) as HTMLElement;
      aliceChip.click();

      // Query from el again after re-render
      const updatedChips = el.querySelectorAll<HTMLElement>('.comic-helper-favorites-trend-tags .comic-helper-tag-chip');
      expect(updatedChips[0].classList.contains('active')).toBe(true);
    });

    it('should restore original order when selected tag is deselected', () => {
      const { el } = createFavoritesModal({ ...defaultProps, favorites: taggedFavorites });

      // Click alice to select it (moves to front)
      const initialChips = el.querySelectorAll<HTMLElement>('.comic-helper-favorites-trend-tags .comic-helper-tag-chip');
      const aliceChip = Array.from(initialChips).find(c => c.textContent.includes('alice')) as HTMLElement;
      aliceChip.click();

      // Now deselect alice — query from el again after first re-render
      const afterSelectChips = el.querySelectorAll<HTMLElement>('.comic-helper-favorites-trend-tags .comic-helper-tag-chip');
      const aliceChipActive = Array.from(afterSelectChips).find(c => c.textContent.includes('alice')) as HTMLElement;
      aliceChipActive.click();

      // fantasy should be back at the front — query from el again after second re-render
      const updatedChips = el.querySelectorAll<HTMLElement>('.comic-helper-favorites-trend-tags .comic-helper-tag-chip');
      expect(updatedChips[0].textContent).toContain('fantasy');
    });
  });
});
