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
  const STORAGE_KEY_GUI_POS = 'comic-viewer-helper-gui-pos';

  let pageCounter = null;
  let isDualViewEnabled = localStorage.getItem(STORAGE_KEY_DUAL_VIEW) === 'true';
  let originalImages = []; // Cache original image order

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
   * @param {number} [alignmentIndex=-1] - The index of the image that MUST start a spread (be on the right)
   * ========================= */
  function fitImagesToViewport(alignmentIndex = -1) {
    const container = document.querySelector(CONTAINER_SELECTOR);
    if (!container) return;

    // 1. Flatten DOM: Restore all images to container in original order
    if (originalImages.length === 0) {
        // Fallback if init didn't capture (shouldn't happen usually)
        originalImages = Array.from(container.querySelectorAll('img'));
    }

    // Append images in original order. This moves them out of any wrappers and puts them at the end.
    // Since we do this for ALL images in correct order, the final DOM order is guaranteed.
    originalImages.forEach(img => container.appendChild(img));
    
    // Remove any empty wrappers left behind
    const wrappers = container.querySelectorAll('.comic-row-wrapper');
    wrappers.forEach(w => w.remove());

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    
    const allImages = [...originalImages];

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
    // We handle the alignment target (the page that MUST be the start of a spread/right side)
    // by ensuring that the page immediately BEFORE it is NOT paired with it.
    // So if i+1 is the alignment target, we force 'pairWithNext' to false.
    let alignIndex = (typeof alignmentIndex === 'number') ? alignmentIndex : -1;
    console.log(`[DEBUG] fitImagesToViewport: alignIndex=${alignIndex}`);

    for (let i = 0; i < allImages.length; i++) {
      const img = allImages[i];
      const isLandscape = img.naturalWidth > img.naturalHeight;
      
      // Determine if we should pair this image with the next
      // Conditions: 
      // 1. Dual Mode ON
      // 2. Not Landscape
      // 3. Next exists
      // 4. Next is Not Landscape
      // 5. Next is NOT the alignment target (if next is target, current must be single so target starts new pair)
      let pairWithNext = false;
      if (isDualViewEnabled && !isLandscape && i + 1 < allImages.length) {
        const nextImg = allImages[i+1];
        const nextIsLandscape = nextImg.naturalWidth > nextImg.naturalHeight;
        
        // If the next image is the one we want to align to (start a spread), 
        // we must NOT pair the current image with it. This forces the current image 
        // to be single (or end of previous flow), ensuring 'alignIndex' starts a new spread pair.
        const nextIsAlignmentTarget = (i + 1) === alignIndex;

        if (!nextIsLandscape && !nextIsAlignmentTarget) {
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
          
          // Force full viewport width regardless of parent container width
          width: '100vw',
          maxWidth: '100vw',
          marginLeft: 'calc(50% - 50vw)', // Center relative to viewport
          marginRight: 'calc(50% - 50vw)',
          
          height: '100vh', // Force full viewport height for the spread
          marginBottom: '0',
          position: 'relative',
          boxSizing: 'border-box'
        });

        // Style Images for Spread
        [img, nextImg].forEach(im => {
          Object.assign(im.style, {
            maxWidth: '50%',   // Limit to half width
            maxHeight: '100%', // Limit to full height
            width: 'auto',     // Maintain aspect ratio
            height: 'auto',    // Maintain aspect ratio
            objectFit: 'contain',
            margin: '0',
            display: 'block'
          });
        });

        // Move images into row
        row.appendChild(img);     // i (Right due to row-reverse)
        row.appendChild(nextImg); // i+1 (Left due to row-reverse)
        container.appendChild(row);

        i++; // Skip next image since we processed it
      } else {
        // Single Page Mode (Normal or Landscape)
        // Reset styles first to ensure clean state
        img.style.cssText = ''; 
        
        Object.assign(img.style, {
          maxWidth: `${vw}px`,
          maxHeight: `${vh}px`,
          width: 'auto',
          height: 'auto',
          display: 'block',
          margin: '0 auto',
          flexShrink: '0',
          objectFit: 'contain'
        });
      }
    }
  }

  /* =========================
   * Get image list
   * ========================= */
  function getImages() {
    if (originalImages.length > 0) return originalImages;
    return Array.from(document.querySelectorAll(IMG_SELECTOR));
  }

  /* =========================
   * Get current visible page index (0-based)
   * ========================= */
  function getCurrentPageIndex() {
    const imgs = getImages();
    if (imgs.length === 0) return -1;

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
    
    return currentIndex;
  }

  /* =========================
   * Get the index of the image that occupies the most vertical space in the viewport
   * ========================= */
  function getPrimaryVisibleImageIndex() {
    const imgs = getImages();
    if (imgs.length === 0) return -1;

    const windowHeight = window.innerHeight;
    let maxVisibleHeight = 0;
    let primaryIndex = -1;

    imgs.forEach((img, index) => {
      const rect = img.getBoundingClientRect();
      
      // Calculate visible height
      const visibleTop = Math.max(0, rect.top);
      const visibleBottom = Math.min(windowHeight, rect.bottom);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);

      if (visibleHeight > maxVisibleHeight) {
        maxVisibleHeight = visibleHeight;
        primaryIndex = index;
      }
    });

    // Fallback to center check if no clear winner (rare)
    if (primaryIndex === -1) {
      return getCurrentPageIndex();
    }

    return primaryIndex;
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

    const currentIndex = getCurrentPageIndex();
    
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
      boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
      cursor: 'move',
      userSelect: 'none',
      touchAction: 'none' // Prevent scrolling on touch devices during drag
    });

    // Restore position if saved
    const savedPos = loadGUIPosition();
    if (savedPos) {
      Object.assign(container.style, {
        top: `${savedPos.top}px`,
        left: `${savedPos.left}px`,
        bottom: 'auto',
        right: 'auto'
      });
    }

    // Drag Logic
    let isDragging = false;
    let dragStartX, dragStartY;
    let initialTop, initialLeft;

    container.addEventListener('mousedown', (e) => {
      // Only drag with left click and not on interactive elements
      if (e.button !== 0 || e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;

      isDragging = true;
      const rect = container.getBoundingClientRect();
      
      // Switch to top/left if not already
      initialTop = rect.top;
      initialLeft = rect.left;
      
      dragStartX = e.clientX;
      dragStartY = e.clientY;

      Object.assign(container.style, {
        top: `${initialTop}px`,
        left: `${initialLeft}px`,
        bottom: 'auto',
        right: 'auto'
      });

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      
      e.preventDefault();
    });

    function onMouseMove(e) {
      if (!isDragging) return;
      
      const deltaX = e.clientX - dragStartX;
      const deltaY = e.clientY - dragStartY;
      
      container.style.top = `${initialTop + deltaY}px`;
      container.style.left = `${initialLeft + deltaX}px`;
    }

    function onMouseUp() {
      if (!isDragging) return;
      isDragging = false;
      
      const rect = container.getBoundingClientRect();
      saveGUIPosition(rect.top, rect.left);
      
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

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
      e.key === 'j' ||
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
      e.key === 'k' ||
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
    // 1. Capture current page index before re-layout
    // Use the primary visible image (most screen real estate) as the anchor
    const currentIndex = getPrimaryVisibleImageIndex();
    console.log(`[DEBUG] toggleDualView: enabled=${enabled}, currentIndex=${currentIndex}`);

    // 2. Update state and layout
    // If enabling dual view, use the current index as the alignment target
    // so it becomes the start (right side) of the spread.
    isDualViewEnabled = enabled;
    localStorage.setItem(STORAGE_KEY_DUAL_VIEW, enabled);
    
    fitImagesToViewport(enabled ? currentIndex : -1);
    updatePageCounter();

    // 3. Restore position to the same page
    if (currentIndex !== -1) {
      const imgs = getImages();
      const targetImg = imgs[currentIndex];
      if (targetImg) {
        targetImg.scrollIntoView({ block: 'start' }); // Instant jump, no smooth scroll needed here
      }
    }
  }

  /* =========================
   * GUI Positioning Helpers
   * ========================= */
  function saveGUIPosition(top, left) {
    localStorage.setItem(STORAGE_KEY_GUI_POS, JSON.stringify({ top, left }));
  }

  function loadGUIPosition() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GUI_POS);
      if (!saved) return null;
      const pos = JSON.parse(saved);
      
      // Sanity check: ensure it's within viewport (at least partially)
      const buffer = 50;
      if (pos.left < -buffer || pos.left > window.innerWidth + buffer ||
          pos.top < -buffer || pos.top > window.innerHeight + buffer) {
        return null;
      }
      return pos;
    } catch (e) {
      return null;
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
    
    // Capture original image order
    originalImages = Array.from(document.querySelectorAll(IMG_SELECTOR));

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
