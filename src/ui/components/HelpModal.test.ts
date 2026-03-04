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
});
