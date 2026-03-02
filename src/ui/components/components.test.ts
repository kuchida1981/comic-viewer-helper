import { describe, it, expect, vi } from 'vitest';
import { createPowerButton } from './PowerButton';
import { createPageCounter } from './PageCounter';
import { createSpreadControls } from './SpreadControls';
import { createAutoplayControls } from './AutoplayControls';
import { createNavigationButtons } from './NavigationButtons';
import { createProgressBar } from './ProgressBar';
import { createResumeNotification } from './ResumeNotification';
import { createLoadingIndicator } from './LoadingIndicator';

describe('UI Components', () => {
  describe('PowerButton', () => {
    it('should render correctly', () => {
      const onClick = vi.fn();
      const { el } = createPowerButton({ isEnabled: true, onClick });
      expect(el.className).toContain('comic-helper-power-btn');
      expect(el.classList.contains('enabled')).toBe(true);
      
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
    it('should render correctly', () => {
      const onJump = vi.fn();
      const { el, input } = createPageCounter({ current: 1, total: 10, onJump });
      expect(el.className).toContain('comic-helper-counter');
      expect(input.value).toBe('1');
      expect(el.textContent).toContain('/ 10');
    });

    it('should call onJump when enter is pressed', () => {
      const onJump = vi.fn();
      const { input } = createPageCounter({ current: 1, total: 10, onJump });
      input.value = '5';
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      expect(onJump).toHaveBeenCalledWith('5');
    });
  });

  describe('SpreadControls', () => {
    it('should render correctly', () => {
      const onToggle = vi.fn();
      const onAdjust = vi.fn();
      const { el } = createSpreadControls({ isDualViewEnabled: true, onToggle, onAdjust });
      const checkbox = el.querySelector('input') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
      
      checkbox.checked = false;
      checkbox.dispatchEvent(new Event('change'));
      expect(onToggle).toHaveBeenCalledWith(false);
    });

    it('should update state and show/hide adjust button', () => {
      const { el, update } = createSpreadControls({ isDualViewEnabled: true, onToggle: () => {}, onAdjust: () => {} });
      let adjustBtn = el.querySelector('.comic-helper-adjust-btn');
      expect(adjustBtn).not.toBeNull();
      expect(adjustBtn?.textContent).toBe('Offset');
      
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
      const checkbox = el.querySelector('input') as HTMLInputElement;
      
      checkbox.blur = vi.fn();
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      expect(onToggle).toHaveBeenCalledWith(true);
      expect(checkbox.blur).toHaveBeenCalled();
    });
  });

  describe('AutoplayControls', () => {
    it('should render correctly', () => {
      const { el } = createAutoplayControls({ isAutoplayEnabled: true, autoplayInterval: 3, onToggle: () => {}, onChangeInterval: () => {} });
      expect((el.querySelector('input[type="checkbox"]') as HTMLInputElement).checked).toBe(true);
      expect((el.querySelector('input[type="number"]') as HTMLInputElement).value).toBe('3');
    });
  });

  describe('NavigationButtons', () => {
    it('should render all buttons', () => {
      const mockProps = {
        onFirst: vi.fn(), onPrev: vi.fn(), onNext: vi.fn(), onLast: vi.fn(),
        onInfo: vi.fn(), onHelp: vi.fn(), onSearch: vi.fn(), onLucky: vi.fn(),
        onToggleFavorite: vi.fn()
      };
      const { elements } = createNavigationButtons(mockProps);
      expect(elements.length).toBe(9);
    });

    it('should handle favorite toggle', () => {
      const onToggleFavorite = vi.fn();
      const mockProps = {
        onFirst: vi.fn(), onPrev: vi.fn(), onNext: vi.fn(), onLast: vi.fn(),
        onInfo: vi.fn(), onHelp: vi.fn(), onSearch: vi.fn(), onLucky: vi.fn(),
        onToggleFavorite
      };
      const { elements, update } = createNavigationButtons(mockProps);
      const favBtn = elements.find(el => el.id === 'comic-helper-nav-fav') as HTMLElement;
      expect(favBtn).toBeDefined();
      expect(favBtn.textContent).toBe('♡');

      update(true, false);
      expect(favBtn.textContent).toBe('♥');
      expect(favBtn.classList.contains('active')).toBe(true);

      update(false, false);
      expect(favBtn.textContent).toBe('♡');
      expect(favBtn.classList.contains('inactive')).toBe(true);
    });
  });

  describe('ProgressBar', () => {
    it('should update width based on progress', () => {
      const { el, update } = createProgressBar();
      update(4, 10); // (4+1)/10 = 50%
      const fill = el.querySelector('.comic-helper-progress-fill') as HTMLElement;
      expect(fill.style.width).toBe('50%');
    });
  });

  describe('ResumeNotification', () => {
    it('should call onResume', () => {
      const onResume = vi.fn();
      const { el } = createResumeNotification({ savedIndex: 5, onResume, onSkip: () => {} });
      const btn = el.querySelector('button') as HTMLElement;
      btn.click();
      expect(onResume).toHaveBeenCalled();
    });
  });

  describe('LoadingIndicator', () => {
    it('should show/hide based on loading state', () => {
      const { el, update } = createLoadingIndicator({ isLoading: false });
      expect(el.classList.contains('visible')).toBe(false);
      update(true);
      expect(el.classList.contains('visible')).toBe(true);
    });
  });
});
