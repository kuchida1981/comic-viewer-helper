import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createPowerButton } from './PowerButton.js';
import { createPageCounter } from './PageCounter.js';
import { createSpreadControls } from './SpreadControls.js';
import { createNavigationButtons } from './NavigationButtons.js';
import { createMetadataModal } from './MetadataModal.js';
import { createHelpModal } from './HelpModal.js';
import { createResumeNotification } from './ResumeNotification.js';
import { Metadata } from '../../types.js';

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
      const { el, input, update } = createPageCounter({ current: 1, total: 10, onJump: () => {} });
      update(5, 20);
      const totalLabel = el.querySelector('#comic-total-counter');
      expect(input.value).toBe('5');
      expect(totalLabel?.textContent).toBe(' / 20');

      // Should not update input value if focused
      input.focus();
      // Mock activeElement
      vi.stubGlobal('document', { activeElement: input });
      update(10, 20);
      expect(input.value).toBe('5');
      vi.unstubAllGlobals();
    });
  });

  describe('SpreadControls', () => {
    it('should render checkbox and label', () => {
      const { el } = createSpreadControls({ isDualViewEnabled: true, onToggle: () => {}, onAdjust: () => {} });
      const checkbox = el.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
      expect(el.textContent).toContain('Spread');
    });

    it('should render adjust button when dual view is enabled', () => {
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
      const checkbox = el.querySelector('input[type="checkbox"]') as HTMLInputElement;
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change'));
      expect(onToggle).toHaveBeenCalledWith(true);

      // Test branch with non-input target
      const event = new Event('change');
      Object.defineProperty(event, 'target', { value: {} });
      checkbox.dispatchEvent(event);
      // onToggle should NOT be called again with the new value
    });

    it('should call onAdjust when button is clicked', () => {
      const onAdjust = vi.fn();
      const { el } = createSpreadControls({ isDualViewEnabled: true, onToggle: () => {}, onAdjust });
      const adjustBtn = el.querySelector('.comic-helper-adjust-btn') as HTMLElement;
      adjustBtn.click();
      expect(onAdjust).toHaveBeenCalled();
    });
  });

  describe('NavigationButtons', () => {
    it('should render 8 navigation buttons', () => {
      const { elements } = createNavigationButtons({ onFirst: () => {}, onPrev: () => {}, onNext: () => {}, onLast: () => {}, onInfo: () => {}, onHelp: () => {}, onSearch: () => {}, onLucky: () => {} });
      expect(elements.length).toBe(8);
      expect(elements[0].textContent).toBe('<<');
      expect(elements[1].textContent).toBe('<');
      expect(elements[2].textContent).toBe('🎲');
      expect(elements[3].textContent).toBe('>');
      expect(elements[4].textContent).toBe('>>');
      expect(elements[5].textContent).toBe('Info');
      expect(elements[6].textContent).toBe('?');
      expect(elements[7].textContent).toBe('🔍');
    });

    it('should call correct actions and blur', () => {
      const actions = {
        onFirst: vi.fn(),
        onPrev: vi.fn(),
        onNext: vi.fn(),
        onLast: vi.fn(),
        onInfo: vi.fn(),
        onHelp: vi.fn(),
        onSearch: vi.fn(),
        onLucky: vi.fn()
      };
      const { elements } = createNavigationButtons(actions);
      
      const blurSpy = vi.spyOn(elements[0], 'blur');
      elements[0].click();
      expect(actions.onLast).toHaveBeenCalled();
      expect(blurSpy).toHaveBeenCalled();

      // Test branch where target is not HTMLElement
      const event = new MouseEvent('click');
      Object.defineProperty(event, 'target', { value: {} });
      elements[1].dispatchEvent(event);
      expect(actions.onNext).toHaveBeenCalled();
    });

    it('should have an empty update method', () => {
      const { update } = createNavigationButtons({ onFirst: () => {}, onPrev: () => {}, onNext: () => {}, onLast: () => {}, onInfo: () => {}, onHelp: () => {}, onSearch: () => {}, onLucky: () => {} });
      expect(typeof update).toBe('function');
      update();
    });
  });

  describe('MetadataModal', () => {
    const mockMetadata: Metadata = {
      title: 'Test Manga',
      tags: [{ text: 'Action', href: '#action', type: null }],
      relatedWorks: [{ title: 'Manga B', href: '#b', thumb: 'b.jpg', isPrivate: false }]
    };

    it('should render title and content', () => {
      const { el } = createMetadataModal({ metadata: mockMetadata, onClose: () => {}, onTagClick: () => Promise.resolve() });
      expect(el.textContent).toContain('Test Manga');
      expect(el.textContent).toContain('Action');
      expect(el.textContent).toContain('Manga B');
    });

    it('should call onClose when clicking overlay', () => {
      const onClose = vi.fn();
      const { el } = createMetadataModal({ metadata: mockMetadata, onClose, onTagClick: () => Promise.resolve() });
      el.click();
      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when clicking close button', () => {
      const onClose = vi.fn();
      const { el } = createMetadataModal({ metadata: mockMetadata, onClose, onTagClick: () => Promise.resolve() });
      const closeBtn = el.querySelector('.comic-helper-modal-close') as HTMLElement;
      closeBtn.click();
      expect(onClose).toHaveBeenCalled();
    });

    it('should not call onClose when clicking content', () => {
      const onClose = vi.fn();
      const { el } = createMetadataModal({ metadata: mockMetadata, onClose, onTagClick: () => Promise.resolve() });
      const content = el.querySelector('.comic-helper-modal-content') as HTMLElement;
      content.click();
      expect(onClose).not.toHaveBeenCalled();
    });

    it('should stop propagation when clicking tags or related items', () => {
      const onClose = vi.fn();
      const { el } = createMetadataModal({ metadata: mockMetadata, onClose, onTagClick: () => Promise.resolve() });
      
      const tag = el.querySelector('.comic-helper-tag-chip') as HTMLElement;
      tag.click();
      expect(onClose).not.toHaveBeenCalled();

      const related = el.querySelector('.comic-helper-related-item') as HTMLElement;
      related.click();
      expect(onClose).not.toHaveBeenCalled();
    });

    it('should call onTagClick when a tag is clicked', () => {
      const onTagClick = vi.fn();
      const { el } = createMetadataModal({ metadata: mockMetadata, onClose: () => {}, onTagClick });
      
      const tag = el.querySelector('.comic-helper-tag-chip') as HTMLElement;
      tag.click();
      
      expect(onTagClick).toHaveBeenCalledWith(mockMetadata.tags[0]);
    });

    it('should have an empty update method', () => {
      const { update } = createMetadataModal({ metadata: mockMetadata, onClose: () => {}, onTagClick: () => Promise.resolve() });
      expect(typeof update).toBe('function');
      update();
    });
  });

  describe('HelpModal', () => {
    it('should render shortcut list and handle Space label', () => {
      const { el } = createHelpModal({ onClose: () => {} });
      expect(el.textContent).toContain('Keyboard Shortcuts');
      expect(el.textContent).toContain('Next Page');
      expect(el.textContent).toContain('j');
      expect(el.textContent).toContain('Space');
    });

    it('should have an empty update method', () => {
      const { update } = createHelpModal({ onClose: () => {} });
      expect(typeof update).toBe('function');
      update();
    });

    it('should call onClose when clicking overlay', () => {
      const onClose = vi.fn();
      const { el } = createHelpModal({ onClose });
      el.click();
      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when clicking close button', () => {
      const onClose = vi.fn();
      const { el } = createHelpModal({ onClose });
      const closeBtn = el.querySelector('.comic-helper-modal-close') as HTMLElement;
      closeBtn.click();
      expect(onClose).toHaveBeenCalled();
    });

    it('should not call onClose when clicking content', () => {
      const onClose = vi.fn();
      const { el } = createHelpModal({ onClose });
      const content = el.querySelector('.comic-helper-modal-content') as HTMLElement;
      content.click();
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('ResumeNotification', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      // Mock console.log to suppress output during tests
      vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.useRealTimers();
    });

    it('should render message and buttons', () => {
      const { el } = createResumeNotification({
        savedIndex: 5,
        onResume: () => {},
        onSkip: () => {}
      });

      expect(el.textContent).toContain('6');
      expect(el.textContent).toContain('Continue');
      expect(el.textContent).toContain('Start Over');
      expect(el.textContent).toContain('×');
    });

    it('should call onResume and cleanup when continue button is clicked', () => {
      const onResume = vi.fn();
      const onSkip = vi.fn();
      const { el } = createResumeNotification({
        savedIndex: 5,
        onResume,
        onSkip
      });

      document.body.appendChild(el);

      const continueBtn = el.querySelector('.comic-helper-resume-continue') as HTMLElement;
      continueBtn.click();

      expect(onResume).toHaveBeenCalled();
      expect(onSkip).not.toHaveBeenCalled();
      expect(document.body.contains(el)).toBe(false);
    });

    it('should call onSkip and cleanup when skip button is clicked', () => {
      const onResume = vi.fn();
      const onSkip = vi.fn();
      const { el } = createResumeNotification({
        savedIndex: 5,
        onResume,
        onSkip
      });

      document.body.appendChild(el);

      const skipBtn = el.querySelector('.comic-helper-resume-skip') as HTMLElement;
      skipBtn.click();

      expect(onSkip).toHaveBeenCalled();
      expect(onResume).not.toHaveBeenCalled();
      expect(document.body.contains(el)).toBe(false);
    });

    it('should cleanup when close button is clicked', () => {
      const onResume = vi.fn();
      const onSkip = vi.fn();
      const { el } = createResumeNotification({
        savedIndex: 5,
        onResume,
        onSkip
      });

      document.body.appendChild(el);

      const closeBtn = el.querySelector('.comic-helper-resume-close') as HTMLElement;
      closeBtn.click();

      expect(onResume).not.toHaveBeenCalled();
      expect(onSkip).not.toHaveBeenCalled();
      expect(document.body.contains(el)).toBe(false);
    });

    it('should auto-cleanup after 15 seconds', () => {
      const { el } = createResumeNotification({
        savedIndex: 5,
        onResume: () => {},
        onSkip: () => {}
      });

      document.body.appendChild(el);
      expect(document.body.contains(el)).toBe(true);

      vi.advanceTimersByTime(15000);

      expect(document.body.contains(el)).toBe(false);
    });

    it('should cleanup on scroll after 1 second delay', () => {
      const { el } = createResumeNotification({
        savedIndex: 5,
        onResume: () => {},
        onSkip: () => {}
      });

      document.body.appendChild(el);

      // Scroll immediately should not remove element (scroll handler not yet registered)
      window.dispatchEvent(new Event('scroll'));
      expect(document.body.contains(el)).toBe(true);

      // After 1 second, scroll handler should be registered
      vi.advanceTimersByTime(1000);

      // Now scroll should remove element
      window.dispatchEvent(new Event('scroll'));
      expect(document.body.contains(el)).toBe(false);
    });

    it('should format message with correct page number', () => {
      const { el } = createResumeNotification({
        savedIndex: 0,
        onResume: () => {},
        onSkip: () => {}
      });

      // savedIndex 0 should show as page 1
      expect(el.textContent).toContain('1');

      const el2 = createResumeNotification({
        savedIndex: 9,
        onResume: () => {},
        onSkip: () => {}
      }).el;

      // savedIndex 9 should show as page 10
      expect(el2.textContent).toContain('10');
    });
  });
});