import { describe, it, expect, vi } from 'vitest';
import { createFavoritesModal } from './FavoritesModal';
import { t } from '../../i18n';
import { RelatedWork } from '../../types';

const sampleFavorites: RelatedWork[] = [
  { title: 'Work A', href: '/work/1/', thumb: '/thumb/1.webp' },
  { title: 'Work B', href: '/work/2/', thumb: '/thumb/2.webp' }
];

const defaultProps = {
  favorites: sampleFavorites,
  onRemove: () => {},
  onClose: () => {}
};

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
