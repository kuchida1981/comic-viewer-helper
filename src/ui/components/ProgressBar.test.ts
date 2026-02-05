import { describe, it, expect } from 'vitest';
import { createProgressBar } from './ProgressBar.js';

describe('ProgressBar', () => {
  it('should render progress bar container and fill', () => {
    const { el } = createProgressBar();
    expect(el.id).toBe('comic-helper-progress-bar');
    const bar = el.querySelector('.comic-helper-progress-fill');
    expect(bar).toBeTruthy();
  });

  it('should update progress width', () => {
    const { el, update } = createProgressBar();
    const bar = el.querySelector('.comic-helper-progress-fill') as HTMLElement;

    update(0, 10);
    expect(bar.style.width).toBe('10%');

    update(4, 10);
    expect(bar.style.width).toBe('50%');

    update(9, 10);
    expect(bar.style.width).toBe('100%');

    update(10, 10); // Edge case
    expect(bar.style.width).toBe('100%');
  });

  it('should handle zero total', () => {
    const { el, update } = createProgressBar();
    const bar = el.querySelector('.comic-helper-progress-fill') as HTMLElement;
    
    update(0, 0);
    expect(bar.style.width).toBe('');
  });
});