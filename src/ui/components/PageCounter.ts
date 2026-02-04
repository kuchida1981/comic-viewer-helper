import { createElement } from '../utils';

export interface PageCounterProps {
  current: number;
  total: number;
  onJump: (value: string) => void;
}

export interface PageCounterComponent {
  el: HTMLElement;
  input: HTMLInputElement;
  update: (current: number, total: number) => void;
}

export function createPageCounter({ current, total, onJump }: PageCounterProps): PageCounterComponent {
  const input = createElement('input', {
    type: 'number',
    className: 'comic-helper-page-input',
    attributes: { min: 1 },
    events: {
      keydown: (e) => {
        if (e instanceof KeyboardEvent && e.key === 'Enter') {
          e.preventDefault();
          onJump(input.value);
        }
      },
      focus: () => {
        input.select();
      }
    }
  }) as HTMLInputElement;

  input.value = String(current);

  const totalLabel = createElement('span', {
    id: 'comic-total-counter',
    textContent: ` / ${total}`
  });

  const el = createElement('span', {
    className: 'comic-helper-counter-wrapper'
  }, [input, totalLabel]);

  return {
    el,
    input,
    update: (newCurrent: number, newTotal: number) => {
      if (document.activeElement !== input) {
        input.value = String(newCurrent);
      }
      totalLabel.textContent = ` / ${newTotal}`;
    }
  };
}