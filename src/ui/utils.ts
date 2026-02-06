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
 * Helper to create DOM elements with options
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options: ElementOptions = {},
  children: (HTMLElement | string | null | undefined)[] = []
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);

  // Safety fallback if options is null
  const opts = options || {};

  if (opts.id) el.id = opts.id;
  if (opts.className) el.className = opts.className;
  if (opts.textContent) el.textContent = opts.textContent;
  if (opts.title) el.title = opts.title;

  if (el instanceof HTMLInputElement) {
    if (opts.type) el.type = opts.type;
    if (opts.checked !== undefined) el.checked = opts.checked;
  }

  if (opts.style) {
    Object.assign(el.style, opts.style);
  }

  if (opts.attributes) {
    for (const [key, value] of Object.entries(opts.attributes)) {
      if (value !== null && value !== undefined) {
        el.setAttribute(key, String(value));
      }
    }
  }

  if (opts.events) {
    for (const [type, listener] of Object.entries(opts.events)) {
      if (listener) {
        el.addEventListener(type, listener);
      }
    }
  }

  if (children && Array.isArray(children)) {
    children.forEach(child => {
      if (typeof child === 'string') {
        el.appendChild(document.createTextNode(child));
      } else if (child instanceof HTMLElement) {
        el.appendChild(child);
      }
    });
  }

  return el;
}
