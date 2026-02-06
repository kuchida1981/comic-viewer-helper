import { describe, it, expect, vi } from 'vitest';
import { createElement } from './utils.js';

describe('createElement (Safety)', () => {
  it('should handle null/undefined options safely', () => {
    // @ts-expect-error Testing runtime safety
    expect(createElement('div', null)).toBeInstanceOf(HTMLElement);
    expect(createElement('div', undefined)).toBeInstanceOf(HTMLElement);
  });

  it('should handle invalid attributes safely', () => {
    const el = createElement('div', {
      attributes: {
        'data-valid': 'true',
        // @ts-expect-error Testing runtime safety
        'data-null': null,
        // @ts-expect-error Testing runtime safety
        'data-undefined': undefined
      }
    });
    expect(el.getAttribute('data-valid')).toBe('true');
    // String(null) is 'null', String(undefined) is 'undefined'.
    // If we want to allow that, fine. But maybe we want to skip them?
    // Requirement says "safety". Usually skipping null/undefined attributes is better than 'null' string.
    // I will change implementation to skip null/undefined.
    expect(el.hasAttribute('data-null')).toBe(false);
    expect(el.hasAttribute('data-undefined')).toBe(false);
  });

  it('should handle invalid events safely', () => {
    const el = createElement('button', {
      events: {
        'click': vi.fn() as unknown as EventListener,
        // @ts-expect-error Testing runtime safety
        'mouseover': null,
        // @ts-expect-error Testing runtime safety
        'mouseout': undefined
      }
    });
    // Should not throw
    el.click(); // Valid one works
  });

  it('should handle invalid children safely', () => {
    const el = createElement('div', {}, [
      document.createElement('span'),
      null,
      undefined,
      'text',
      // @ts-expect-error Testing runtime safety
      123 // number treated as text? currently implementation only handles string or HTMLElement
    ]);
    
    // implementation:
    // children.forEach(child => {
    //   if (typeof child === 'string') { ... }
    //   else if (child instanceof HTMLElement) { ... }
    // });
    
    // number won't be appended. null/undefined won't be appended.
    // That seems safe enough, but explicit test ensures it remains so.
    
    expect(el.childNodes.length).toBe(2); // span + text
  });
});
