import { createElement } from '../utils';
import { t } from '../../i18n';
import { Metadata, Tag } from '../../types';

export interface MetadataModalProps {
  metadata: Metadata;
  isFavorite: boolean;
  onClose: () => void;
  onTagClick: (tag: Tag) => Promise<void>;
  onToggleFavorite: () => void;
}

export interface MetadataModalComponent {
  el: HTMLElement;
  update: (isFavorite: boolean) => void;
}

export function createMetadataModal({ metadata, isFavorite, onClose, onTagClick, onToggleFavorite }: MetadataModalProps): MetadataModalComponent {
  const { title, tags, relatedWorks } = metadata;

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
    textContent: isFavorite ? '♥' : '♡',
    title: isFavorite ? 'Remove from Favorites' : 'Add to Favorites',
    events: {
      click: (e) => {
        e.preventDefault();
        onToggleFavorite();
      }
    }
  });

  const titleEl = createElement('h2', {
    className: 'comic-helper-modal-title',
  }, [
    title + ' ',
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

  const relatedItems = relatedWorks.map(work => {
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
      events: {
        click: (e) => e.stopPropagation()
      }
    }, [thumb, workTitle]);
  });

  const relatedSection = createElement('div', {}, [
    createElement('div', { className: 'comic-helper-section-title', textContent: t('ui.related') }),
    createElement('div', { className: 'comic-helper-related-grid' }, relatedItems)
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
        favBtn.textContent = newIsFavorite ? '♥' : '♡';
        favBtn.title = newIsFavorite ? 'Remove from Favorites' : 'Add to Favorites';
      }
    };
  }
  