import { createElement } from '../utils';
import { t } from '../../i18n';

export interface AutoplayControlsProps {
  isAutoplayEnabled: boolean;
  autoplayInterval: number;
  onToggle: (enabled: boolean) => void;
  onChangeInterval: (interval: number) => void;
}

export interface AutoplayControlsComponent {
  el: HTMLElement;
  update: (enabled: boolean, interval: number) => void;
}

export function createAutoplayControls({
  isAutoplayEnabled,
  autoplayInterval,
  onToggle,
  onChangeInterval
}: AutoplayControlsProps): AutoplayControlsComponent {
  const checkbox = createElement('input', {
    type: 'checkbox',
    checked: isAutoplayEnabled,
    events: {
      change: (e) => {
        const target = e.currentTarget as HTMLInputElement;
        onToggle(target.checked);
        if (typeof target.blur === 'function') {
          target.blur();
        }
      }
    }
  }) as HTMLInputElement;

  const intervalInput = createElement('input', {
    type: 'number',
    className: 'comic-helper-autoplay-input',
    attributes: { min: 1, max: 99 },
    events: {
      change: (e) => {
        const target = e.currentTarget as HTMLInputElement;
        const val = parseInt(target.value, 10);
        if (!isNaN(val) && val >= 1) {
          onChangeInterval(val);
        }
      },
      keydown: (e) => {
        if (e instanceof KeyboardEvent && e.key === 'Enter') {
          intervalInput.blur();
        }
        e.stopPropagation();
      },
      focus: () => {
        intervalInput.select();
      }
    }
  }) as HTMLInputElement;

  intervalInput.value = String(autoplayInterval);

  const label = createElement('label', {
    className: 'comic-helper-label'
  }, [checkbox, t('ui.autoplay')]);

  const secLabel = createElement('span', {
    className: 'comic-helper-sec-label',
    textContent: t('ui.seconds')
  });

  const el = createElement('div', {
    className: 'comic-helper-autoplay-wrapper',
    style: { display: 'flex', alignItems: 'center' }
  }, [label, intervalInput, secLabel]);

  return {
    el,
    update: (enabled: boolean, interval: number) => {
      checkbox.checked = enabled;
      if (document.activeElement !== intervalInput) {
        intervalInput.value = String(interval);
      }
    }
  };
}
