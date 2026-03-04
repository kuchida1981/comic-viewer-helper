import { describe, it, expect, vi } from 'vitest';
import { createMetadataModal } from './MetadataModal';

describe('MetadataModal', () => {
  const metadata = {
    title: 'Test Manga',
    tags: [{ text: 'Artist X', href: '/artist/x', type: 'artist' }],
    relatedWorks: [{ title: 'Related 1', href: '/rel/1', thumb: 'r1.jpg' }]
  };

  it('should render metadata and handle interactions', async () => {
    const onClose = vi.fn();
    const onTagClick = vi.fn().mockResolvedValue(undefined);
    const onToggleFavorite = vi.fn();
    
    const { el } = createMetadataModal({
      metadata,
      isFavorite: false,
      onClose,
      onTagClick,
      onToggleFavorite
    });

    expect(el.textContent).toContain('Test Manga');
    expect(el.textContent).toContain('Artist X');
    expect(el.textContent).toContain('Related 1');

    // Click close button
    const closeBtn = el.querySelector('.comic-helper-modal-close') as HTMLElement;
    closeBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(onClose).toHaveBeenCalled();

    // Click tag
    const tagLink = el.querySelector('.comic-helper-tag-chip') as HTMLElement;
    tagLink.click();
    expect(onTagClick).toHaveBeenCalledWith(metadata.tags[0]);

    // Click favorite toggle
    const favBtn = el.querySelector('.comic-helper-favorite-btn') as HTMLElement;
    favBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(onToggleFavorite).toHaveBeenCalled();
    
    // Click related work (ensure no error and stopPropagation is called)
    const relatedLink = el.querySelector('.comic-helper-related-item') as HTMLElement;
    relatedLink.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    // Click overlay
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it('should update favorite status', () => {
    const { el, update } = createMetadataModal({
      metadata,
      isFavorite: false,
      onClose: vi.fn(),
      onTagClick: vi.fn(),
      onToggleFavorite: vi.fn()
    });

    const favBtn = el.querySelector('.comic-helper-favorite-btn') as HTMLElement;
    expect(favBtn.textContent).toBe('♡');

    update(true);
    expect(favBtn.textContent).toBe('♥');
    expect(favBtn.classList.contains('active')).toBe(true);

    update(false);
    expect(favBtn.textContent).toBe('♡');
    expect(favBtn.classList.contains('inactive')).toBe(true);
  });
});
