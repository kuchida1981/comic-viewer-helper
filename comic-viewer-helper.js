// ==UserScript==
// @name         Magazine Comic Viewer Helper
// @namespace    https://something/
// @version      1.0.0
// @description  Fit comic images to viewport and scroll per image
// @match        https://something/magazine/*
// @run-at       document-idle
// @grant        unsafeWindow
// ==/UserScript==

(function() {
  'use strict';
  console.log("Magazine Comic View Helper Loaded");

  const IMG_SELECTOR = '#post-comic img';

  /* =========================
   * 画像サイズを viewport に合わせる
   * ========================= */
  function fitImagesToViewport() {
    const imgs = document.querySelectorAll(IMG_SELECTOR);
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    imgs.forEach(img => {
      img.style.maxWidth = `${vw}px`;
      img.style.maxHeight = `${vh}px`;
      img.style.width = 'auto';
      img.style.height = 'auto';
      img.style.display = 'block';
      img.style.margin = '0 auto';
    });
  }

  /* =========================
   * 画像一覧取得
   * ========================= */
  function getImages() {
    return [...document.querySelectorAll(IMG_SELECTOR)];
  }

  /* =========================
   * 次 / 前の画像の「上端」にスナップ
   * ========================= */
  function scrollToNextImage(direction) {
    const imgs = getImages();
    if (imgs.length === 0) return;

    const viewportTop = 0;
    const viewportBottom = window.innerHeight;

    if (direction > 0) {
      // 下方向：次の画像
      const next = imgs.find(img => {
        const rect = img.getBoundingClientRect();
        return rect.top >= viewportBottom - 5;
      });

      if (next) {
        window.scrollBy({
          top: next.getBoundingClientRect().top,
          behavior: 'smooth'
        });
      }
    } else {
      // 上方向：前の画像
      const prev = [...imgs].reverse().find(img => {
        const rect = img.getBoundingClientRect();
        return rect.bottom <= viewportTop + 5;
      });

      if (prev) {
        window.scrollBy({
          top: prev.getBoundingClientRect().top,
          behavior: 'smooth'
        });
      }
    }
  }

  /* =========================
   * キーハンドラ
   * ========================= */
  function onKeyDown(e) {
    const target = e.target;

    // 入力中は無効化
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      target.isContentEditable
    ) {
      return;
    }

    // 下方向
    if (
      e.key === 'ArrowDown' ||
      e.key === 'PageDown' ||
      (e.key === ' ' && !e.shiftKey)
    ) {
      e.preventDefault();
      scrollToNextImage(1);
    }

    // 上方向
    if (
      e.key === 'ArrowUp' ||
      e.key === 'PageUp' ||
      (e.key === ' ' && e.shiftKey)
    ) {
      e.preventDefault();
      scrollToNextImage(-1);
    }
  }

  /* =========================
   * 初期化
   * ========================= */
  function init() {
    fitImagesToViewport();
    window.addEventListener('resize', fitImagesToViewport);
    document.addEventListener('keydown', onKeyDown, true);
  }

  // DOM が後から来るサイト対策
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
