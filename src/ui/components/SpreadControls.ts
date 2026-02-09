import { createElement } from '../utils';
import { t } from '../../i18n';

export interface SpreadControlsProps {
  isDualViewEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  onAdjust: () => void;
}

export interface SpreadControlsComponent {
  el: HTMLElement;
  update: (isDualViewEnabled: boolean) => void;
}

export function createSpreadControls({ isDualViewEnabled, onToggle, onAdjust }: SpreadControlsProps): SpreadControlsComponent {
    const checkbox = createElement('input', {
      type: 'checkbox',
      checked: isDualViewEnabled,
      events: {
        change: function handleSpreadCheckboxChange(e: Event) {
          const target = e.currentTarget as HTMLInputElement;
          onToggle(target.checked);
          if (typeof target.blur === 'function') {
            target.blur();
          }
        }
      }
    }) as HTMLInputElement;
  
    const label = createElement('label', {
      className: 'comic-helper-label'
    }, [checkbox, t('ui.spread')]);
  
    const createAdjustBtn = function createAdjustBtn() {
      return createElement('button', {
        className: 'comic-helper-adjust-btn',
        textContent: t('ui.offset'),
        title: t('ui.shiftOffset'),
        events: {
          click: function handleAdjustClick(e: Event) {
            e.preventDefault();
            e.stopPropagation();
            onAdjust();
          }
        }
      });
    };
  
    let adjustBtn: HTMLElement | null = isDualViewEnabled ? createAdjustBtn() : null;
  
    const el = createElement('div', {
      style: { display: 'flex', alignItems: 'center' }
    }, [label]);
  
    if (adjustBtn) el.appendChild(adjustBtn);
  
    return {
      el,
      update: function updateSpreadControls(enabled: boolean) {
        checkbox.checked = enabled;
        if (enabled) {
          if (!adjustBtn) {
            adjustBtn = createAdjustBtn();
            el.appendChild(adjustBtn);
          }
        } else {
          if (adjustBtn) {
            adjustBtn.remove();
            adjustBtn = null;
          }
        }
      }
    };
  }
  