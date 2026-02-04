import { createElement } from '../utils';
import { t } from '../../i18n';
import { SHORTCUTS } from '../../shortcuts';

export interface HelpModalProps {
  onClose: () => void;
}

export interface HelpModalComponent {
  el: HTMLElement;
  update: () => void;
}

export function createHelpModal({ onClose }: HelpModalProps): HelpModalComponent {
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
    textContent: t('ui.keyboardShortcuts')
  });

  const shortcutRows = SHORTCUTS.map(sc => {
    const keyLabels = sc.keys.map(k => {
      let label = k;
      if (k === ' ') label = t('ui.space');
      else if (k.includes('Arrow')) {
        if (k === 'ArrowLeft') label = '←';
        if (k === 'ArrowRight') label = '→';
        if (k === 'ArrowUp') label = '↑';
        if (k === 'ArrowDown') label = '↓';
      }
      return createElement('kbd', { className: 'comic-helper-kbd', textContent: label });
    });

    const keyContainer = createElement('div', { className: 'comic-helper-shortcut-keys' }, keyLabels);
    const labelEl = createElement('div', { className: 'comic-helper-shortcut-label', textContent: sc.label });

    const descText = sc.condition ? `${sc.description} (${sc.condition})` : sc.description;
    const descEl = createElement('div', { className: 'comic-helper-shortcut-desc', textContent: descText });

    return createElement('div', { className: 'comic-helper-shortcut-row' }, [keyContainer, labelEl, descEl]);
  });

  const shortcutList = createElement('div', { className: 'comic-helper-shortcut-list' }, shortcutRows);

  const content = createElement('div', {
    className: 'comic-helper-modal-content',
    events: {
      click: (e) => e.stopPropagation()
    }
  }, [closeBtn, titleEl, shortcutList]);

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
    update: () => { }
  };
}