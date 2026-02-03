import { createElement } from '../utils.js';
import { t } from '../../i18n.js';

/**
 * @param {Object} props
 * @param {Function} props.onClose
 * @param {boolean} props.isDualViewEnabled
 * @param {'remember' | 'fixed'} props.guiPositionMode
 * @param {Function} props.onDualViewChange
 * @param {Function} props.onGuiPositionModeChange
 */
export function createConfigModal({
  onClose,
  isDualViewEnabled,
  guiPositionMode,
  onDualViewChange,
  onGuiPositionModeChange
}) {
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
    textContent: t('ui.settings')
  });

  // 表示設定セクションのタイトル
  const displaySettingsTitle = createElement('div', {
    className: 'comic-helper-section-title',
    textContent: t('ui.displaySettings')
  });

  // 見開き表示トグル
  const dualViewLabel = createElement('label', {
    className: 'comic-helper-config-label',
    textContent: t('ui.dualView')
  });

  const dualViewToggle = createElement('input', {
    type: 'checkbox',
    className: 'comic-helper-config-toggle',
    checked: isDualViewEnabled,
    events: {
      change: (e) => {
        const target = /** @type {HTMLInputElement} */ (e.target);
        onDualViewChange(target.checked);
      }
    }
  });

  const dualViewDesc = createElement('div', {
    className: 'comic-helper-config-desc',
    textContent: t('ui.dualViewDesc')
  });

  const dualViewRow = createElement('div', {
    className: 'comic-helper-config-row'
  }, [dualViewLabel, dualViewToggle, dualViewDesc]);

  // GUI表示位置モード
  const guiPositionLabel = createElement('div', {
    className: 'comic-helper-config-label',
    textContent: t('ui.guiPosition')
  });

  const rememberRadio = createElement('input', {
    type: 'radio',
    name: 'guiPositionMode',
    value: 'remember',
    className: 'comic-helper-config-radio',
    checked: guiPositionMode === 'remember',
    events: {
      change: (e) => {
        const target = /** @type {HTMLInputElement} */ (e.target);
        if (target.checked) {
          onGuiPositionModeChange('remember');
        }
      }
    }
  });

  const rememberLabel = createElement('label', {
    className: 'comic-helper-config-radio-label',
    textContent: t('ui.guiPositionRemember')
  }, [rememberRadio]);

  const fixedRadio = createElement('input', {
    type: 'radio',
    name: 'guiPositionMode',
    value: 'fixed',
    className: 'comic-helper-config-radio',
    checked: guiPositionMode === 'fixed',
    events: {
      change: (e) => {
        const target = /** @type {HTMLInputElement} */ (e.target);
        if (target.checked) {
          onGuiPositionModeChange('fixed');
        }
      }
    }
  });

  const fixedLabel = createElement('label', {
    className: 'comic-helper-config-radio-label',
    textContent: t('ui.guiPositionFixed')
  }, [fixedRadio]);

  const guiPositionDesc = createElement('div', {
    className: 'comic-helper-config-desc',
    textContent: t('ui.guiPositionDesc')
  });

  const guiPositionRow = createElement('div', {
    className: 'comic-helper-config-row'
  }, [guiPositionLabel, rememberLabel, fixedLabel, guiPositionDesc]);

  const content = createElement('div', {
    className: 'comic-helper-modal-content',
    events: {
      click: (e) => e.stopPropagation()
    }
  }, [closeBtn, titleEl, displaySettingsTitle, dualViewRow, guiPositionRow]);

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
    update: (newIsDualViewEnabled, newGuiPositionMode) => {
      dualViewToggle.checked = newIsDualViewEnabled;
      rememberRadio.checked = newGuiPositionMode === 'remember';
      fixedRadio.checked = newGuiPositionMode === 'fixed';
    }
  };
}
