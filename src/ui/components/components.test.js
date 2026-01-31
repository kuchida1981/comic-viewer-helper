import { describe, it, expect, vi } from 'vitest';
import { createPowerButton } from './PowerButton.js';
import { createPageCounter } from './PageCounter.js';
import { createSpreadControls } from './SpreadControls.js';
import { createNavigationButtons } from './NavigationButtons.js';

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

    it('should call select on focus', () => {
      const { input } = createPageCounter({ current: 1, total: 10, onJump: () => {} });
      const selectSpy = vi.spyOn(input, 'select');
      input.dispatchEvent(new FocusEvent('focus'));
      expect(selectSpy).toHaveBeenCalled();
    });
  });

  describe('SpreadControls', () => {
    it('should render checkbox and label', () => {
      const { label } = createSpreadControls({ isDualViewEnabled: true, onToggle: () => {}, onAdjust: () => {} });
      const checkbox = /** @type {HTMLInputElement} */ (label.querySelector('input[type="checkbox"]'));
      expect(checkbox.checked).toBe(true);
      expect(label.textContent).toContain('Spread');
    });

    it('should render adjust button when dual view is enabled', () => {
      const { adjustBtn } = createSpreadControls({ isDualViewEnabled: true, onToggle: () => {}, onAdjust: () => {} });
      if (!adjustBtn) throw new Error('adjustBtn should exist');
      expect(adjustBtn.textContent).toBe('Adjust');
    });

    it('should NOT render adjust button when dual view is disabled', () => {
      const { adjustBtn } = createSpreadControls({ isDualViewEnabled: false, onToggle: () => {}, onAdjust: () => {} });
      expect(adjustBtn).toBeNull();
    });

    it('should call onToggle when checkbox changes', () => {
      const onToggle = vi.fn();
      const { label } = createSpreadControls({ isDualViewEnabled: false, onToggle, onAdjust: () => {} });
      const checkbox = /** @type {HTMLInputElement} */ (label.querySelector('input[type="checkbox"]'));
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change'));
      expect(onToggle).toHaveBeenCalledWith(true);
    });

    it('should call onAdjust when button is clicked', () => {
      const onAdjust = vi.fn();
      const { adjustBtn } = createSpreadControls({ isDualViewEnabled: true, onToggle: () => {}, onAdjust });
      if (!adjustBtn) throw new Error('adjustBtn should exist');
      adjustBtn.click();
      expect(onAdjust).toHaveBeenCalled();
    });
  });

  describe('NavigationButtons', () => {
    it('should render 4 navigation buttons', () => {
      const btns = createNavigationButtons({ onFirst: () => {}, onPrev: () => {}, onNext: () => {}, onLast: () => {} });
      expect(btns.length).toBe(4);
      expect(btns[0].textContent).toBe('<<');
      expect(btns[1].textContent).toBe('<');
      expect(btns[2].textContent).toBe('>');
      expect(btns[3].textContent).toBe('>>');
    });

    it('should call correct actions', () => {
      const actions = {
        onFirst: vi.fn(),
        onPrev: vi.fn(),
        onNext: vi.fn(),
        onLast: vi.fn()
      };
      const btns = createNavigationButtons(actions);
      btns[0].click(); expect(actions.onFirst).toHaveBeenCalled();
      btns[1].click(); expect(actions.onPrev).toHaveBeenCalled();
      btns[2].click(); expect(actions.onNext).toHaveBeenCalled();
      btns[3].click(); expect(actions.onLast).toHaveBeenCalled();
    });
  });
});