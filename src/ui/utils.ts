export interface ElementOptions {
  id?: string;
  className?: string;
  textContent?: string;
  title?: string;
  type?: string;
  checked?: boolean;
  style?: Partial<CSSStyleDeclaration>;
  attributes?: Record<string, string | number | boolean>;
  events?: Record<string, EventListenerOrEventListenerObject>;
}

/**
 * Apply basic properties like id, class, textContent, and title
 */
function applyBasicProperties(el: HTMLElement, opts: ElementOptions): void {
  if (opts.id) el.id = opts.id;
  if (opts.className) el.className = opts.className;
  if (opts.textContent) el.textContent = opts.textContent;
  if (opts.title) el.title = opts.title;
}

/**
 * Apply input-specific properties
 */
function applyInputProperties(el: HTMLElement, opts: ElementOptions): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  if ((el as any).tagName === 'INPUT') {
    const input = el as HTMLInputElement;
    if (opts.type) input.type = opts.type;
    if (opts.checked !== undefined) input.checked = opts.checked;
  }
}

/**
 * Apply attributes to the element
 */
function applyAttributes(el: HTMLElement, attributes?: Record<string, string | number | boolean>): void {
  if (!attributes) return;
  for (const [key, value] of Object.entries(attributes)) {
    if (value !== null && value !== undefined) {
      el.setAttribute(key, String(value));
    }
  }
}

/**
 * Apply event listeners to the element
 */
function applyEvents(el: HTMLElement, events?: Record<string, EventListenerOrEventListenerObject>): void {
  if (!events) return;
  for (const [type, listener] of Object.entries(events)) {
    el.addEventListener(type, listener);
  }
}

/**
 * Append children to the element
 */
function appendChildren(el: HTMLElement, children: (Element | string | null | undefined)[]): void {
  children.forEach(child => {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof Element) {
      el.appendChild(child);
    }
  });
}

/**
 * Helper to create DOM elements with options
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options: ElementOptions = {},
  children: (Element | string | null | undefined)[] = []
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  // Ensure options is an object even if null is passed (for safety/tests)
   
  const opts = (options || {}) as ElementOptions;

  applyBasicProperties(el, opts);
  applyInputProperties(el, opts);

  if (opts.style) {
    Object.assign(el.style, opts.style);
  }

  applyAttributes(el, opts.attributes);
  applyEvents(el, opts.events);
  appendChildren(el, children);

  return el;
}