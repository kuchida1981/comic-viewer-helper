/**
 * @typedef {Object} ElementOptions
 * @property {string} [id]
 * @property {string} [className]
 * @property {string} [textContent]
 * @property {string} [title]
 * @property {string} [type]
 * @property {boolean} [checked]
 * @property {Partial<CSSStyleDeclaration>} [style]
 * @property {Record<string, string | number | boolean>} [attributes]
 * @property {Record<string, EventListenerOrEventListenerObject>} [events]
 */

/**
 * Helper to create DOM elements with options
 * @param {string} tag 
 * @param {ElementOptions} [options] 
 * @param {(HTMLElement | string | null)[]} [children] 
 * @returns {HTMLElement}
 */
export function createElement(tag, options = {}, children = []) {
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
