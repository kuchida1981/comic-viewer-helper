import { describe, it, expect, vi } from 'vitest';
import { createPowerButton } from './PowerButton.js';
import { createPageCounter } from './PageCounter.js';

describe('UI Components', () => {
  describe('PowerButton', () => {
    it('should show enabled state', () => {
      const btn = createPowerButton({ isEnabled: true, onClick: () => {} });
      expect(btn.classList.contains('enabled')).toBe(true);
      expect(btn.textContent).toBe('⚡');
    });

    it('should show disabled state', () => {
      const btn = createPowerButton({ isEnabled: false, onClick: () => {} });
      expect(btn.classList.contains('disabled')).toBe(true);
    });

    it('should call onClick', () => {
      const onClick = vi.fn();
      const btn = createPowerButton({ isEnabled: true, onClick });
      btn.click();
      expect(onClick).toHaveBeenCalled();
    });
  });

  describe('PageCounter', () => {
    it('should initialize with current and total', () => {
      const { input, totalLabel } = createPageCounter({ current: 5, total: 10, onJump: () => {} });
      expect(input.value).toBe('5');
      expect(totalLabel.textContent).toBe(' / 10');
    });

    it('should call onJump on Enter key', () => {
      const onJump = vi.fn();
      const { input } = createPageCounter({ current: 1, total: 10, onJump });
      input.value = '7';
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      input.dispatchEvent(event);
      expect(onJump).toHaveBeenCalledWith('7');
    });
  });
});
