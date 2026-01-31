import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Draggable } from './Draggable.js';

describe('Draggable', () => {
  /** @type {HTMLElement} */
  let element;
  
  beforeEach(() => {
    element = document.createElement('div');
    element.style.width = '100px';
    element.style.height = '100px';
    element.style.position = 'fixed';
    document.body.appendChild(element);

    // Mock getBoundingClientRect as jsdom doesn't do layout
    element.getBoundingClientRect = vi.fn(() => (/** @type {DOMRect} */ ({
      width: 100,
      height: 100,
      top: parseInt(element.style.top || '0'),
      left: parseInt(element.style.left || '0'),
      right: parseInt(element.style.left || '0') + 100,
      bottom: parseInt(element.style.top || '0') + 100,
      x: parseInt(element.style.left || '0'),
      y: parseInt(element.style.top || '0'),
      toJSON: () => {}
    })));

    // Mock window dimensions
    vi.stubGlobal('innerWidth', 1000);
    vi.stubGlobal('innerHeight', 1000);
  });

  it('should clamp position to viewport with padding', () => {
    const draggable = new Draggable(element);
    
    // Test top-left out of bounds
    element.style.top = '-50px';
    element.style.left = '-50px';
    draggable.clampToViewport();
    
    expect(parseInt(element.style.top)).toBe(10);
    expect(parseInt(element.style.left)).toBe(10);

    // Test bottom-right out of bounds
    element.style.top = '1000px';
    element.style.left = '1000px';
    draggable.clampToViewport();
    
    // 1000 - 100 (width) - 10 (padding) = 890
    expect(parseInt(element.style.top)).toBe(890);
    expect(parseInt(element.style.left)).toBe(890);
  });

  it('should not push element off top/left if window is smaller than element', () => {
    vi.stubGlobal('innerWidth', 50);
    vi.stubGlobal('innerHeight', 50);
    
    const draggable = new Draggable(element);
    element.style.top = '0px';
    element.style.left = '0px';
    
    draggable.clampToViewport();
    
    expect(parseInt(element.style.top)).toBe(10);
    expect(parseInt(element.style.left)).toBe(10);
  });

  it('should call onDragEnd with clamped coordinates', () => {
    const onDragEnd = vi.fn();
    const draggable = new Draggable(element, { onDragEnd });
    
    // Simulate drag and release outside bounds
    draggable.isDragging = true;
    element.style.top = '2000px';
    element.style.left = '2000px';
    
    draggable._onMouseUp();
    
    expect(onDragEnd).toHaveBeenCalledWith(890, 890);
  });

  it('should not start dragging if right clicked', () => {
    const draggable = new Draggable(element);
    const event = new MouseEvent('mousedown', { button: 2 });
    element.dispatchEvent(event);
    expect(draggable.isDragging).toBe(false);
  });

  it('should not start dragging if clicking a button', () => {
    const button = document.createElement('button');
    element.appendChild(button);
    const draggable = new Draggable(element);
    const event = new MouseEvent('mousedown', { button: 0 });
    Object.defineProperty(event, 'target', { value: button });
    
    element.dispatchEvent(event);
    expect(draggable.isDragging).toBe(false);
  });

  it('should not start dragging if clicking an input element', () => {
    const input = document.createElement('input');
    element.appendChild(input);
    const draggable = new Draggable(element);
    const event = new MouseEvent('mousedown', { button: 0 });
    Object.defineProperty(event, 'target', { value: input });
    
    element.dispatchEvent(event);
    expect(draggable.isDragging).toBe(false);
  });

  it('should not start dragging if clicking a non-HTMLElement target', () => {
    const draggable = new Draggable(element);
    const event = new MouseEvent('mousedown', { button: 0 });
    // Simulate SVG or other non-HTMLElement if needed, or just null target
    Object.defineProperty(event, 'target', { value: document.createTextNode('text') });
    element.dispatchEvent(event);
    expect(draggable.isDragging).toBe(false);
  });

  it('should update position during mouse move', () => {
    new Draggable(element);
    
    // Start drag at (0, 0)
    const downEvent = new MouseEvent('mousedown', { clientX: 0, clientY: 0, button: 0 });
    element.dispatchEvent(downEvent);
    
    // Move to (50, 50)
    const moveEvent = new MouseEvent('mousemove', { clientX: 50, clientY: 50 });
    document.dispatchEvent(moveEvent);
    
    // element initialTop/Left was 0 (from mock)
    expect(element.style.top).toBe('50px');
    expect(element.style.left).toBe('50px');
  });

  it('should destroy correctly', () => {
    const removeSpy = vi.spyOn(element, 'removeEventListener');
    const draggable = new Draggable(element);
    draggable.destroy();
    expect(removeSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
  });

  it('should work without onDragEnd option', () => {
    const draggable = new Draggable(element);
    draggable.isDragging = true;
    draggable._onMouseUp();
    // Should not throw
  });

  it('should return early in onMouseMove if not dragging', () => {
    const draggable = new Draggable(element);
    draggable.isDragging = false;
    const initialTop = element.style.top;
    const event = new MouseEvent('mousemove');
    draggable._onMouseMove(event);
    expect(element.style.top).toBe(initialTop);
  });

  it('should return early in onMouseUp if not dragging', () => {
    const draggable = new Draggable(element);
    draggable.isDragging = false;
    const result = draggable._onMouseUp();
    expect(result).toBeUndefined();
  });
});
