import { describe, it, expect, vi } from 'vitest';
import { createPageCounter } from './PageCounter';

describe('PageCounter', () => {
  it('should handle value change and jump on Enter', () => {
    const onJump = vi.fn();
    const { input, update } = createPageCounter({ current: 1, total: 10, onJump });

    input.value = '5';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(onJump).toHaveBeenCalledWith('5');

    // Update
    update(3, 10);
    expect(input.value).toBe('3');
  });

  it('should call onJump even with different casing or properties', () => {
    const onJump = vi.fn();
    const { input } = createPageCounter({ current: 1, total: 10, onJump });
    
    input.value = '10';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(onJump).toHaveBeenCalledWith('10');
  });

  it('should handle Escape key (just ensuring no error)', () => {
    const { input } = createPageCounter({ current: 1, total: 10, onJump: vi.fn() });
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  });
});
