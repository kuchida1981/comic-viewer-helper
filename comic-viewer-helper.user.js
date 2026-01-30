(function() {
  "use strict";
  const CONTAINER_SELECTOR$1 = "#post-comic";
  function calculateVisibleHeight(rect, windowHeight) {
    const visibleTop = Math.max(0, rect.top);
    const visibleBottom = Math.min(windowHeight, rect.bottom);
    return Math.max(0, visibleBottom - visibleTop);
  }
  function getPrimaryVisibleImageIndex(imgs, windowHeight) {
    if (imgs.length === 0) return -1;
    let maxVisibleHeight = 0;
    let primaryIndex = -1;
    imgs.forEach((img, index) => {
      const rect = img.getBoundingClientRect();
      const visibleHeight = calculateVisibleHeight(rect, windowHeight);
      if (visibleHeight > maxVisibleHeight) {
        maxVisibleHeight = visibleHeight;
        primaryIndex = index;
      }
    });
    return primaryIndex;
  }
  function fitImagesToViewport(alignmentIndex = -1, isDualViewEnabled2 = false) {
    const container = document.querySelector(CONTAINER_SELECTOR$1);
    if (!container) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    Object.assign(container.style, {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "0",
      margin: "0",
      width: "100%",
      maxWidth: "none"
    });
    const allImages = Array.from(container.querySelectorAll("img"));
    for (let i = 0; i < allImages.length; i++) {
      const img = allImages[i];
      const isLandscape = img.naturalWidth > img.naturalHeight;
      let pairWithNext = false;
      if (isDualViewEnabled2 && !isLandscape && i + 1 < allImages.length) {
        const nextImg = allImages[i + 1];
        const nextIsLandscape = nextImg.naturalWidth > nextImg.naturalHeight;
        const nextIsAlignmentTarget = i + 1 === alignmentIndex;
        if (!nextIsLandscape && !nextIsAlignmentTarget) {
          pairWithNext = true;
        }
      }
      if (pairWithNext) {
        const nextImg = allImages[i + 1];
        const row = document.createElement("div");
        row.className = "comic-row-wrapper";
        Object.assign(row.style, {
          display: "flex",
          flexDirection: "row-reverse",
          justifyContent: "center",
          alignItems: "center",
          width: "100vw",
          maxWidth: "100vw",
          marginLeft: "calc(50% - 50vw)",
          marginRight: "calc(50% - 50vw)",
          height: "100vh",
          marginBottom: "0",
          position: "relative",
          boxSizing: "border-box"
        });
        [img, nextImg].forEach((im) => {
          Object.assign(im.style, {
            maxWidth: "50%",
            maxHeight: "100%",
            width: "auto",
            height: "auto",
            objectFit: "contain",
            margin: "0",
            display: "block"
          });
        });
        row.appendChild(img);
        row.appendChild(nextImg);
        container.appendChild(row);
        i++;
      } else {
        img.style.cssText = "";
        Object.assign(img.style, {
          maxWidth: `${vw}px`,
          maxHeight: `${vh}px`,
          width: "auto",
          height: "auto",
          display: "block",
          margin: "0 auto",
          flexShrink: "0",
          objectFit: "contain"
        });
      }
    }
  }
  console.log("Magazine Comic View Helper Loaded");
  const IMG_SELECTOR = "#post-comic img";
  const CONTAINER_SELECTOR = "#post-comic";
  const STORAGE_KEY_DUAL_VIEW = "comic-viewer-helper-dual-view";
  const STORAGE_KEY_GUI_POS = "comic-viewer-helper-gui-pos";
  let pageCounter = null;
  let isDualViewEnabled = localStorage.getItem(STORAGE_KEY_DUAL_VIEW) === "true";
  let originalImages = [];
  function isInputField(target) {
    return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || target.isContentEditable;
  }
  function getImages() {
    if (originalImages.length > 0) return originalImages;
    return Array.from(document.querySelectorAll(IMG_SELECTOR));
  }
  function getCurrentPageIndex() {
    const imgs = getImages();
    if (imgs.length === 0) return -1;
    const windowHeight = window.innerHeight;
    const centerLine = windowHeight / 2;
    let currentIndex = imgs.findIndex((img) => {
      const rect = img.getBoundingClientRect();
      return rect.top <= centerLine && rect.bottom >= centerLine;
    });
    if (currentIndex === -1) {
      currentIndex = imgs.findIndex((img) => {
        const rect = img.getBoundingClientRect();
        return rect.bottom > 0 && rect.top < windowHeight;
      });
    }
    return currentIndex;
  }
  function updatePageCounter() {
    if (!pageCounter) return;
    const imgs = getImages();
    if (imgs.length === 0) {
      pageCounter.textContent = "0 / 0";
      return;
    }
    const currentIndex = getCurrentPageIndex();
    const current = currentIndex !== -1 ? currentIndex + 1 : 1;
    const total = imgs.length;
    let displayStr = `${current}`;
    if (currentIndex !== -1) {
      const activeImg = imgs[currentIndex];
      const parent = activeImg.parentElement;
      if (parent && parent.classList.contains("comic-row-wrapper")) {
        const siblings = Array.from(parent.children).filter((el) => el.tagName === "IMG");
        if (siblings.length > 1) {
          const indices = siblings.map((img) => imgs.indexOf(img) + 1).sort((a, b) => a - b);
          if (indices.length > 0) {
            displayStr = `${indices[0]}-${indices[indices.length - 1]}`;
          }
        }
      }
    }
    pageCounter.textContent = `${displayStr} / ${total}`;
  }
  function scrollToImage(direction) {
    const imgs = getImages();
    if (imgs.length === 0) return;
    const THRESHOLD = 5;
    let targetImg = null;
    if (direction > 0) {
      targetImg = imgs.find((img) => {
        const rect = img.getBoundingClientRect();
        return rect.top > THRESHOLD;
      });
    } else {
      const prevImgs = [...imgs].reverse();
      targetImg = prevImgs.find((img) => {
        const rect = img.getBoundingClientRect();
        return rect.top < -THRESHOLD;
      });
    }
    if (targetImg) {
      targetImg.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
  function scrollToEdge(position) {
    const imgs = getImages();
    if (imgs.length === 0) return;
    const target = position === "start" ? imgs[0] : imgs[imgs.length - 1];
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function createNavigationUI() {
    const container = document.createElement("div");
    Object.assign(container.style, {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      zIndex: "10000",
      display: "flex",
      gap: "8px",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      padding: "8px",
      borderRadius: "8px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
      cursor: "move",
      userSelect: "none",
      touchAction: "none"
    });
    const savedPos = loadGUIPosition();
    if (savedPos) {
      Object.assign(container.style, { top: `${savedPos.top}px`, left: `${savedPos.left}px`, bottom: "auto", right: "auto" });
    }
    let isDragging = false;
    let dragStartX, dragStartY, initialTop, initialLeft;
    container.addEventListener("mousedown", (e) => {
      if (e.button !== 0 || e.target.tagName === "BUTTON" || e.target.tagName === "INPUT") return;
      isDragging = true;
      const rect = container.getBoundingClientRect();
      initialTop = rect.top;
      initialLeft = rect.left;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      Object.assign(container.style, { top: `${initialTop}px`, left: `${initialLeft}px`, bottom: "auto", right: "auto" });
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
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
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }
    pageCounter = document.createElement("span");
    Object.assign(pageCounter.style, { color: "#fff", fontSize: "14px", fontWeight: "bold", padding: "0 8px", display: "flex", alignItems: "center", userSelect: "none", minWidth: "60px", justifyContent: "center" });
    pageCounter.textContent = "1 / 1";
    container.appendChild(pageCounter);
    const toggleLabel = document.createElement("label");
    Object.assign(toggleLabel.style, { display: "flex", alignItems: "center", color: "#fff", fontSize: "12px", cursor: "pointer", userSelect: "none", marginRight: "8px" });
    const toggleInput = document.createElement("input");
    toggleInput.type = "checkbox";
    toggleInput.checked = isDualViewEnabled;
    toggleInput.style.marginRight = "4px";
    toggleInput.addEventListener("change", () => {
      toggleDualView(toggleInput.checked);
      toggleInput.blur();
    });
    toggleLabel.appendChild(toggleInput);
    toggleLabel.appendChild(document.createTextNode("Spread"));
    container.appendChild(toggleLabel);
    const buttons = [
      { text: "<<", label: "Go to First", action: () => scrollToEdge("start") },
      { text: "<", label: "Go to Previous", action: () => scrollToImage(-1) },
      { text: ">", label: "Go to Next", action: () => scrollToImage(1) },
      { text: ">>", label: "Go to Last", action: () => scrollToEdge("end") }
    ];
    buttons.forEach((btnDef) => {
      const btn = document.createElement("button");
      btn.textContent = btnDef.text;
      btn.title = btnDef.label;
      Object.assign(btn.style, { cursor: "pointer", padding: "6px 12px", border: "none", background: "#fff", color: "#333", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", minWidth: "50px" });
      btn.onmouseenter = () => btn.style.background = "#eee";
      btn.onmouseleave = () => btn.style.background = "#fff";
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        btnDef.action();
        btn.blur();
      });
      container.appendChild(btn);
    });
    document.body.appendChild(container);
  }
  function onKeyDown(e) {
    if (isInputField(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
    if (["ArrowDown", "PageDown", "ArrowRight", "j", " "].includes(e.key) && !e.shiftKey) {
      e.preventDefault();
      scrollToImage(1);
    } else if (["ArrowUp", "PageUp", "ArrowLeft", "k", " "].includes(e.key) && e.shiftKey) {
      e.preventDefault();
      scrollToImage(-1);
    } else if (e.key === "d") {
      e.preventDefault();
      const newState = !isDualViewEnabled;
      const checkbox = document.querySelector('input[type="checkbox"]');
      if (checkbox) checkbox.checked = newState;
      toggleDualView(newState);
    }
  }
  function toggleDualView(enabled) {
    const currentIndex = getPrimaryVisibleImageIndex(getImages(), window.innerHeight);
    isDualViewEnabled = enabled;
    localStorage.setItem(STORAGE_KEY_DUAL_VIEW, enabled);
    fitImagesToViewport(enabled ? currentIndex : -1, isDualViewEnabled);
    updatePageCounter();
    if (currentIndex !== -1) {
      const imgs = getImages();
      const targetImg = imgs[currentIndex];
      if (targetImg) targetImg.scrollIntoView({ block: "start" });
    }
  }
  function saveGUIPosition(top, left) {
    localStorage.setItem(STORAGE_KEY_GUI_POS, JSON.stringify({ top, left }));
  }
  function loadGUIPosition() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GUI_POS);
      if (!saved) return null;
      const pos = JSON.parse(saved);
      const buffer = 50;
      if (pos.left < -buffer || pos.left > window.innerWidth + buffer || pos.top < -buffer || pos.top > window.innerHeight + buffer) return null;
      return pos;
    } catch {
      return null;
    }
  }
  function init() {
    const container = document.querySelector(CONTAINER_SELECTOR);
    if (!container) return;
    originalImages = Array.from(document.querySelectorAll(IMG_SELECTOR));
    const imgs = document.querySelectorAll(IMG_SELECTOR);
    let resizeReq;
    imgs.forEach((img) => {
      if (!img.complete) {
        img.addEventListener("load", () => {
          if (resizeReq) cancelAnimationFrame(resizeReq);
          resizeReq = requestAnimationFrame(() => {
            fitImagesToViewport();
            updatePageCounter();
          });
        });
      }
    });
    fitImagesToViewport(-1, isDualViewEnabled);
    createNavigationUI();
    updatePageCounter();
    window.addEventListener("resize", () => {
      if (resizeReq) cancelAnimationFrame(resizeReq);
      resizeReq = requestAnimationFrame(() => {
        fitImagesToViewport();
        updatePageCounter();
      });
    });
    let scrollReq;
    window.addEventListener("scroll", () => {
      if (scrollReq) cancelAnimationFrame(scrollReq);
      scrollReq = requestAnimationFrame(updatePageCounter);
    });
    document.addEventListener("keydown", onKeyDown, true);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
