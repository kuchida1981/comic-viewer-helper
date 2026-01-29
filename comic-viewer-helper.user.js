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
  const STORAGE_KEY_DUAL_VIEW = 'comic-viewer-helper-dual-view';

  let pageCounter = null;
  let isDualViewEnabled = localStorage.getItem(STORAGE_KEY_DUAL_VIEW) === 'true';

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
    const container = document.querySelector(CONTAINER_SELECTOR);
    if (!container) return;

    // 1. Flatten DOM: Move all images back to container and remove wrappers
    const allImages = Array.from(container.querySelectorAll('img'));
    // Sort by current DOM position to maintain relative order before re-appending
    // (Though querySelectorAll usually returns document order, safety first if we moved things)
    allImages.forEach(img => container.appendChild(img));
    
    const wrappers = container.querySelectorAll('.comic-row-wrapper');
    wrappers.forEach(w => w.remove());

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Reset Container
    Object.assign(container.style, {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0',
      margin: '0',
      width: '100%',
      maxWidth: 'none'
    });

    // 2. Process Images
    for (let i = 0; i < allImages.length; i++) {
      const img = allImages[i];
      const isLandscape = img.naturalWidth > img.naturalHeight;
      
      // Determine if we should pair this image with the next
      // Conditions: Dual Mode ON, Not Landscape, Next exists, Next is Not Landscape
      let pairWithNext = false;
      if (isDualViewEnabled && !isLandscape && i + 1 < allImages.length) {
        const nextImg = allImages[i+1];
        const nextIsLandscape = nextImg.naturalWidth > nextImg.naturalHeight;
        if (!nextIsLandscape) {
          pairWithNext = true;
        }
      }

      if (pairWithNext) {
        const nextImg = allImages[i+1];
        
        // Create Wrapper
        const row = document.createElement('div');
        row.className = 'comic-row-wrapper';
        Object.assign(row.style, {
          display: 'flex',
          flexDirection: 'row-reverse', // Right-to-Left for Manga (Right: Older/i, Left: Newer/i+1)
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100vh', // Force full viewport height for the spread
          marginBottom: '0'
        });

        // Style Images for Spread
        [img, nextImg].forEach(im => {
          Object.assign(im.style, {
            maxWidth: '50%', // Each takes half width
            maxHeight: '100%',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            margin: '0'
          });
        });

        // Move images into row
        row.appendChild(img);     // i (Right due to row-reverse)
        row.appendChild(nextImg); // i+1 (Left due to row-reverse)
        container.appendChild(row);

        i++; // Skip next image since we processed it
      } else {
        // Single Page Mode (Normal or Landscape)
        Object.assign(img.style, {
          maxWidth: `${vw}px`,
          maxHeight: `${vh}px`,
          width: 'auto',
          height: 'auto',
          display: 'block',
          margin: '0 auto',
          flexShrink: '0',
          objectFit: 'contain' // Ensure aspect ratio is kept
        });
        
        // In dual mode, if we force single (landscape), maybe center it vertically in 100vh?
        // But original behavior was just max-width/height. Let's keep it consistent.
        // However, specifically for landscape in dual mode, the spec says "centered".
        // The original code centered horizontally via margin: 0 auto.
        // That is sufficient.
      }
    }
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
    
    let displayStr = `${current}`;
    
    // Check if the current image is part of a spread
    if (currentIndex !== -1) {
      const activeImg = imgs[currentIndex];
      const parent = activeImg.parentElement;
      if (parent && parent.classList.contains('comic-row-wrapper')) {
        // Find sibling in the same wrapper
        const siblings = Array.from(parent.children).filter(el => el.tagName === 'IMG');
        if (siblings.length > 1) {
          // Get indices of all images in this wrapper
          const indices = siblings.map(img => imgs.indexOf(img) + 1).sort((a, b) => a - b);
          if (indices.length > 0) {
            displayStr = `${indices[0]}-${indices[indices.length - 1]}`;
          }
        }
      }
    }

    pageCounter.textContent = `${displayStr} / ${total}`;
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

    // Create Dual View Toggle
    const toggleLabel = document.createElement('label');
    Object.assign(toggleLabel.style, {
      display: 'flex',
      alignItems: 'center',
      color: '#fff',
      fontSize: '12px',
      cursor: 'pointer',
      userSelect: 'none',
      marginRight: '8px'
    });
    
    const toggleInput = document.createElement('input');
    toggleInput.type = 'checkbox';
    toggleInput.checked = isDualViewEnabled;
    toggleInput.style.marginRight = '4px';
    toggleInput.addEventListener('change', (e) => {
      toggleDualView(e.target.checked);
      toggleInput.blur(); // Remove focus so space/arrow keys work immediately
    });

    toggleLabel.appendChild(toggleInput);
    toggleLabel.appendChild(document.createTextNode('Spread'));
    container.appendChild(toggleLabel);

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

    // Toggle Dual View
    if (e.key === 'd') {
      e.preventDefault();
      const newState = !isDualViewEnabled;
      // Update UI checkbox if it exists
      const checkbox = document.querySelector('input[type="checkbox"]');
      if (checkbox) checkbox.checked = newState;
      toggleDualView(newState);
    }
  }

  function toggleDualView(enabled) {
    isDualViewEnabled = enabled;
    localStorage.setItem(STORAGE_KEY_DUAL_VIEW, enabled);
    fitImagesToViewport();
    updatePageCounter();
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
    
    // Attach load listeners to ensure layout updates when dimensions are known
    const imgs = document.querySelectorAll(IMG_SELECTOR);
    imgs.forEach(img => {
      if (!img.complete) {
        img.addEventListener('load', () => {
           // Debounce or just call? Calling is safe as it's fast enough or we can use the resizeReq
           // Using the throttled resize handler logic for consistency
           if (resizeReq) cancelAnimationFrame(resizeReq);
           resizeReq = requestAnimationFrame(() => {
             fitImagesToViewport();
             updatePageCounter();
           });
        });
      }
    });

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
