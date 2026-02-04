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

  if (options.id) el.id = options.id;
  if (options.className) el.className = options.className;
  if (options.textContent) el.textContent = options.textContent;
  if (options.title) el.title = options.title;

  if (el instanceof HTMLInputElement) {
    if (options.type) el.type = options.type;
    if (options.checked !== undefined) el.checked = options.checked;
  }

  if (options.style) {
    Object.assign(el.style, options.style);
  }

  if (options.attributes) {
    for (const [key, value] of Object.entries(options.attributes)) {
      el.setAttribute(key, String(value));
    }
  }

  if (options.events) {
    for (const [type, listener] of Object.entries(options.events)) {
      el.addEventListener(type, listener);
    }
  }

  children.forEach(child => {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof HTMLElement) {
      el.appendChild(child);
    }
  });

  return el;
}
