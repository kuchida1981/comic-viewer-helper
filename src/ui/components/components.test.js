import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createPowerButton } from './PowerButton.js';
import { createPageCounter } from './PageCounter.js';
import { createSpreadControls } from './SpreadControls.js';
import { createNavigationButtons } from './NavigationButtons.js';
import { createMetadataModal } from './MetadataModal.js';
import { createHelpModal } from './HelpModal.js';
import { createResumeNotification } from './ResumeNotification.js';
import { createConfigModal } from './ConfigModal.js';

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
      const checkbox = /** @type {HTMLInputElement} */ (el.querySelector('input[type="checkbox"]'));
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

          const checkbox = /** @type {HTMLInputElement} */ (el.querySelector('input[type="checkbox"]'));

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

          const adjustBtn = /** @type {HTMLElement} */ (el.querySelector('.comic-helper-adjust-btn'));

          adjustBtn.click();

          expect(onAdjust).toHaveBeenCalled();

        });

      });

    

      describe('NavigationButtons', () => {

        it('should render 7 navigation buttons', () => {

          const { elements } = createNavigationButtons({ onFirst: () => {}, onPrev: () => {}, onNext: () => {}, onLast: () => {}, onInfo: () => {}, onHelp: () => {}, onConfig: () => {} });

          expect(elements.length).toBe(7);

          expect(elements[0].textContent).toBe('<<');

          expect(elements[1].textContent).toBe('<');

          expect(elements[2].textContent).toBe('>');

          expect(elements[3].textContent).toBe('>>');

          expect(elements[4].textContent).toBe('Info');

          expect(elements[5].textContent).toBe('?');

          expect(elements[6].textContent).toBe('⚙');

        });

    

        it('should call correct actions and blur', () => {

          const actions = {

            onFirst: vi.fn(),

            onPrev: vi.fn(),

            onNext: vi.fn(),

            onLast: vi.fn(),

            onInfo: vi.fn(),

            onHelp: vi.fn()

          };

          const { elements } = createNavigationButtons(actions);

          

          const blurSpy = vi.spyOn(elements[0], 'blur');

          elements[0].click(); 

          expect(actions.onFirst).toHaveBeenCalled();

          expect(blurSpy).toHaveBeenCalled();

    

          // Test branch where target is not HTMLElement

          const event = new MouseEvent('click');

          Object.defineProperty(event, 'target', { value: {} });

          elements[1].dispatchEvent(event);

          expect(actions.onPrev).toHaveBeenCalled();

        });

    

  

      it('should have an empty update method', () => {

        const { update } = createNavigationButtons({ onFirst: () => {}, onPrev: () => {}, onNext: () => {}, onLast: () => {}, onInfo: () => {}, onHelp: () => {} });

        expect(typeof update).toBe('function');

        update();

      });

    });

  

    describe('MetadataModal', () => {

      const mockMetadata = {

        title: 'Test Manga',

        tags: [{ text: 'Action', href: '#action', type: null }],

        relatedWorks: [{ title: 'Manga B', href: '#b', thumb: 'b.jpg' }]

      };

  

      it('should render title and content', () => {

        const { el } = createMetadataModal({ metadata: mockMetadata, onClose: () => {} });

        expect(el.textContent).toContain('Test Manga');

        expect(el.textContent).toContain('Action');

        expect(el.textContent).toContain('Manga B');

      });

  

      it('should call onClose when clicking overlay', () => {

        const onClose = vi.fn();

        const { el } = createMetadataModal({ metadata: mockMetadata, onClose });

        el.click();

        expect(onClose).toHaveBeenCalled();

      });

  

      it('should call onClose when clicking close button', () => {

        const onClose = vi.fn();

        const { el } = createMetadataModal({ metadata: mockMetadata, onClose });

        const closeBtn = /** @type {HTMLElement} */ (el.querySelector('.comic-helper-modal-close'));

        closeBtn.click();

        expect(onClose).toHaveBeenCalled();

      });

  

          it('should not call onClose when clicking content', () => {

  

            const onClose = vi.fn();

  

            const { el } = createMetadataModal({ metadata: mockMetadata, onClose });

  

            const content = el.querySelector('.comic-helper-modal-content');

  

            /** @type {HTMLElement} */ (content).click();

  

            expect(onClose).not.toHaveBeenCalled();

  

          });

  

      

  

          it('should stop propagation when clicking tags or related items', () => {

  

            const onClose = vi.fn();

  

            const { el } = createMetadataModal({ metadata: mockMetadata, onClose });

  

            

  

            const tag = /** @type {HTMLElement} */ (el.querySelector('.comic-helper-tag-chip'));

  

            tag.click();

  

            expect(onClose).not.toHaveBeenCalled();

  

      

  

                  const related = /** @type {HTMLElement} */ (el.querySelector('.comic-helper-related-item'));

  

      

  

                  related.click();

  

      

  

                  expect(onClose).not.toHaveBeenCalled();

  

      

  

                });

  

      

  

            

  

      

  

                      it('should have an empty update method', () => {

  

      

  

            

  

      

  

                

  

      

  

            

  

      

  

                        const { update } = createMetadataModal({ metadata: mockMetadata, onClose: () => {} });

  

      

  

            

  

      

  

                

  

      

  

            

  

      

  

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

  

      

  

            

  

      

  

                        const closeBtn = /** @type {HTMLElement} */ (el.querySelector('.comic-helper-modal-close'));

  

      

  

            

  

      

  

                        closeBtn.click();

  

      

  

            

  

      

  

                        expect(onClose).toHaveBeenCalled();

  

      

  

            

  

      

  

                      });

  

      

  

            

  

      

  

                

  

      

  

            

  

      

  

                      it('should not call onClose when clicking content', () => {

  

      

  

            

  

      

  

                        const onClose = vi.fn();

  

      

  

            

  

      

  

                        const { el } = createHelpModal({ onClose });

  

      

  

            

  

      

  

                        const content = el.querySelector('.comic-helper-modal-content');

  

      

  

            

  

      

  

                        /** @type {HTMLElement} */ (content).click();

  

      

  

            

  

      

  

                        expect(onClose).not.toHaveBeenCalled();

  

      

  

            

  

      

  

                      });

  

      

  

            

  

      

  

                        });

  

      

  

            

  

      

  

                      });

  

      

  

            

  

      

  

                    

  

      

  

            

  

      

  

                      describe('ConfigModal', () => {
        const defaultProps = {
          onClose: vi.fn(),
          isDualViewEnabled: false,
          guiPositionMode: /** @type {'remember' | 'fixed'} */ ('remember'),
          onDualViewChange: vi.fn(),
          onGuiPositionModeChange: vi.fn()
        };

        beforeEach(() => {
          defaultProps.onClose = vi.fn();
          defaultProps.onDualViewChange = vi.fn();
          defaultProps.onGuiPositionModeChange = vi.fn();
        });

        it('should render title and settings sections', () => {
          const { el } = createConfigModal(defaultProps);
          expect(el.textContent).toContain('Settings');
          expect(el.textContent).toContain('Display Settings');
          expect(el.textContent).toContain('Dual View');
          expect(el.textContent).toContain('GUI Position');
        });

        it('should call onClose when clicking overlay', () => {
          const { el } = createConfigModal(defaultProps);
          el.click();
          expect(defaultProps.onClose).toHaveBeenCalled();
        });

        it('should call onClose when clicking close button', () => {
          const { el } = createConfigModal(defaultProps);
          const closeBtn = /** @type {HTMLElement} */ (el.querySelector('.comic-helper-modal-close'));
          closeBtn.click();
          expect(defaultProps.onClose).toHaveBeenCalled();
        });

        it('should not call onClose when clicking content', () => {
          const { el } = createConfigModal(defaultProps);
          const content = el.querySelector('.comic-helper-modal-content');
          /** @type {HTMLElement} */ (content).click();
          expect(defaultProps.onClose).not.toHaveBeenCalled();
        });

        it('should initialize dualView toggle with correct checked state', () => {
          const { el } = createConfigModal({ ...defaultProps, isDualViewEnabled: true });
          const toggle = /** @type {HTMLInputElement} */ (el.querySelector('.comic-helper-config-toggle'));
          expect(toggle.checked).toBe(true);

          const { el: el2 } = createConfigModal({ ...defaultProps, isDualViewEnabled: false });
          const toggle2 = /** @type {HTMLInputElement} */ (el2.querySelector('.comic-helper-config-toggle'));
          expect(toggle2.checked).toBe(false);
        });

        it('should call onDualViewChange when toggle changes', () => {
          const { el } = createConfigModal(defaultProps);
          const toggle = /** @type {HTMLInputElement} */ (el.querySelector('.comic-helper-config-toggle'));
          toggle.checked = true;
          toggle.dispatchEvent(new Event('change'));
          expect(defaultProps.onDualViewChange).toHaveBeenCalledWith(true);
        });

        it('should initialize radio buttons with correct checked state', () => {
          const { el } = createConfigModal({ ...defaultProps, guiPositionMode: 'remember' });
          const radios = /** @type {NodeListOf<HTMLInputElement>} */ (el.querySelectorAll('.comic-helper-config-radio'));
          expect(radios[0].checked).toBe(true);   // remember
          expect(radios[1].checked).toBe(false);  // fixed

          const { el: el2 } = createConfigModal({ ...defaultProps, guiPositionMode: 'fixed' });
          const radios2 = /** @type {NodeListOf<HTMLInputElement>} */ (el2.querySelectorAll('.comic-helper-config-radio'));
          expect(radios2[0].checked).toBe(false); // remember
          expect(radios2[1].checked).toBe(true);  // fixed
        });

        it('should call onGuiPositionModeChange when radio changes', () => {
          const { el } = createConfigModal({ ...defaultProps, guiPositionMode: 'fixed' });
          const radios = /** @type {NodeListOf<HTMLInputElement>} */ (el.querySelectorAll('.comic-helper-config-radio'));
          // Select 'remember' radio
          radios[0].checked = true;
          radios[0].dispatchEvent(new Event('change'));
          expect(defaultProps.onGuiPositionModeChange).toHaveBeenCalledWith('remember');

          // Select 'fixed' radio
          defaultProps.onGuiPositionModeChange.mockClear();
          radios[1].checked = true;
          radios[1].dispatchEvent(new Event('change'));
          expect(defaultProps.onGuiPositionModeChange).toHaveBeenCalledWith('fixed');
        });

        it('should not call onGuiPositionModeChange if radio is not checked', () => {
          const { el } = createConfigModal(defaultProps);
          const radios = /** @type {NodeListOf<HTMLInputElement>} */ (el.querySelectorAll('.comic-helper-config-radio'));
          radios[0].checked = false;
          radios[0].dispatchEvent(new Event('change'));
          expect(defaultProps.onGuiPositionModeChange).not.toHaveBeenCalled();
        });

        it('update should sync toggle and radio states', () => {
          const { el, update } = createConfigModal(defaultProps);
          const toggle = /** @type {HTMLInputElement} */ (el.querySelector('.comic-helper-config-toggle'));
          const radios = /** @type {NodeListOf<HTMLInputElement>} */ (el.querySelectorAll('.comic-helper-config-radio'));

          update(true, 'fixed');
          expect(toggle.checked).toBe(true);
          expect(radios[0].checked).toBe(false); // remember
          expect(radios[1].checked).toBe(true);  // fixed

          update(false, 'remember');
          expect(toggle.checked).toBe(false);
          expect(radios[0].checked).toBe(true);  // remember
          expect(radios[1].checked).toBe(false); // fixed
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

      const continueBtn = /** @type {HTMLElement} */ (el.querySelector('.comic-helper-resume-continue'));
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

      const skipBtn = /** @type {HTMLElement} */ (el.querySelector('.comic-helper-resume-skip'));
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

      const closeBtn = /** @type {HTMLElement} */ (el.querySelector('.comic-helper-resume-close'));
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
