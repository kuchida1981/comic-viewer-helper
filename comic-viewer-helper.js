// ==UserScript==
// @name         Magazine Comic Viewer Helper
// @namespace    https://something/
// @version      1.0.0
// @description  Fit comic images to viewport and scroll per image
// @match        https://something/magazine/*
// @match        https://something/fanzine/*
// @run-at       document-idle
// @grant        unsafeWindow
// ==/UserScript==

(function() {
  'use strict';
  console.log("Magazine Comic View Helper Loaded");

  const IMG_SELECTOR = '#post-comic img';

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
    const container = document.querySelector('#post-comic');
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
   * Key Handler
   * ========================= */
  function onKeyDown(e) {
    if (isInputField(e.target)) {
      return;
    }

    // Down
    if (
      e.key === 'ArrowDown' ||
      e.key === 'PageDown' ||
      (e.key === ' ' && !e.shiftKey)
    ) {
      e.preventDefault();
      scrollToImage(1);
    }

    // Up
    if (
      e.key === 'ArrowUp' ||
      e.key === 'PageUp' ||
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
    fitImagesToViewport();

    // Throttled resize handler
    let resizeReq;
    window.addEventListener('resize', () => {
      if (resizeReq) cancelAnimationFrame(resizeReq);
      resizeReq = requestAnimationFrame(fitImagesToViewport);
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
