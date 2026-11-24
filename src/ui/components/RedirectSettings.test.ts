import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRedirectSettings } from './RedirectSettings.js';

describe('RedirectSettings', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should render the checkbox reflecting the initial value', () => {
    const comp = createRedirectSettings({ isRedirectEnabled: true, onToggle: vi.fn() });
    const checkbox = comp.el.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('should call onToggle when the checkbox changes', () => {
    const onToggle = vi.fn();
    const comp = createRedirectSettings({ isRedirectEnabled: false, onToggle });
    const checkbox = comp.el.querySelector('input[type="checkbox"]') as HTMLInputElement;
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('should update the checkbox state', () => {
    const comp = createRedirectSettings({ isRedirectEnabled: false, onToggle: vi.fn() });
    comp.update(true);
    const checkbox = comp.el.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });
});
