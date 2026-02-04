export interface DraggableOptions {
  onDragEnd?: (top: number, left: number) => void;
}

/**
 * Enable dragging for an element
 */
export class Draggable {
  private element: HTMLElement;
  private onDragEnd: (top: number, left: number) => void;
  private isDragging: boolean;
  private dragStartX: number;
  private dragStartY: number;
  private initialTop: number;
  private initialLeft: number;

  constructor(element: HTMLElement, options: DraggableOptions = {}) {
    this.element = element;
    this.onDragEnd = options.onDragEnd || (() => { });

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

  private _onMouseDown(e: MouseEvent): void {
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
  clampToViewport(): { top: number; left: number } {
    const rect = this.element.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const padding = 10;

    let top = rect.top;
    let left = rect.left;

    // Boundary checks
    const maxTop = vh - rect.height - padding;
    const maxLeft = vw - rect.width - padding;

    top = Math.max(padding, Math.min(top, maxTop));
    left = Math.max(padding, Math.min(left, maxLeft));

    Object.assign(this.element.style, {
      top: `${top}px`,
      left: `${left}px`,
      bottom: 'auto',
      right: 'auto'
    });

    return { top, left };
  }

  private _onMouseMove(e: MouseEvent): void {
    if (!this.isDragging) return;
    const deltaX = e.clientX - this.dragStartX;
    const deltaY = e.clientY - this.dragStartY;
    this.element.style.top = `${this.initialTop + deltaY}px`;
    this.element.style.left = `${this.initialLeft + deltaX}px`;
    this.clampToViewport();
  }

  private _onMouseUp(): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup', this._onMouseUp);

    const { top, left } = this.clampToViewport();
    this.onDragEnd(top, left);
  }

  destroy(): void {
    this.element.removeEventListener('mousedown', this._onMouseDown);
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup', this._onMouseUp);
  }
}
