import { describe, it, expect, vi } from 'vitest';
import { createFavoritesModal, calculateTrends } from './FavoritesModal';
import { t } from '../../i18n';
import { RelatedWork } from '../../types';

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

const defaultProps = {
  favorites: sampleFavorites,
  onRemove: () => {},
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

  it('should render favorites grid with items', () => {
    const { el } = createFavoritesModal(defaultProps);
    const items = el.querySelectorAll('.comic-helper-search-result-item');
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
    expect(el.textContent).toContain(t('ui.favoritesEmpty'));
    expect(el.querySelector('.comic-helper-search-result-item')).toBeNull();
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

  it('should call onRemove with the correct href when delete button is clicked', () => {
    const onRemove = vi.fn();
    const { el } = createFavoritesModal({ ...defaultProps, onRemove });
    const deleteBtns = el.querySelectorAll('.comic-helper-favorites-delete-btn');
    (deleteBtns[0] as HTMLElement).click();
    expect(onRemove).toHaveBeenCalledWith('/work/1/');
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
    expect(el.querySelector('.comic-helper-search-result-item')).toBeNull();
    updateFavorites(sampleFavorites);
    const items = el.querySelectorAll('.comic-helper-search-result-item');
    expect(items).toHaveLength(2);
  });

  it('should show empty message after updateFavorites with empty list', () => {
    const { el, updateFavorites } = createFavoritesModal(defaultProps);
    updateFavorites([]);
    expect(el.textContent).toContain(t('ui.favoritesEmpty'));
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

  it('should render trend section when favorites have tags and onTagClick is provided', () => {
    const onTagClick = vi.fn();
    const { el } = createFavoritesModal({ favorites: taggedFavorites, onRemove: () => {}, onClose: () => {}, onTagClick });
    const trendSection = el.querySelector('.comic-helper-favorites-trend-section') as HTMLElement;
    expect(trendSection).not.toBeNull();
    expect(trendSection.style.display).not.toBe('none');
    expect(el.textContent).toContain(t('ui.favoritesTrend'));
  });

  it('should hide trend section when no tags in favorites', () => {
    const onTagClick = vi.fn();
    const { el } = createFavoritesModal({ ...defaultProps, onTagClick });
    const trendSection = el.querySelector('.comic-helper-favorites-trend-section') as HTMLElement;
    expect(trendSection.style.display).toBe('none');
  });

  it('should hide trend section when onTagClick is not provided', () => {
    const { el } = createFavoritesModal({ favorites: taggedFavorites, onRemove: () => {}, onClose: () => {} });
    const trendSection = el.querySelector('.comic-helper-favorites-trend-section') as HTMLElement;
    expect(trendSection.style.display).toBe('none');
  });

  it('should call onTagClick with the correct tag when trend tag button is clicked', () => {
    const onTagClick = vi.fn();
    const { el } = createFavoritesModal({ favorites: taggedFavorites, onRemove: () => {}, onClose: () => {}, onTagClick });
    const tagBtn = el.querySelector('.comic-helper-favorites-trend-tags button') as HTMLElement;
    tagBtn.click();
    expect(onTagClick).toHaveBeenCalledWith(expect.objectContaining({ text: 'fantasy' }));
  });

  it('should update trend section when updateFavorites is called', () => {
    const onTagClick = vi.fn();
    const { el, updateFavorites } = createFavoritesModal({ favorites: sampleFavorites, onRemove: () => {}, onClose: () => {}, onTagClick });
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
});
