(function () {
  "use strict";

  const TOTAL_FRAMES = 240;
  const FRAME_PATH = "img/scroll-frames/";
  const captions = [
    { at: 0, text: "Every story starts with a single mark." },
    { at: 0.18, text: "Ideas take shape, line by line." },
    { at: 0.42, text: "Motion built frame by frame." },
    { at: 0.68, text: "Precision meets imagination." },
    { at: 0.88, text: "Your vision, fully drawn." },
  ];

  const canvas = document.getElementById("frameCanvas");
  const ctx = canvas.getContext("2d");
  const sequence = document.getElementById("scrollSequence");
  const loader = document.getElementById("frameLoader");
  const loaderBar = document.getElementById("loaderBar");
  const loaderText = document.getElementById("loaderText");
  const progressFill = document.getElementById("progressFill");
  const frameCounter = document.getElementById("frameCounter");
  const captionText = document.getElementById("captionText");

  const images = new Array(TOTAL_FRAMES);
  let loadedCount = 0;
  let currentFrame = -1;
  let ticking = false;

  function frameSrc(index) {
    return FRAME_PATH + String(index + 1).padStart(5, "0") + ".jpg";
  }

  function setCanvasSize(img) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.aspectRatio = width + " / " + height;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawFrame(index) {
    const safeIndex = Math.max(0, Math.min(TOTAL_FRAMES - 1, index));
    if (safeIndex === currentFrame) return;

    const img = images[safeIndex];
    if (!img || !img.complete) return;

    currentFrame = safeIndex;
    if (canvas.width === 0) setCanvasSize(img);
    ctx.clearRect(0, 0, img.naturalWidth, img.naturalHeight);
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);

    frameCounter.textContent = String(safeIndex + 1).padStart(3, "0") + " / " + TOTAL_FRAMES;
  }

  function getScrollProgress() {
    const rect = sequence.getBoundingClientRect();
    const scrollable = rect.height - window.innerHeight;
    if (scrollable <= 0) return 0;
    const traveled = Math.min(Math.max(-rect.top, 0), scrollable);
    return traveled / scrollable;
  }

  function getCaption(progress) {
    let active = captions[0].text;
    for (let i = 0; i < captions.length; i += 1) {
      if (progress >= captions[i].at) active = captions[i].text;
    }
    return active;
  }

  function updateScene() {
    const progress = getScrollProgress();
    const frameIndex = Math.round(progress * (TOTAL_FRAMES - 1));

    drawFrame(frameIndex);
    progressFill.style.width = (progress * 100).toFixed(1) + "%";

    const nextCaption = getCaption(progress);
    if (captionText.textContent !== nextCaption) {
      captionText.classList.add("is-fading");
      window.setTimeout(function () {
        captionText.textContent = nextCaption;
        captionText.classList.remove("is-fading");
      }, 180);
    }

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateScene);
    }
  }

  function preloadFrames() {
    return new Promise(function (resolve) {
      let resolved = false;

      function finish() {
        if (resolved) return;
        resolved = true;
        loader.classList.add("is-hidden");
        setCanvasSize(images[0]);
        drawFrame(0);
        updateScene();
        resolve();
      }

      for (let i = 0; i < TOTAL_FRAMES; i += 1) {
        const img = new Image();
        img.decoding = "async";
        img.src = frameSrc(i);
        images[i] = img;

        img.onload = img.onerror = function () {
          loadedCount += 1;
          const percent = Math.round((loadedCount / TOTAL_FRAMES) * 100);
          loaderBar.style.width = percent + "%";
          loaderText.textContent = "Loading frames " + percent + "%";
          if (loadedCount === TOTAL_FRAMES) finish();
        };
      }

      window.setTimeout(finish, 12000);
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () {
    currentFrame = -1;
    if (images[0] && images[0].complete) setCanvasSize(images[0]);
    updateScene();
  });

  preloadFrames();
})();
