import { describe, it, expect, vi } from 'vitest';
import { createHelpModal } from './HelpModal';

describe('HelpModal', () => {
  it('should render and call onClose when close button or overlay is clicked', () => {
    const onClose = vi.fn();
    const { el } = createHelpModal({ onClose });

    expect(el.className).toContain('comic-helper-modal');
    expect(el.textContent).toContain('Shortcuts');

    // Click close button
    const closeBtn = el.querySelector('.comic-helper-modal-close') as HTMLElement;
    closeBtn.click();
    expect(onClose).toHaveBeenCalledTimes(1);

    // Click overlay
    el.click();
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('should append extraContent when provided', () => {
    const onClose = vi.fn();
    const extraEl = document.createElement('div');
    extraEl.id = 'extra-section';
    extraEl.textContent = 'Extra content';

    const { el } = createHelpModal({ onClose, extraContent: extraEl });

    expect(el.querySelector('#extra-section')).toBeTruthy();
    expect(el.textContent).toContain('Extra content');
  });

  it('should not append extraContent when not provided', () => {
    const { el } = createHelpModal({ onClose: vi.fn() });

    // Only close button, no extra sections
    const buttons = el.querySelectorAll('button');
    expect(buttons).toHaveLength(1);
  });

  it('should call update without error (no-op)', () => {
    const comp = createHelpModal({ onClose: vi.fn() });
    expect(() => comp.update()).not.toThrow();
  });
});
