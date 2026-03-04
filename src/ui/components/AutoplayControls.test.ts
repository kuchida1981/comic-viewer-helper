import { describe, it, expect, vi } from 'vitest';
import { createAutoplayControls } from './AutoplayControls';

describe('AutoplayControls', () => {
  it('should render and handle events', () => {
    const onToggle = vi.fn();
    const onChangeInterval = vi.fn();
    
    const { el, update } = createAutoplayControls({
      isAutoplayEnabled: false,
      autoplayInterval: 5,
      onToggle,
      onChangeInterval
    });

    const checkbox = el.querySelector('input[type="checkbox"]') as HTMLInputElement;
    const numberInput = el.querySelector('input[type="number"]') as HTMLInputElement;

    // Toggle
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    expect(onToggle).toHaveBeenCalledWith(true);

    // Valid change
    numberInput.value = '10';
    numberInput.dispatchEvent(new Event('change', { bubbles: true }));
    expect(onChangeInterval).toHaveBeenCalledWith(10);

    // Keydown Enter
    numberInput.blur = vi.fn();
    numberInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(numberInput.blur).toHaveBeenCalled();

    // Keydown Other (stopPropagation)
    const stopSpy = vi.fn();
    const event = new KeyboardEvent('keydown', { key: 'a' });
    event.stopPropagation = stopSpy;
    numberInput.dispatchEvent(event);
    expect(stopSpy).toHaveBeenCalled();

    // Focus
    numberInput.select = vi.fn();
    numberInput.dispatchEvent(new FocusEvent('focus'));
    expect(numberInput.select).toHaveBeenCalled();

    // Update
    update(true, 8);
    expect(checkbox.checked).toBe(true);
  });
});
