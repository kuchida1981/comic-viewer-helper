// ==UserScript==
// @name         Magazine Comic View Helper (Logic)
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Internal module for comic viewer helper
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==

import { fitImagesToViewport, getPrimaryVisibleImageIndex, getImageElementByIndex, revertToOriginal } from './logic.js';

console.log("Magazine Comic View Helper Loaded");

const IMG_SELECTOR = '#post-comic img';
const CONTAINER_SELECTOR = '#post-comic';
const STORAGE_KEY_DUAL_VIEW = 'comic-viewer-helper-dual-view';
const STORAGE_KEY_GUI_POS = 'comic-viewer-helper-gui-pos';
const STORAGE_KEY_ENABLED = 'comic-viewer-helper-enabled';

/** @type {HTMLInputElement | null} */
let pageCounter = null;
let isDualViewEnabled = localStorage.getItem(STORAGE_KEY_DUAL_VIEW) === 'true';
let isEnabled = localStorage.getItem(STORAGE_KEY_ENABLED) !== 'false';
/** @type {HTMLImageElement[]} */
let originalImages = [];
let spreadOffset = 0;

/**
 * @param {EventTarget | null} target 
 * @returns {boolean}
 */
function isInputField(target) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target.isContentEditable
  );
}

/**
 * @returns {HTMLImageElement[]}
 */
function getImages() {
  if (originalImages.length > 0) return originalImages;
  return /** @type {HTMLImageElement[]} */ (Array.from(document.querySelectorAll(IMG_SELECTOR)));
}

/**
 * @returns {number}
 */
