import { createElement } from '../utils';
import { t } from '../../i18n';
import { Metadata, Tag, RelatedWork } from '../../types';
import { createHeartFilledIcon, createHeartOutlineIcon } from '../icons';
import { filterWorksByTags, enrichWorksWithCachedTags } from '../../logic';
import { createTrendSection } from './TrendSection';

export interface MetadataModalProps {
  metadata: Metadata;
  isFavorite: boolean;
  onClose: () => void;
  onTagClick: (tag: Tag) => Promise<void>;
  onToggleFavorite: () => void;
  workTagsCache?: Record<string, Tag[]>;
}

export interface MetadataModalComponent {
  el: HTMLElement;
  update: (isFavorite: boolean) => void;
  updateWorkTagsCache: (cache: Record<string, Tag[]>) => void;
}

export function createMetadataModal({ metadata, isFavorite, onClose, onTagClick, onToggleFavorite, workTagsCache: initialWorkTagsCache }: MetadataModalProps): MetadataModalComponent {
  const { title, tags, relatedWorks } = metadata;
  let currentWorkTagsCache: Record<string, Tag[]> = initialWorkTagsCache ?? {};
  const relatedSelectedTags: Set<string> = new Set();
  let relatedShowAllTags = false;

  const heartFilledIcon = createHeartFilledIcon(18);
  const heartOutlineIcon = createHeartOutlineIcon(18);

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

  const favBtn = createElement('button', {
    className: `comic-helper-favorite-btn ${isFavorite ? 'active' : 'inactive'}`,
    title: isFavorite ? 'Remove from Favorites' : 'Add to Favorites',
    events: {
      click: (e) => {
        e.preventDefault();
        onToggleFavorite();
      }
    }
  }, [isFavorite ? heartFilledIcon : heartOutlineIcon]);

  const titleEl = createElement('h2', {
    className: 'comic-helper-modal-title',
  }, [
    createElement('span', { textContent: title + ' ' }),
    favBtn
  ]);

  const tagChips = tags.map(tag => {
    const className = tag.type
      ? `comic-helper-tag-chip comic-helper-tag-chip--${tag.type}`
      : 'comic-helper-tag-chip';
    return createElement('a', {
      className,
      textContent: tag.text,
      style: { cursor: 'pointer' },
      events: {
        click: (e) => {
          e.preventDefault();
          e.stopPropagation();
          void onTagClick(tag);
          onClose(); // Explicitly close metadata modal
        }
      }
    });
  });

  const tagSection = createElement('div', {}, [
    createElement('div', { className: 'comic-helper-section-title', textContent: t('ui.tags') }),
    createElement('div', { className: 'comic-helper-tag-list' }, tagChips)
  ]);

  function createRelatedGrid(works: RelatedWork[]): HTMLElement {
    const relatedItems = works.map(work => {
      const thumb = createElement('img', {
        className: 'comic-helper-related-thumb',
        attributes: { src: work.thumb, loading: 'lazy' }
      });
      const workTitle = createElement('div', {
        className: 'comic-helper-related-title',
        textContent: work.title
      });
      return createElement('a', {
        className: 'comic-helper-related-item',
        attributes: { href: work.href, target: '_blank' },
        events: { click: (e) => e.stopPropagation() }
      }, [thumb, workTitle]);
    });
    return createElement('div', { className: 'comic-helper-related-grid' }, relatedItems);
  }

  function getEnrichedRelated(): RelatedWork[] {
    return enrichWorksWithCachedTags(relatedWorks, currentWorkTagsCache);
  }

  function makeRelatedTrendSection(): HTMLElement {
    return createTrendSection({
      works: getEnrichedRelated(),
      selectedTagTexts: relatedSelectedTags,
      onTagClick: (tagText: string) => {
        if (relatedSelectedTags.has(tagText)) {
          relatedSelectedTags.delete(tagText);
        } else {
          relatedSelectedTags.add(tagText);
        }
        rerenderRelated();
      },
      showAllTags: relatedShowAllTags,
      onToggleShowAll: () => {
        relatedShowAllTags = !relatedShowAllTags;
        rerenderRelated();
      }
    });
  }

  let relatedTrendSection = makeRelatedTrendSection();
  let relatedGrid = createRelatedGrid(
    relatedSelectedTags.size > 0
      ? filterWorksByTags(getEnrichedRelated(), relatedSelectedTags)
      : relatedWorks
  );

  function rerenderRelated(): void {
    const newTrend = makeRelatedTrendSection();
    relatedSection.replaceChild(newTrend, relatedTrendSection);
    relatedTrendSection = newTrend;

    const filtered = relatedSelectedTags.size > 0
      ? filterWorksByTags(getEnrichedRelated(), relatedSelectedTags)
      : relatedWorks;
    const newGrid = createRelatedGrid(filtered);
    relatedSection.replaceChild(newGrid, relatedGrid);
    relatedGrid = newGrid;
  }

  const relatedSection = createElement('div', {}, [
    createElement('div', { className: 'comic-helper-section-title', textContent: t('ui.related') }),
    relatedTrendSection,
    relatedGrid
  ]);

  const content = createElement('div', {
    className: 'comic-helper-modal-content',
    events: {
      click: (e) => e.stopPropagation()
    }
  }, [closeBtn, titleEl, tagSection, relatedSection]);

  const overlay = createElement('div', {
    className: 'comic-helper-modal-overlay',
    events: {
      click: (e) => {
        e.preventDefault();
        onClose();
      }
    }
  }, [content]);

    return {
      el: overlay,
      update: (newIsFavorite: boolean) => {
        favBtn.className = `comic-helper-favorite-btn ${newIsFavorite ? 'active' : 'inactive'}`;
        favBtn.replaceChildren(newIsFavorite ? heartFilledIcon : heartOutlineIcon);
        favBtn.title = newIsFavorite ? 'Remove from Favorites' : 'Add to Favorites';
      },
      updateWorkTagsCache: (cache: Record<string, Tag[]>) => {
        currentWorkTagsCache = cache;
        rerenderRelated();
      }
    };
  }
  