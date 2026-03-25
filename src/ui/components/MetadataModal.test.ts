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

  it('should update work tags cache and re-render related trend section', () => {
    const relatedWork = { title: 'Related 1', href: '/rel/1/', thumb: 'r1.jpg' };
    const meta = { title: 'Test', tags: [], relatedWorks: [relatedWork] };
    const { el, updateWorkTagsCache } = createMetadataModal({
      metadata: meta,
      isFavorite: false,
      onClose: vi.fn(),
      onTagClick: vi.fn(),
      onToggleFavorite: vi.fn()
    });

    // Initially trend section hidden (no tags)
    const trendSection = el.querySelector('.comic-helper-favorites-trend-section') as HTMLElement;
    expect(trendSection.style.display).toBe('none');

    // Update cache with tags for the related work
    updateWorkTagsCache({
      '/rel/1/': [{ text: 'fantasy', href: '/tags/fantasy', type: 'genre' }]
    });

    // Trend section should now show tags
    const updatedTrend = el.querySelector('.comic-helper-favorites-trend-section') as HTMLElement;
    expect(updatedTrend.style.display).not.toBe('none');
  });

  it('should filter related works when trend section tag is clicked', () => {
    const relatedWorks = [
      { title: 'Work A', href: '/rel/1/', thumb: '', tags: [{ text: 'fantasy', href: '/tags/fantasy', type: 'genre' }] },
      { title: 'Work B', href: '/rel/2/', thumb: '' }
    ];
    const meta = { title: 'Test', tags: [], relatedWorks };
    const { el } = createMetadataModal({
      metadata: meta,
      isFavorite: false,
      onClose: vi.fn(),
      onTagClick: vi.fn(),
      onToggleFavorite: vi.fn()
    });

    // Initially 2 related items
    expect(el.querySelectorAll('.comic-helper-related-item')).toHaveLength(2);

    // Click trend tag to filter
    const tagBtn = el.querySelector('.comic-helper-favorites-trend-tags button') as HTMLElement;
    tagBtn.click();

    // Only 1 item after filter
    expect(el.querySelectorAll('.comic-helper-related-item')).toHaveLength(1);

    // Click again to deselect
    const activeBtn = el.querySelector('.comic-helper-favorites-trend-tags button') as HTMLElement;
    activeBtn.click();
    expect(el.querySelectorAll('.comic-helper-related-item')).toHaveLength(2);
  });

  it('should toggle show all tags in related trend section', () => {
    const manyTagRelated = [
      {
        title: 'Work', href: '/rel/1/', thumb: '',
        tags: Array.from({ length: 15 }, (_, i) => ({ text: `tag${i}`, href: `/tags/tag${i}`, type: null }))
      }
    ];
    const meta = { title: 'Test', tags: [], relatedWorks: manyTagRelated };
    const { el } = createMetadataModal({
      metadata: meta,
      isFavorite: false,
      onClose: vi.fn(),
      onTagClick: vi.fn(),
      onToggleFavorite: vi.fn()
    });

    // Initially shows only 10
    expect(el.querySelectorAll('.comic-helper-favorites-trend-tags .comic-helper-tag-chip-container').length).toBe(10);

    const toggleBtn = el.querySelector('.comic-helper-trend-toggle-btn') as HTMLElement;
    toggleBtn.click();

    // Now shows all 15
    expect(el.querySelectorAll('.comic-helper-favorites-trend-tags .comic-helper-tag-chip-container').length).toBe(15);
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
    expect(favBtn.querySelector('svg')).toBeDefined();
    expect(favBtn.classList.contains('inactive')).toBe(true);

    update(true);
    expect(favBtn.querySelector('svg')).toBeDefined();
    expect(favBtn.classList.contains('active')).toBe(true);

    update(false);
    expect(favBtn.querySelector('svg')).toBeDefined();
    expect(favBtn.classList.contains('inactive')).toBe(true);
  });
});
