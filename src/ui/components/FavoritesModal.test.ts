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

  describe('display order (newest first)', () => {
    const titlesIn = (el: HTMLElement): string[] =>
      Array.from(el.querySelectorAll('.comic-helper-favorites-panel .comic-helper-search-result-title'))
        .map(e => e.textContent);

    it('should render favorites in descending order of addition', () => {
      const { el } = createFavoritesModal(defaultProps);
      expect(titlesIn(el)).toEqual(['Work B', 'Work A']);
    });

    it('should keep descending order after updateFavorites()', () => {
      const { el, updateFavorites } = createFavoritesModal({ ...defaultProps, favorites: [] });
      updateFavorites(taggedFavorites);
      expect(titlesIn(el)).toEqual(['Work C', 'Work B', 'Work A']);
    });

    it('should keep descending order when filtered by tag', () => {
      const { el } = createFavoritesModal({ ...defaultProps, favorites: taggedFavorites });
      (el.querySelector('.comic-helper-favorites-trend-tags button') as HTMLElement).click();
      expect(titlesIn(el)).toEqual(['Work B', 'Work A']);
    });

    it('should not mutate the favorites array passed in', () => {
      const favorites = [...sampleFavorites];
      createFavoritesModal({ ...defaultProps, favorites });
      expect(favorites).toEqual(sampleFavorites);
    });
  });

  it('should display titles and thumbnails', () => {
    const { el } = createFavoritesModal(defaultProps);
    expect(el.textContent).toContain('Work A');
    expect(el.textContent).toContain('Work B');
    const thumbs = el.querySelectorAll('.comic-helper-search-result-thumb') as NodeListOf<HTMLImageElement>;
    // newest first: Work B is displayed before Work A
    expect(thumbs[0].src).toContain('/thumb/2.webp');
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
    expect(onRemoveFavorite).toHaveBeenCalledWith('/work/2/');
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
    expect(onToggleFavorite).toHaveBeenCalledWith(sampleFavorites[1]);
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
    expect(link.href).toContain('/work/2/');
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

describe('FavoritesModal tag cloud view', () => {
  const manyTags: RelatedWork[] = [
    {
      title: 'W1', href: '/work/1/', thumb: '/thumb/1.webp',
      tags: Array.from({ length: 12 }, (_, i) => ({ text: `tag${i}`, href: `/tags/${i}`, type: 'tag' as const }))
    },
    { title: 'W2', href: '/work/2/', thumb: '/thumb/2.webp', tags: [{ text: 'tag0', href: '/tags/0', type: 'tag' }] },
    { title: 'W3', href: '/work/3/', thumb: '/thumb/3.webp', tags: [{ text: 'tag0', href: '/tags/0', type: 'tag' }] }
  ];

  const viewButtons = (el: HTMLElement) =>
    el.querySelectorAll<HTMLElement>('.comic-helper-favorites-view-btn');
  const cloudEl = (el: HTMLElement) => el.querySelector('.comic-helper-tag-cloud') as HTMLElement;
  const listViewEl = (el: HTMLElement) => el.querySelector('.comic-helper-favorites-list-view') as HTMLElement;

  it('デフォルトでは一覧ビューが表示されクラウドは非表示', () => {
    const { el } = createFavoritesModal({ ...defaultProps, favorites: taggedFavorites });
    expect(viewButtons(el)).toHaveLength(2);
    expect(listViewEl(el).style.display).not.toBe('none');
    expect(cloudEl(el).style.display).toBe('none');
  });

  it('タグクラウドに切り替えると作品グリッドが非表示になる', () => {
    const { el } = createFavoritesModal({ ...defaultProps, favorites: taggedFavorites });
    viewButtons(el)[1].click();
    expect(cloudEl(el).style.display).not.toBe('none');
    expect(listViewEl(el).style.display).toBe('none');
    expect(viewButtons(el)[1].classList.contains('active')).toBe(true);
  });

  it('タグが200種類以下なら全タグが表示される', () => {
    const { el } = createFavoritesModal({ ...defaultProps, favorites: manyTags });
    viewButtons(el)[1].click();
    expect(cloudEl(el).querySelectorAll('.comic-helper-tag-cloud-item')).toHaveLength(12);
  });

  it('タグが201種類以上なら出現件数上位200件のみ表示される', () => {
    const many: RelatedWork[] = [
      {
        title: 'M1', href: '/work/m1/', thumb: '/thumb/m1.webp',
        tags: Array.from({ length: 205 }, (_, i) => ({ text: `t${i}`, href: `/tags/${i}`, type: 'tag' as const }))
      },
      { title: 'M2', href: '/work/m2/', thumb: '/thumb/m2.webp', tags: [{ text: 't204', href: '/tags/204', type: 'tag' }] }
    ];
    const { el } = createFavoritesModal({ ...defaultProps, favorites: many });
    viewButtons(el)[1].click();
    const texts = Array.from(cloudEl(el).querySelectorAll('.comic-helper-tag-cloud-item')).map(i => i.textContent);
    expect(texts).toHaveLength(200);
    expect(texts).toContain('t204');
  });

  it('件数が多いタグほど大きい段階になり、最少は最小段階', () => {
    const { el } = createFavoritesModal({ ...defaultProps, favorites: manyTags });
    viewButtons(el)[1].click();
    const items = Array.from(cloudEl(el).querySelectorAll<HTMLElement>('.comic-helper-tag-cloud-item'));
    const top = items.find(i => i.textContent === 'tag0')!;
    const low = items.find(i => i.textContent === 'tag1')!;
    expect(top.className).toContain('--level-5');
    expect(low.className).toContain('--level-1');
  });

  it('全タグの件数が同じなら同一段階', () => {
    const { el } = createFavoritesModal({ ...defaultProps, favorites: [manyTags[0]] });
    viewButtons(el)[1].click();
    const levels = new Set(Array.from(cloudEl(el).querySelectorAll('.comic-helper-tag-cloud-item')).map(i => i.className));
    expect(levels.size).toBe(1);
  });

  it('タグが存在しない場合はメッセージを表示する', () => {
    const { el } = createFavoritesModal({ ...defaultProps, favorites: sampleFavorites });
    viewButtons(el)[1].click();
    expect(cloudEl(el).querySelectorAll('.comic-helper-tag-cloud-item')).toHaveLength(0);
    expect(cloudEl(el).textContent).toContain(t('ui.tagCloudEmpty'));
  });

  it('クラウドのタグをクリックすると一覧ビューでそのタグに絞り込まれる', () => {
    const { el } = createFavoritesModal({ ...defaultProps, favorites: taggedFavorites });
    viewButtons(el)[1].click();
    const bob = Array.from(cloudEl(el).querySelectorAll<HTMLElement>('.comic-helper-tag-cloud-item'))
      .find(i => i.textContent === 'bob')!;
    bob.click();

    expect(listViewEl(el).style.display).not.toBe('none');
    expect(cloudEl(el).style.display).toBe('none');
    const items = listViewEl(el).querySelectorAll('.comic-helper-search-result-item');
    expect(items).toHaveLength(1);
    expect(items[0].textContent).toContain('Work B');
    expect(listViewEl(el).querySelector('.comic-helper-tag-chip.active')?.textContent).toContain('bob');
  });

  it('選択中のタグがある状態で別のタグをクリックするとAND絞り込みになる', () => {
    const { el } = createFavoritesModal({ ...defaultProps, favorites: taggedFavorites });
    viewButtons(el)[1].click();
    const click = (name: string) => Array.from(cloudEl(el).querySelectorAll<HTMLElement>('.comic-helper-tag-cloud-item'))
      .find(i => i.textContent === name)!.click();
    click('fantasy');
    viewButtons(el)[1].click();
    click('alice');
    const items = listViewEl(el).querySelectorAll('.comic-helper-search-result-item');
    expect(items).toHaveLength(1);
    expect(items[0].textContent).toContain('Work A');
  });

  it('一覧ビューに戻すとトレンドセクションが表示される', () => {
    const { el } = createFavoritesModal({ ...defaultProps, favorites: taggedFavorites });
    viewButtons(el)[1].click();
    viewButtons(el)[0].click();
    expect(listViewEl(el).querySelector('.comic-helper-favorites-trend-section')).not.toBeNull();
    expect(listViewEl(el).style.display).not.toBe('none');
  });

  it('クラウド表示中にお気に入りが更新されても、ビューは維持され再集計される', () => {
    const comp = createFavoritesModal({ ...defaultProps, favorites: taggedFavorites });
    viewButtons(comp.el)[1].click();
    comp.updateFavorites(manyTags);
    expect(cloudEl(comp.el).style.display).not.toBe('none');
    expect(cloudEl(comp.el).querySelectorAll('.comic-helper-tag-cloud-item')).toHaveLength(12);
  });
});

describe('FavoritesModal tag cloud type filter', () => {
  const typedFavorites: RelatedWork[] = [
    {
      title: 'W1', href: '/work/1/', thumb: '/thumb/1.webp',
      tags: [
        { text: 'fantasy', href: '/tags/fantasy', type: 'genre' },
        { text: 'alice', href: '/artists/alice', type: 'artist' },
        { text: 'misc', href: '/tags/misc', type: null }
      ]
    },
    { title: 'W2', href: '/work/2/', thumb: '/thumb/2.webp', tags: [{ text: 'fantasy', href: '/tags/fantasy', type: 'genre' }] }
  ];

  const openCloud = (favorites: RelatedWork[]) => {
    const comp = createFavoritesModal({ ...defaultProps, favorites });
    comp.el.querySelectorAll<HTMLElement>('.comic-helper-favorites-view-btn')[1].click();
    return comp;
  };
  const cloudEl = (el: HTMLElement) => el.querySelector('.comic-helper-tag-cloud') as HTMLElement;
  const itemTexts = (el: HTMLElement) =>
    Array.from(cloudEl(el).querySelectorAll('.comic-helper-tag-cloud-item')).map(i => i.textContent).sort();
  const chips = (el: HTMLElement) =>
    Array.from(cloudEl(el).querySelectorAll<HTMLElement>('.comic-helper-tag-type-chip'));
  const chip = (el: HTMLElement, label: string) => chips(el).find(c => c.textContent === label) as HTMLElement;

  it('デフォルトでは存在する種類のチップが有効状態で表示され、全タグが表示される', () => {
    const { el } = openCloud(typedFavorites);
    expect(chips(el).map(c => c.textContent)).toEqual(['artist', 'genre', t('ui.tagTypeOther')]);
    expect(chips(el).some(c => c.classList.contains('disabled'))).toBe(false);
    expect(itemTexts(el)).toEqual(['alice', 'fantasy', 'misc']);
  });

  it('種類を無効にするとその種類のタグが消え、再度クリックで戻る', () => {
    const { el } = openCloud(typedFavorites);
    chip(el, 'genre').click();
    expect(itemTexts(el)).toEqual(['alice', 'misc']);
    expect(chip(el, 'genre').classList.contains('disabled')).toBe(true);
    chip(el, 'genre').click();
    expect(itemTexts(el)).toEqual(['alice', 'fantasy', 'misc']);
    expect(chip(el, 'genre').classList.contains('disabled')).toBe(false);
  });

  it('「その他」チップで type が null のタグを切り替えられる', () => {
    const { el } = openCloud(typedFavorites);
    chip(el, t('ui.tagTypeOther')).click();
    expect(itemTexts(el)).toEqual(['alice', 'fantasy']);
  });

  it('すべて無効にしてもチップは残り、空メッセージが表示される', () => {
    const { el } = openCloud(typedFavorites);
    ['artist', 'genre', t('ui.tagTypeOther')].forEach(label => chip(el, label).click());
    expect(chips(el)).toHaveLength(3);
    expect(itemTexts(el)).toEqual([]);
    expect(cloudEl(el).textContent).toContain(t('ui.tagCloudEmpty'));
  });

  it('種類が1つ以下ならチップは表示されない', () => {
    const { el } = openCloud([
      { title: 'W', href: '/work/1/', thumb: '', tags: [{ text: 'a', href: '/a', type: 'genre' }] }
    ]);
    expect(chips(el)).toHaveLength(0);
  });

  it('種類フィルタは一覧ビューのトレンドと作品グリッドに影響しない', () => {
    const { el } = openCloud(typedFavorites);
    chip(el, 'genre').click();
    const list = el.querySelector('.comic-helper-favorites-list-view') as HTMLElement;
    expect(list.querySelectorAll('.comic-helper-tag-chip-container')).toHaveLength(3);
    expect(list.querySelector('.comic-helper-search-result-grid')?.children).toHaveLength(2);
  });

  it('クラウド表示中にお気に入りが更新されても除外状態は維持される', () => {
    const comp = openCloud(typedFavorites);
    chip(comp.el, 'genre').click();
    comp.updateFavorites(typedFavorites);
    expect(itemTexts(comp.el)).toEqual(['alice', 'misc']);
    expect(cloudEl(comp.el).style.display).not.toBe('none');
  });

  it('モーダルを作り直すと全種類が有効に戻る', () => {
    const first = openCloud(typedFavorites);
    chip(first.el, 'genre').click();
    const second = openCloud(typedFavorites);
    expect(itemTexts(second.el)).toEqual(['alice', 'fantasy', 'misc']);
  });
});