function getCurrentPageIndex() {
  const imgs = getImages();
  if (imgs.length === 0) return -1;
  const windowHeight = window.innerHeight;
  const centerLine = windowHeight / 2;
  let currentIndex = imgs.findIndex(img => {
    const rect = img.getBoundingClientRect();
    return rect.top <= centerLine && rect.bottom >= centerLine;
  });
  if (currentIndex === -1) {
     currentIndex = imgs.findIndex(img => {
       const rect = img.getBoundingClientRect();
       return rect.bottom > 0 && rect.top < windowHeight;
     });
  }
  return currentIndex;
}

  function updatePageCounter() {
    if (!isEnabled) return;
    if (!pageCounter) return;
    const imgs = getImages();
    const totalEl = document.getElementById('comic-total-counter');
    
    if (imgs.length === 0) {
      pageCounter.value = "0";
      if (totalEl) totalEl.textContent = ' / 0';
      return;
    }
    
    const currentIndex = getPrimaryVisibleImageIndex(imgs, window.innerHeight);
    const current = currentIndex !== -1 ? currentIndex + 1 : 1;
    const total = imgs.length;
    
    // Don't update if input is focused to avoid cursor jumping
    if (document.activeElement !== pageCounter) {
      pageCounter.value = current.toString();
    }
    if (totalEl) totalEl.textContent = ` / ${total}`;
  }

  /**
   * @param {string | number} pageNumber 
   */
  function jumpToPage(pageNumber) {
    if (!pageCounter) return;
    const imgs = getImages();
    const index = typeof pageNumber === 'string' ? parseInt(pageNumber, 10) - 1 : pageNumber - 1;
    const targetImg = getImageElementByIndex(imgs, index);
    
    if (targetImg) {
      targetImg.scrollIntoView({ behavior: 'smooth', block: 'center' });
      pageCounter.blur();
    } else {
      // Validation failure: revert to current page and show feedback
      updatePageCounter();
      pageCounter.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
      setTimeout(() => {
        if (pageCounter) pageCounter.style.backgroundColor = 'transparent';
      }, 500);
      pageCounter.blur();
    }
  }

  /**
   * @param {number} direction 
   */
  function scrollToImage(direction) {
    const imgs = getImages();
    if (imgs.length === 0) return;
    
    const currentIndex = getPrimaryVisibleImageIndex(imgs, window.innerHeight);
    let targetIndex = currentIndex + direction;

    // Boundary checks
    if (targetIndex < 0) targetIndex = 0;
    if (targetIndex >= imgs.length) targetIndex = imgs.length - 1;

    const prospectiveTargetImg = imgs[targetIndex];

    // In dual view, if the target is part of the same spread, advance to the next spread.
    if (isDualViewEnabled && direction !== 0 && currentIndex !== -1) {
         const currentImg = imgs[currentIndex];
         if (currentImg && prospectiveTargetImg && prospectiveTargetImg.parentElement === currentImg.parentElement && prospectiveTargetImg.parentElement?.classList.contains('comic-row-wrapper')) {
             // They are in the same spread. Move one more index.
             targetIndex += direction;
         }
    }
    
    // Clamp the final index and scroll to the target.
    const finalIndex = Math.max(0, Math.min(targetIndex, imgs.length - 1));
    const finalTarget = imgs[finalIndex];
    if (finalTarget) {
        finalTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

/**
 * @param {boolean} enabled 
 */
function toggleActivation(enabled) {
  const currentIndex = getPrimaryVisibleImageIndex(getImages(), window.innerHeight);
  isEnabled = enabled;
  localStorage.setItem(STORAGE_KEY_ENABLED, enabled.toString());

  if (enabled) {
    // Re-calculate offset if enabling for the first time or re-enabling
    if (currentIndex !== -1) {
        spreadOffset = currentIndex % 2;
    }
    fitImagesToViewport(CONTAINER_SELECTOR, spreadOffset, isDualViewEnabled);
    updatePageCounter();
    if (currentIndex !== -1) {
       const imgs = getImages();
       if (imgs[currentIndex]) imgs[currentIndex].scrollIntoView({ block: 'center' });
    }
  } else {
    revertToOriginal(getImages(), CONTAINER_SELECTOR);
  }
  createNavigationUI();
}

/**
 * @param {'start' | 'end'} position 
 */
function scrollToEdge(position) {
  const imgs = getImages();
  if (imgs.length === 0) return;
  const target = position === 'start' ? imgs[0] : imgs[imgs.length - 1];
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function createNavigationUI() {
  const existingStyle = document.getElementById('comic-helper-style');
  if (!existingStyle) {
    const style = document.createElement('style');
    style.id = 'comic-helper-style';
    style.textContent = `
      input::-webkit-outer-spin-button,
      input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      input[type=number] {
        -moz-appearance: textfield;
      }
    `;
    document.head.appendChild(style);
  }

  let container = /** @type {HTMLElement | null} */ (document.getElementById('comic-helper-ui'));
  if (!container) {
    container = document.createElement('div');
    container.id = 'comic-helper-ui';
    Object.assign(container.style, {
      position: 'fixed', bottom: '20px', right: '20px', zIndex: '10000',
      display: 'flex', gap: '8px', backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: '8px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
      cursor: 'move', userSelect: 'none', touchAction: 'none', alignItems: 'center',
      whiteSpace: 'nowrap', width: 'max-content'
    });

    const savedPos = loadGUIPosition();
    if (savedPos) {
      Object.assign(container.style, { top: `${savedPos.top}px`, left: `${savedPos.left}px`, bottom: 'auto', right: 'auto' });
    }

    let isDragging = false;
    /** @type {number} */ let dragStartX;
    /** @type {number} */ let dragStartY;
    /** @type {number} */ let initialTop;
    /** @type {number} */ let initialLeft;

    container.addEventListener('mousedown', (e) => {
      if (!container) return;
      if (e.button !== 0 || (!(e.target instanceof HTMLElement))) return;
      if (e.target.tagName !== 'DIV' && e.target !== container) return;
      isDragging = true;
      const rect = container.getBoundingClientRect();
      initialTop = rect.top; initialLeft = rect.left;
      dragStartX = e.clientX; dragStartY = e.clientY;
      Object.assign(container.style, { top: `${initialTop}px`, left: `${initialLeft}px`, bottom: 'auto', right: 'auto' });
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      e.preventDefault();
    });

    /** @param {MouseEvent} e */
    function onMouseMove(e) {
      if (!isDragging || !container) return;
      const deltaX = e.clientX - dragStartX;
      const deltaY = e.clientY - dragStartY;
      container.style.top = `${initialTop + deltaY}px`;
      container.style.left = `${initialLeft + deltaX}px`;
    }

    function onMouseUp() {
      if (!isDragging || !container) return;
      isDragging = false;
      const rect = container.getBoundingClientRect();
      saveGUIPosition(rect.top, rect.left);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
    document.body.appendChild(container);
  }

  container.innerHTML = '';

  // Toggle Button
  const powerBtn = document.createElement('button');
  powerBtn.textContent = '⚡';
  powerBtn.title = isEnabled ? 'Disable Comic Viewer Helper' : 'Enable Comic Viewer Helper';
  Object.assign(powerBtn.style, {
    cursor: 'pointer', border: 'none', background: 'transparent', 
    color: isEnabled ? '#4CAF50' : '#888', fontSize: '16px', padding: '0 4px',
    fontWeight: 'bold', marginRight: isEnabled ? '8px' : '0'
  });
  powerBtn.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation();
    toggleActivation(!isEnabled);
  });
  container.appendChild(powerBtn);

  if (!isEnabled) {
    container.style.padding = '4px 8px';
    return;
  }
  
  container.style.padding = '8px';
  
      const counterWrapper = document.createElement('span');
      Object.assign(counterWrapper.style, { color: '#fff', fontSize: '14px', fontWeight: 'bold', padding: '0 8px', display: 'flex', alignItems: 'center', userSelect: 'none' });
  
      pageCounter = /** @type {HTMLInputElement} */ (document.createElement('input'));
      pageCounter.type = 'number';
      pageCounter.min = "1";
      Object.assign(pageCounter.style, {
        width: '45px', background: 'transparent', border: '1px solid transparent', color: '#fff',
        fontSize: '14px', fontWeight: 'bold', textAlign: 'right', padding: '2px', outline: 'none',
        appearance: 'textfield', margin: '0'
      });
      // Hide spin buttons
          pageCounter.style.setProperty('-moz-appearance', 'textfield');
          
          pageCounter.addEventListener('focus', () => {
            if (pageCounter) {
                pageCounter.style.border = '1px solid #fff';
                pageCounter.style.background = 'rgba(255,255,255,0.1)';
                pageCounter.select();
            }
          });
          pageCounter.addEventListener('blur', () => { if (pageCounter) { pageCounter.style.border = '1px solid transparent'; pageCounter.style.background = 'transparent'; } });
          pageCounter.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && pageCounter) {
              e.preventDefault();
              jumpToPage(pageCounter.value);
            }
          });
      
          const totalCounter = document.createElement('span');      totalCounter.id = 'comic-total-counter';
      totalCounter.textContent = ' / 1';
  
      counterWrapper.appendChild(pageCounter);
      counterWrapper.appendChild(totalCounter);
      container.appendChild(counterWrapper);
  
      const toggleLabel = document.createElement('label');  Object.assign(toggleLabel.style, { display: 'flex', alignItems: 'center', color: '#fff', fontSize: '12px', cursor: 'pointer', userSelect: 'none', marginRight: '8px' });
      const toggleInput = document.createElement('input');
      toggleInput.type = 'checkbox';
      toggleInput.checked = isDualViewEnabled;
      toggleInput.style.marginRight = '4px';
      toggleInput.addEventListener('change', () => {
        toggleDualView(toggleInput.checked);
        toggleInput.blur();
      });  toggleLabel.appendChild(toggleInput);
  toggleLabel.appendChild(document.createTextNode('Spread'));
  container.appendChild(toggleLabel);

  // Adjust Button
  if (isDualViewEnabled) {
      const adjustBtn = document.createElement('button');
      adjustBtn.textContent = 'Adjust';
      adjustBtn.title = 'Adjust Spread Alignment';
      Object.assign(adjustBtn.style, {
           cursor: 'pointer', padding: '2px 6px', border: '1px solid #fff', 
           background: 'transparent', color: '#fff', borderRadius: '4px', 
           fontSize: '10px', marginLeft: '4px', fontWeight: 'normal'
      });
      adjustBtn.onmouseenter = () => adjustBtn.style.background = 'rgba(255,255,255,0.2)';
      adjustBtn.onmouseleave = () => adjustBtn.style.background = 'transparent';

      adjustBtn.addEventListener('click', (e) => {
          e.preventDefault(); e.stopPropagation();
          spreadOffset = spreadOffset === 0 ? 1 : 0;
          fitImagesToViewport(CONTAINER_SELECTOR, spreadOffset, isDualViewEnabled);
          updatePageCounter();
      });
      container.appendChild(adjustBtn);
  }

  const buttons = [
    { text: '<<', label: 'Go to First', action: () => scrollToEdge('start') },
    { text: '<', label: 'Go to Previous', action: () => scrollToImage(-1) },
    { text: '>', label: 'Go to Next', action: () => scrollToImage(1) },
    { text: '>>', label: 'Go to Last', action: () => scrollToEdge('end') }
  ];

  buttons.forEach(btnDef => {
    const btn = document.createElement('button');
    btn.textContent = btnDef.text; btn.title = btnDef.label;
    Object.assign(btn.style, { cursor: 'pointer', padding: '6px 12px', border: 'none', background: '#fff', color: '#333', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', minWidth: '50px' });
    btn.onmouseenter = () => btn.style.background = '#eee';
    btn.onmouseleave = () => btn.style.background = '#fff';
    btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); btnDef.action(); btn.blur(); });
    container.appendChild(btn);
  });
}

