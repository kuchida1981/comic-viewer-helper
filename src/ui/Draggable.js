/**
 * Enable dragging for an element
 */
export class Draggable {
  /**
   * @param {HTMLElement} element 
   * @param {Object} options
   * @param {Function} [options.onDragEnd]
   */
  constructor(element, options = {}) {
    this.element = element;
    this.onDragEnd = options.onDragEnd || (() => {});
    
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.initialTop = 0;
    this.initialLeft = 0;

    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);

    this.element.addEventListener('mousedown', this._onMouseDown);
  }

  /**
   * @param {MouseEvent} e 
   */
  _onMouseDown(e) {
    if (e.button !== 0 || (!(e.target instanceof HTMLElement))) return;
    // Only drag if clicking the container itself or a non-interactive child
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;

    this.isDragging = true;
    const rect = this.element.getBoundingClientRect();
    this.initialTop = rect.top;
    this.initialLeft = rect.left;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;

    // Set absolute positioning if not already set
    Object.assign(this.element.style, {
      top: `${this.initialTop}px`,
      left: `${this.initialLeft}px`,
      bottom: 'auto',
      right: 'auto'
    });

    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('mouseup', this._onMouseUp);
    e.preventDefault();
  }

  /**
   * Clamp the element's position to keep it within the viewport
   * @returns {{top: number, left: number}} The clamped position
   */
  clampToViewport() {
    const rect = this.element.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const padding = 10;

    let top = rect.top;
    let left = rect.left;

    // Boundary checks
    if (left < padding) left = padding;
    if (top < padding) top = padding;
    if (left + rect.width > vw - padding) left = vw - rect.width - padding;
    if (top + rect.height > vh - padding) top = vh - rect.height - padding;

    // Ensure it doesn't get pushed off the top/left if the window is smaller than the element
    if (left < padding) left = padding;
    if (top < padding) top = padding;

    Object.assign(this.element.style, {
      top: `${top}px`,
      left: `${left}px`,
      bottom: 'auto',
      right: 'auto'
    });

    return { top, left };
  }

  /**
   * @param {MouseEvent} e 
   */
  _onMouseMove(e) {
    if (!this.isDragging) return;
    const deltaX = e.clientX - this.dragStartX;
    const deltaY = e.clientY - this.dragStartY;
    this.element.style.top = `${this.initialTop + deltaY}px`;
    this.element.style.left = `${this.initialLeft + deltaX}px`;
    this.clampToViewport();
  }

  _onMouseUp() {
    if (!this.isDragging) return;
    this.isDragging = false;
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup', this._onMouseUp);

    const { top, left } = this.clampToViewport();
    this.onDragEnd(top, left);
  }

  destroy() {
    this.element.removeEventListener('mousedown', this._onMouseDown);
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup', this._onMouseUp);
  }
}
