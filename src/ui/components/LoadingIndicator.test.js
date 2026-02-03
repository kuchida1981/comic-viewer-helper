import { describe, it, expect, vi } from 'vitest';
import { createLoadingIndicator } from './LoadingIndicator.js';
import { createElement } from '../utils.js';

vi.mock('../utils.js', () => ({
  createElement: vi.fn((tag, props) => {
    const el = {
      tagName: tag.toUpperCase(),
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn(c => el.className.includes(c))
      },
      appendChild: vi.fn(),
      ...props,
      className: props?.className || ''
    };
    return el;
  })
}));

describe('LoadingIndicator', () => {
  it('should create loading indicator element', () => {
    const { el } = createLoadingIndicator({ isLoading: false });
    expect(createElement).toHaveBeenCalledWith('div', { id: 'comic-helper-loading' });
    expect(el.appendChild).toHaveBeenCalledTimes(2);
  });

  it('should reflect initial loading state', () => {
    const { el } = createLoadingIndicator({ isLoading: true });
    expect(el.classList.add).toHaveBeenCalledWith('visible');
  });

  it('should update visibility', () => {
    const { el, update } = createLoadingIndicator({ isLoading: false });
    
    update(true);
    expect(el.classList.add).toHaveBeenCalledWith('visible');
    
    update(false);
    expect(el.classList.remove).toHaveBeenCalledWith('visible');
  });
});