/**
 * @param {KeyboardEvent} e 
 */
function onKeyDown(e) {
  if (isInputField(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;

  if (!isEnabled) return;

  // Next Image
  if (
    ['ArrowDown', 'PageDown', 'ArrowRight', 'j'].includes(e.key) ||
    (e.key === ' ' && !e.shiftKey)
  ) {
    e.preventDefault();
    scrollToImage(1);
  }
  // Previous Image
  else if (
    ['ArrowUp', 'PageUp', 'ArrowLeft', 'k'].includes(e.key) ||
    (e.key === ' ' && e.shiftKey)
  ) {
    e.preventDefault();
    scrollToImage(-1);
  }
  // Toggle Dual View
  else if (e.key === 'd') {
    e.preventDefault();
    const newState = !isDualViewEnabled;
    const checkbox = /** @type {HTMLInputElement | null} */ (document.querySelector('input[type="checkbox"]'));
    if (checkbox) checkbox.checked = newState;
    toggleDualView(newState);
  }
}

/**
 * @param {boolean} enabled 
 */
function toggleDualView(enabled) {
  const currentIndex = getPrimaryVisibleImageIndex(getImages(), window.innerHeight);
  isDualViewEnabled = enabled;
  localStorage.setItem(STORAGE_KEY_DUAL_VIEW, enabled.toString());
  
  if (enabled) {
      if (currentIndex !== -1) {
          spreadOffset = currentIndex % 2;
      }
  }

  fitImagesToViewport(CONTAINER_SELECTOR, spreadOffset, isDualViewEnabled);
  updatePageCounter();
  createNavigationUI(); // Re-render UI to show/hide Adjust button

  if (currentIndex !== -1) {
    const imgs = getImages();
    const targetImg = imgs[currentIndex];
    if (targetImg) targetImg.scrollIntoView({ block: 'center' });
  }
}

/**
 * @param {number} top 
 * @param {number} left 
 */
function saveGUIPosition(top, left) { localStorage.setItem(STORAGE_KEY_GUI_POS, JSON.stringify({ top, left })); }

/**
 * @returns {{top: number, left: number} | null}
 */
function loadGUIPosition() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_GUI_POS);
    if (!saved) return null;
    const pos = JSON.parse(saved);
    const buffer = 50;
    if (pos.left < -buffer || pos.left > window.innerWidth + buffer || pos.top < -buffer || pos.top > window.innerHeight + buffer) return null;
    return pos;
  } catch { return null; }
}

