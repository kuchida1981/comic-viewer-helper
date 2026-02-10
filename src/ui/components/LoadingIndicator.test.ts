import { describe, it, expect } from 'vitest';
import { createLoadingIndicator } from './LoadingIndicator.js';

describe('LoadingIndicator', () => {
  it('should create loading indicator element', () => {
    const { el } = createLoadingIndicator({ isLoading: false });
    expect(el.id).toBe('comic-helper-loading');
    expect(el.children.length).toBe(2); // Spinner and Text
  });

  it('should reflect initial loading state', () => {
    const { el } = createLoadingIndicator({ isLoading: true });
    expect(el.classList.contains('visible')).toBe(true);
  });

  it('should update visibility', () => {
    const { el, update } = createLoadingIndicator({ isLoading: false });
    
    update(true);
    expect(el.classList.contains('visible')).toBe(true);
    
    update(false);
    expect(el.classList.contains('visible')).toBe(false);
  });
});
