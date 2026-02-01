import { describe, it, expect } from 'vitest';
import { DefaultAdapter } from './DefaultAdapter';

describe('DefaultAdapter', () => {
  it('should match everything', () => {
    expect(DefaultAdapter.match('http://any.url')).toBe(true);
  });

  it('should have correct selectors', () => {
    expect(DefaultAdapter.selectors.container).toBe('#post-comic');
    expect(DefaultAdapter.selectors.images).toBe('#post-comic img');
  });
});
