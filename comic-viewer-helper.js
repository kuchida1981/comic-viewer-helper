// ==UserScript==
// @name         Magazine Comic Viewer Helper
// @namespace    https://something/
// @version      1.0.0
// @description  A Tampermonkey script for specific comic sites that fits images to the viewport and enables precise image-by-image scrolling.
// @match        https://something/magazine/*
// @match        https://something/fanzine/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function() {
  'use strict';
  console.log("Magazine Comic View Helper Loaded");

  const IMG_SELECTOR = '#post-comic img';
  const CONTAINER_SELECTOR = '#post-comic';

  let pageCounter = null;

  /**
   * Check if the target element is an input field.
   * @param {HTMLElement} target
   * @returns {boolean}
   */
  function isInputField(target) {
    return (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      target.isContentEditable
    );
  }

  /* =========================
   * Fit images to viewport
   * ========================= */
  function fitImagesToViewport() {
    const imgs = document.querySelectorAll(IMG_SELECTOR);
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Ensure the container is centered and has no extra padding
    const container = document.querySelector(CONTAINER_SELECTOR);
    if (container) {
      Object.assign(container.style, {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0',
        margin: '0',
        width: '100%',
        maxWidth: 'none'
      });
    }

    imgs.forEach(img => {
      Object.assign(img.style, {
        maxWidth: `${vw}px`,
        maxHeight: `${vh}px`,
        width: 'auto',
        height: 'auto',
        display: 'block',
        margin: '0 auto',
        flexShrink: '0'
      });
    });
  }

  /* =========================
   * Get image list
   * ========================= */
  function getImages() {
    return Array.from(document.querySelectorAll(IMG_SELECTOR));
  }

  /* =========================
   * Update Page Counter
   * ========================= */
  function updatePageCounter() {
    if (!pageCounter) return;

    const imgs = getImages();
    if (imgs.length === 0) {
      pageCounter.textContent = '0 / 0';
      return;
    }

    const windowHeight = window.innerHeight;
    const centerLine = windowHeight / 2;

    // Find the image closest to the center of the viewport
    let currentIndex = imgs.findIndex(img => {
      const rect = img.getBoundingClientRect();
      // An image is considered "active" if it covers the center line of the viewport
      return rect.top <= centerLine && rect.bottom >= centerLine;
    });

    // Fallback: If no image covers the center (e.g. gaps), find the one closest to top
    if (currentIndex === -1) {
       currentIndex = imgs.findIndex(img => {
         const rect = img.getBoundingClientRect();
         return rect.bottom > 0 && rect.top < windowHeight;
       });
    }

    // Display 1-based index
    const current = currentIndex !== -1 ? currentIndex + 1 : 1;
    const total = imgs.length;

    pageCounter.textContent = `${current} / ${total}`;
  }

  /* =========================
   * Snap to the top of the next/previous image
   * ========================= */
  function scrollToImage(direction) {
    const imgs = getImages();
    if (imgs.length === 0) return;

    // Use a small threshold to find the next/prev target relative to current view
    const THRESHOLD = 5;
    let targetImg = null;

    if (direction > 0) {
      // Down: Find the first image whose top is below the current viewport top
      targetImg = imgs.find(img => {
        const rect = img.getBoundingClientRect();
        return rect.top > THRESHOLD;
      });
    } else {
      // Up: Find the last image whose top is above the current viewport top
      // (checking reverse list)
      const prevImgs = [...imgs].reverse();
      targetImg = prevImgs.find(img => {
        const rect = img.getBoundingClientRect();
        return rect.top < -THRESHOLD;
      });
    }

    if (targetImg) {
      targetImg.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  /* =========================
   * Scroll to the first or last image
   * ========================= */
  function scrollToEdge(position) {
    const imgs = getImages();
    if (imgs.length === 0) return;
    
    const target = position === 'start' ? imgs[0] : imgs[imgs.length - 1];
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  /* =========================
   * Create Navigation UI
   * ========================= */
  function createNavigationUI() {
    const container = document.createElement('div');
    Object.assign(container.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: '10000',
      display: 'flex',
      gap: '8px',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: '8px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
    });

    // Create Page Counter
    pageCounter = document.createElement('span');
    Object.assign(pageCounter.style, {
      color: '#fff',
      fontSize: '14px',
      fontWeight: 'bold',
      padding: '0 8px',
      display: 'flex',
      alignItems: 'center',
      userSelect: 'none',
      minWidth: '60px',
      justifyContent: 'center'
    });
    pageCounter.textContent = '1 / 1';
    container.appendChild(pageCounter);

    const buttons = [
      { text: '<<', label: 'Go to First', action: () => scrollToEdge('start') },
      { text: '<', label: 'Go to Previous', action: () => scrollToImage(-1) },
      { text: '>', label: 'Go to Next', action: () => scrollToImage(1) },
      { text: '>>', label: 'Go to Last', action: () => scrollToEdge('end') }
    ];

    buttons.forEach(btnDef => {
      const btn = document.createElement('button');
      btn.textContent = btnDef.text;
      btn.title = btnDef.label;
      Object.assign(btn.style, {
        cursor: 'pointer',
        padding: '6px 12px',
        border: 'none',
        background: '#fff',
        color: '#333',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold',
        minWidth: '50px'
      });
      
      // Add hover effect
      btn.onmouseenter = () => btn.style.background = '#eee';
      btn.onmouseleave = () => btn.style.background = '#fff';

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        btnDef.action();
        btn.blur();
      });
      container.appendChild(btn);
    });

    document.body.appendChild(container);
  }

  /* =========================
   * Key Handler
   * ========================= */
  function onKeyDown(e) {
    if (isInputField(e.target)) {
      return;
    }

    // Ignore if modifier keys are pressed (to avoid conflicting with browser shortcuts)
    if (e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }

    // Down / Next
    if (
      e.key === 'ArrowDown' ||
      e.key === 'PageDown' ||
      e.key === 'ArrowRight' ||
      (e.key === ' ' && !e.shiftKey)
    ) {
      e.preventDefault();
      scrollToImage(1);
    }

    // Up / Prev
    if (
      e.key === 'ArrowUp' ||
      e.key === 'PageUp' ||
      e.key === 'ArrowLeft' ||
      (e.key === ' ' && e.shiftKey)
    ) {
      e.preventDefault();
      scrollToImage(-1);
    }
  }

  /* =========================
   * Initialization
   * ========================= */
  function init() {
    const container = document.querySelector(CONTAINER_SELECTOR);
    if (!container) {
      console.warn("Magazine Comic View Helper: Target container (#post-comic) not found. Skipping initialization.");
      return;
    }

    console.log("Magazine Comic View Helper Loaded");
    fitImagesToViewport();
    createNavigationUI();
    updatePageCounter();

    // Throttled resize handler
    let resizeReq;
    window.addEventListener('resize', () => {
      if (resizeReq) cancelAnimationFrame(resizeReq);
      resizeReq = requestAnimationFrame(() => {
        fitImagesToViewport();
        updatePageCounter();
      });
    });

    // Throttled scroll handler for page counter
    let scrollReq;
    window.addEventListener('scroll', () => {
      if (scrollReq) cancelAnimationFrame(scrollReq);
      scrollReq = requestAnimationFrame(updatePageCounter);
    });

    document.addEventListener('keydown', onKeyDown, true);
  }

  // Handle late DOM loading
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