function init() {
  const container = document.querySelector(CONTAINER_SELECTOR);
  if (!container) return;
  originalImages = /** @type {HTMLImageElement[]} */ (Array.from(document.querySelectorAll(IMG_SELECTOR)));
  const imgs = /** @type {NodeListOf<HTMLImageElement>} */ (document.querySelectorAll(IMG_SELECTOR));
  /** @type {number | undefined} */
  let resizeReq;
  imgs.forEach(img => {
    if (!img.complete) {
      img.addEventListener('load', () => {
         if (resizeReq) cancelAnimationFrame(resizeReq);
         resizeReq = requestAnimationFrame(() => { 
             if (isEnabled) {
               fitImagesToViewport(CONTAINER_SELECTOR, spreadOffset, isDualViewEnabled); updatePageCounter(); 
             }
         });
      });
    }
  });
  
  if (isEnabled) {
    fitImagesToViewport(CONTAINER_SELECTOR, spreadOffset, isDualViewEnabled);
  }
  
  createNavigationUI();
  
  if (isEnabled) {
    updatePageCounter();
  }
  
  window.addEventListener('resize', () => {
    if (!isEnabled) return;
    if (resizeReq) cancelAnimationFrame(resizeReq);
    resizeReq = requestAnimationFrame(() => { 
        fitImagesToViewport(CONTAINER_SELECTOR, spreadOffset, isDualViewEnabled); 
        updatePageCounter(); 
    });
  });
  /** @type {number | undefined} */
  let scrollReq;
  window.addEventListener('scroll', () => {
    if (!isEnabled) return;
    if (scrollReq) cancelAnimationFrame(scrollReq);
    scrollReq = requestAnimationFrame(updatePageCounter);
  });
  document.addEventListener('keydown', onKeyDown, true);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();