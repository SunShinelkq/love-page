// =======================
// main.js 最终版（修复音乐）
// - 电影级玫瑰（三层景深 + 柔焦 + 呼吸 + 摆动）
// - 彩蛋：双击 + 长按（长按文案已改）
// - loader 4500ms + 兜底
// - 音乐：首次点击页面解锁自动播放 + 按钮播放/暂停 + 渐入渐出
// =======================

// -------- 文案逐行 --------
const BLESSING_TEXT = [
  "有些人出现，是为了热闹。",
  "",
  "有些人出现，是为了让时间变得更安静。",
  "",
  "愿你始终走在自己的节奏里，",
  "不被打扰，不被消耗。",
  "",
  "愿你所遇皆温柔，",
  "所行皆坦然。",
  "",
  "未来很长，",
  "祝你越来越好。"
].join("\n");

function revealLines(containerId, text, delayMs = 420) {
  const el = document.getElementById(containerId);
  if (!el) return;

  el.innerHTML = "";
  const lines = text.split("\n");
  lines.forEach((line, idx) => {
    const div = document.createElement("div");
    div.className = "line";
    div.innerHTML = line.trim() === "" ? "&nbsp;" : line;
    el.appendChild(div);
    setTimeout(() => div.classList.add("show"), idx * delayMs);
  });
}

// -------- Toast --------
function showToast(msg, ms = 1600) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.remove("hidden");
  t.classList.add("show");
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.classList.add("hidden"), 260);
  }, ms);
}

// -------- 彩蛋：长按 + 双击（互不干扰）--------
function bindEasterEgg() {
  const card = document.getElementById("card");
  if (!card) return;

  let pressTimer = null;
  let longPressed = false;
  let downX = 0, downY = 0;

  const MOVE_TOL = 10;
  const LONG_MS = 650;

  let lastUpAt = 0;
  const DBL_MS = 280;

  function clearPress() {
    if (pressTimer) clearTimeout(pressTimer);
    pressTimer = null;
  }

  card.addEventListener("pointerdown", (e) => {
    downX = e.clientX ?? 0;
    downY = e.clientY ?? 0;
    longPressed = false;

    clearPress();
    pressTimer = setTimeout(() => {
      longPressed = true;
      // ✅ 长按彩蛋文案已改
      showToast("✨ 彩蛋：你很好，值得被好好对待。", 2200);
    }, LONG_MS);
  });

  card.addEventListener("pointermove", (e) => {
    const x = e.clientX ?? 0;
    const y = e.clientY ?? 0;
    if (Math.abs(x - downX) > MOVE_TOL || Math.abs(y - downY) > MOVE_TOL) {
      clearPress();
    }
  });

  card.addEventListener("pointerup", () => {
    clearPress();

    if (longPressed) {
      longPressed = false;
      return;
    }

    const now = Date.now();
    if (now - lastUpAt < DBL_MS) {
      showToast("🌹 彩蛋：愿你一直被温柔以待。");
      lastUpAt = 0;
    } else {
      lastUpAt = now;
    }
  });

  card.addEventListener("pointercancel", clearPress);
  card.addEventListener("pointerleave", clearPress);
}

// -------- 电影级玫瑰（三层景深） --------
function startRosesCinematic() {
  const canvas = document.getElementById("petals");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let W = 0, H = 0, dpr = 1;

  function resize() {
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  const roseImg = new Image();
  roseImg.src = "rose.png";

  const rand = (a, b) => Math.random() * (b - a) + a;

  const LAYERS = [
    { count: 34, sMin: 26, sMax: 46, vyMin: 0.45, vyMax: 1.05, blur: 0.6, alphaMin: 0.10, alphaMax: 0.22, drift: 0.18 },
    { count: 28, sMin: 44, sMax: 78, vyMin: 0.75, vyMax: 1.55, blur: 1.1, alphaMin: 0.18, alphaMax: 0.36, drift: 0.24 },
    { count: 18, sMin: 76, sMax: 124, vyMin: 0.95, vyMax: 1.85, blur: 1.8, alphaMin: 0.22, alphaMax: 0.48, drift: 0.30 }
  ];

  function makeRose(layer) {
    return {
      x: rand(-160, W + 160),
      y: rand(-H, H),
      s: rand(layer.sMin, layer.sMax),
      vy: rand(layer.vyMin, layer.vyMax),
      vx: rand(-0.22, 0.22),
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.006, 0.006),
      a: rand(layer.alphaMin, layer.alphaMax),
      wob: rand(0, Math.PI * 2),
      wobSpd: rand(0.006, 0.014),
      drift: layer.drift,
      blur: layer.blur,
      breathe: rand(0, Math.PI * 2),
      breatheSpd: rand(0.004, 0.009)
    };
  }

  const roses = [];
  for (const layer of LAYERS) {
    for (let i = 0; i < layer.count; i++) {
      roses.push(makeRose(layer));
    }
  }

  function drawOne(p) {
    if (!roseImg.complete || roseImg.naturalWidth === 0) return;

    p.wob += p.wobSpd;
    p.breathe += p.breatheSpd;

    const breathScale = 1 + Math.sin(p.breathe) * 0.02;

    p.x += p.vx + Math.sin(p.wob) * p.drift;
    p.y += p.vy;
    p.rot += p.vr;

    if (p.y > H + 180) {
      p.y = -180;
      p.x = rand(-160, W + 160);
    }
    if (p.x < -260) p.x = W + 260;
    if (p.x > W + 260) p.x = -260;

    ctx.save();
    ctx.globalAlpha = p.a;
    ctx.shadowColor = "rgba(0,0,0,0.18)";
    ctx.shadowBlur = p.blur * 6;

    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);

    const size = p.s * breathScale;
    const half = size / 2;
    ctx.drawImage(roseImg, -half, -half, size, size);
    ctx.restore();
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    for (const p of roses) drawOne(p);
    requestAnimationFrame(tick);
  }

  roseImg.onload = () => tick();
  setTimeout(() => { if (roseImg.complete) tick(); }, 150);
}

