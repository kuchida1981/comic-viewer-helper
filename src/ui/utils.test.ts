// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { createElement } from './utils.js';

describe('ui/utils.js', () => {
  it('should create an element with basic options', () => {
    const el = createElement('div', { id: 'test', className: 'foo', textContent: 'hello' });
    expect(el.tagName).toBe('DIV');
    expect(el.id).toBe('test');
    expect(el.className).toBe('foo');
    expect(el.textContent).toBe('hello');
  });

  it('should apply styles', () => {
    const el = createElement('div', { style: { color: 'red', display: 'flex' } });
    expect(el.style.color).toBe('red');
    expect(el.style.display).toBe('flex');
  });

  it('should attach event listeners', () => {
    let clicked = false;
    const el = createElement('button', { events: { click: () => { clicked = true; } } });
    el.click();
    expect(clicked).toBe(true);
  });

  it('should append children', () => {
    const child = createElement('span', { textContent: 'child' });
    const el = createElement('div', {}, [child, 'text node']);
    expect(el.childNodes.length).toBe(2);
    expect(el.firstChild).toBe(child);
    if (!el.lastChild) throw new Error('lastChild should exist');
    expect(el.lastChild.textContent).toBe('text node');
  });

  it('should handle input specific options', () => {
    const input = /** @type {HTMLInputElement} */ (createElement('input', { type: 'checkbox', checked: true }));
        expect(input.type).toBe('checkbox');
        expect(input.checked).toBe(true);
      });
    
      it('should set attributes', () => {
        const el = createElement('div', { attributes: { 'data-test': 'value', 'aria-label': 'test' } });
        expect(el.getAttribute('data-test')).toBe('value');
        expect(el.getAttribute('aria-label')).toBe('test');
      });
    });
    