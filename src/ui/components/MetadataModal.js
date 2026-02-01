import { createElement } from '../utils.js';
import { t } from '../../i18n.js';

/**
 * @param {Object} props
 * @param {import('../../store.js').Metadata} props.metadata
 * @param {Function} props.onClose
 */
export function createMetadataModal({ metadata, onClose }) {
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

  const tagChips = tags.map(tag => createElement('a', {
    className: 'comic-helper-tag-chip',
    textContent: tag.text,
    attributes: { href: tag.href, target: '_blank' },
    events: {
      click: (e) => e.stopPropagation()
    }
  }));

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
    style: 'font-size: 11px; color: #888; margin-top: 15px; text-align: right; border-top: 1px solid #eee; padding-top: 5px;',
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
    update: () => {} // No dynamic update needed once opened
  };
}