// -------- Loader：4500ms + 兜底必显示 --------
function startLoaderAndShowApp() {
  const loader = document.getElementById("loader");
  const loaderFill = document.getElementById("loaderFill");
  const loaderTip = document.getElementById("loaderTip");
  const app = document.getElementById("app");
  if (!app) return;

  let progress = 0;
  const tips = ["为你准备一点点安静的祝福", "愿你不被打扰", "愿你越来越好"];
  const startTime = Date.now();
  const MIN_LOADING_TIME = 4500;

  const fakeProgress = setInterval(() => {
    let delta;
    if (progress < 40) delta = 0.8 + Math.random() * 0.9;
    else if (progress < 75) delta = 0.4 + Math.random() * 0.5;
    else delta = 0.15 + Math.random() * 0.2;

    progress = Math.min(92, progress + delta);
    if (loaderFill) loaderFill.style.width = progress.toFixed(1) + "%";
    if (loaderTip) loaderTip.textContent = tips[Math.floor(Math.random() * tips.length)];
  }, 180);

  function showApp() {
    app.classList.remove("hidden");
    setTimeout(() => revealLines("blessingText", BLESSING_TEXT, 420), 300);
    bindEasterEgg();

    if (loader) {
      loader.style.opacity = "0";
      setTimeout(() => loader.remove(), 1100);
    }

    setTimeout(() => showToast("提示：双击或长按文字区有彩蛋"), 900);
  }

  window.addEventListener("load", () => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, MIN_LOADING_TIME - elapsed);

    setTimeout(() => {
      clearInterval(fakeProgress);
      if (loaderFill) loaderFill.style.width = "100%";
      setTimeout(showApp, 650);
    }, remaining);
  });

  setTimeout(() => {
    clearInterval(fakeProgress);
    showApp();
  }, 5800);
}

// -------- ✅ 音乐：最终修复版 --------
function setupMusic() {
  const bgm = document.getElementById("bgm");
  const btn = document.getElementById("musicBtn");
  if (!bgm || !btn) return;

  // 文件加载失败也不崩
  bgm.preload = "auto";

  let isPlaying = false;
  let fadeTimer = null;
  let unlocked = false;

  function clearFade() {
    if (fadeTimer) { clearInterval(fadeTimer); fadeTimer = null; }
  }

  function fadeTo(target, durationMs = 1800) {
    clearFade();
    const start = bgm.volume;
    const diff = target - start;
    const steps = Math.max(1, Math.floor(durationMs / 50));
    let i = 0;

    fadeTimer = setInterval(() => {
      i++;
      const v = start + diff * (i / steps);
      bgm.volume = Math.max(0, Math.min(1, v));
      if (i >= steps) clearFade();
    }, 50);
  }

  async function playWithFade() {
    try {
      bgm.volume = 0;
      await bgm.play();
      isPlaying = true;
      btn.classList.add("playing");
      fadeTo(0.25, 1800);
    } catch (e) {
      // 播放失败通常是没解锁（iOS限制）
    }
  }

  function pauseWithFade() {
    if (!isPlaying) return;
    fadeTo(0, 900);
    setTimeout(() => {
      bgm.pause();
      isPlaying = false;
      btn.classList.remove("playing");
    }, 950);
  }

  // ✅ 最稳：第一次“用户交互”就解锁并自动播放（一次性）
  async function unlockAndAutoPlay() {
    if (unlocked) return;
    unlocked = true;

    // 给一点点延迟更“电影感”
    setTimeout(() => {
      if (!isPlaying) playWithFade();
    }, 600);

    document.removeEventListener("pointerdown", unlockAndAutoPlay);
    document.removeEventListener("touchstart", unlockAndAutoPlay);
    document.removeEventListener("click", unlockAndAutoPlay);
  }

  document.addEventListener("pointerdown", unlockAndAutoPlay, { passive: true });
  document.addEventListener("touchstart", unlockAndAutoPlay, { passive: true });
  document.addEventListener("click", unlockAndAutoPlay, { passive: true });

  // 按钮：播放/暂停
  btn.addEventListener("click", async (e) => {
    e.stopPropagation();
    unlocked = true;
    if (isPlaying) pauseWithFade();
    else await playWithFade();
  });

  // 切后台：暂停（避免系统强杀）
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pauseWithFade();
  });
}

// -------- 启动 --------
try { startRosesCinematic(); } catch(e) {}
try { setupMusic(); } catch(e) {}
try { startLoaderAndShowApp(); } catch(e) {}
