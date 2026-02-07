import { createElement } from '../utils';
import { t } from '../../i18n';
import { Metadata, Tag } from '../../types';

export interface MetadataModalProps {
  metadata: Metadata;
  onClose: () => void;
  onTagClick: (tag: Tag) => Promise<void>;
}

export interface MetadataModalComponent {
  el: HTMLElement;
  update: () => void;
}

export function createMetadataModal({ metadata, onClose, onTagClick }: MetadataModalProps): MetadataModalComponent {
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

  const titleEl = createElement('h2', {
    className: 'comic-helper-modal-title',
    textContent: title
  });

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
          onTagClick(tag);
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

  const versionTag = createElement('div', {
    className: 'comic-helper-modal-version',
    style: {
      fontSize: '11px',
      color: '#888',
      marginTop: '15px',
      textAlign: 'right',
      borderTop: '1px solid #eee',
      paddingTop: '5px'
    },
    textContent: `${t('ui.version')}: v${__APP_VERSION__} (${__IS_UNSTABLE__ ? t('ui.unstable') : t('ui.stable')})`
  });

  const content = createElement('div', {
    className: 'comic-helper-modal-content',
    events: {
      click: (e) => e.stopPropagation()
    }
  }, [closeBtn, titleEl, tagSection, relatedSection, versionTag]);

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
    update: () => { } // No dynamic update needed once opened
  };
}