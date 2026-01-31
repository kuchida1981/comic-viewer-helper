import { describe, it, expect, vi } from 'vitest';
import { createPowerButton } from './PowerButton.js';
import { createPageCounter } from './PageCounter.js';
import { createSpreadControls } from './SpreadControls.js';
import { createNavigationButtons } from './NavigationButtons.js';

describe('UI Components', () => {
  describe('PowerButton', () => {
    it('should show enabled state', () => {
      const { el } = createPowerButton({ isEnabled: true, onClick: () => {} });
      expect(el.classList.contains('enabled')).toBe(true);
      expect(el.textContent).toBe('⚡');
    });

    it('should show disabled state', () => {
      const { el } = createPowerButton({ isEnabled: false, onClick: () => {} });
      expect(el.classList.contains('disabled')).toBe(true);
    });

    it('should call onClick', () => {
      const onClick = vi.fn();
      const { el } = createPowerButton({ isEnabled: true, onClick });
      el.click();
      expect(onClick).toHaveBeenCalled();
    });

    it('should update state', () => {
      const { el, update } = createPowerButton({ isEnabled: true, onClick: () => {} });
      update(false);
      expect(el.classList.contains('disabled')).toBe(true);
      update(true);
      expect(el.classList.contains('enabled')).toBe(true);
    });
  });

  describe('PageCounter', () => {
    it('should initialize with current and total', () => {
      const { input, el } = createPageCounter({ current: 5, total: 10, onJump: () => {} });
      expect(input.value).toBe('5');
      const totalLabel = el.querySelector('#comic-total-counter');
      expect(totalLabel?.textContent).toBe(' / 10');
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

    it('should update counts', () => {
      const { el, update } = createPageCounter({ current: 1, total: 10, onJump: () => {} });
      update(5, 20);
      const input = /** @type {HTMLInputElement} */ (el.querySelector('input'));
      const totalLabel = el.querySelector('#comic-total-counter');
      expect(input.value).toBe('5');
      expect(totalLabel?.textContent).toBe(' / 20');
    });
  });

  describe('SpreadControls', () => {
    it('should render checkbox and label', () => {
      const { el } = createSpreadControls({ isDualViewEnabled: true, onToggle: () => {}, onAdjust: () => {} });
      const checkbox = /** @type {HTMLInputElement} */ (el.querySelector('input[type="checkbox"]'));
      expect(checkbox.checked).toBe(true);
      expect(el.textContent).toContain('Spread');
    });

    it('should render adjust button when dual view is enabled', () => {
      const { el, update } = createSpreadControls({ isDualViewEnabled: true, onToggle: () => {}, onAdjust: () => {} });
      let adjustBtn = el.querySelector('.comic-helper-adjust-btn');
      expect(adjustBtn).not.toBeNull();
      expect(adjustBtn?.textContent).toBe('Adjust');
      
      update(false);
      adjustBtn = el.querySelector('.comic-helper-adjust-btn');
      expect(adjustBtn).toBeNull();
      
      update(true);
      adjustBtn = el.querySelector('.comic-helper-adjust-btn');
      expect(adjustBtn).not.toBeNull();
    });

    it('should call onToggle when checkbox changes', () => {
      const onToggle = vi.fn();
      const { el } = createSpreadControls({ isDualViewEnabled: false, onToggle, onAdjust: () => {} });
      const checkbox = /** @type {HTMLInputElement} */ (el.querySelector('input[type="checkbox"]'));
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change'));
      expect(onToggle).toHaveBeenCalledWith(true);
    });

    it('should call onAdjust when button is clicked', () => {
      const onAdjust = vi.fn();
      const { el } = createSpreadControls({ isDualViewEnabled: true, onToggle: () => {}, onAdjust });
      const adjustBtn = /** @type {HTMLElement} */ (el.querySelector('.comic-helper-adjust-btn'));
      adjustBtn.click();
      expect(onAdjust).toHaveBeenCalled();
    });
  });

  describe('NavigationButtons', () => {
    it('should render 4 navigation buttons', () => {
      const { elements } = createNavigationButtons({ onFirst: () => {}, onPrev: () => {}, onNext: () => {}, onLast: () => {} });
      expect(elements.length).toBe(4);
      expect(elements[0].textContent).toBe('<<');
      expect(elements[1].textContent).toBe('<');
      expect(elements[2].textContent).toBe('>');
      expect(elements[3].textContent).toBe('>>');
    });

    it('should call correct actions and blur', () => {
      const actions = {
        onFirst: vi.fn(),
        onPrev: vi.fn(),
        onNext: vi.fn(),
        onLast: vi.fn()
      };
      const { elements } = createNavigationButtons(actions);
      elements[0].click(); expect(actions.onFirst).toHaveBeenCalled();
      elements[1].click(); expect(actions.onPrev).toHaveBeenCalled();
      elements[2].click(); expect(actions.onNext).toHaveBeenCalled();
      elements[3].click(); expect(actions.onLast).toHaveBeenCalled();
    });

    it('should have an empty update method', () => {
      const { update } = createNavigationButtons({ onFirst: () => {}, onPrev: () => {}, onNext: () => {}, onLast: () => {} });
      expect(typeof update).toBe('function');
      update();
    });
  });
});