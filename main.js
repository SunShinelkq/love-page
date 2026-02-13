// =======================
// 强健终版 main.js
// 目标：资源失败也不影响卡片显示；彩蛋一定绑定；loader 4.5s；音乐电影级
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

// -------- Toast + 彩蛋 --------
function showToast(msg, ms = 1600) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.remove("hidden");
  t.classList.add("show");
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.classList.add("hidden"), 250);
  }, ms);
}

function bindEasterEgg() {
  const card = document.getElementById("card");
  if (!card) return;

  // 双击彩蛋
  let lastTap = 0;
  card.addEventListener("click", () => {
    const now = Date.now();
    if (now - lastTap < 320) showToast("🌹 彩蛋：愿你一直被温柔以待。");
    lastTap = now;
  });

  // 长按彩蛋（600ms）
  let pressTimer = null;
  const start = () => {
    pressTimer = setTimeout(() => {
      showToast("✨ 彩蛋：你很重要，也值得被好好对待。", 2200);
    }, 600);
  };
  const cancel = () => {
    if (pressTimer) clearTimeout(pressTimer);
    pressTimer = null;
  };

  card.addEventListener("touchstart", start, { passive: true });
  card.addEventListener("touchend", cancel, { passive: true });
  card.addEventListener("touchmove", cancel, { passive: true });
}

// -------- 玫瑰飘落（失败也不影响卡片显示） --------
function startRoses() {
  const canvas = document.getElementById("petals");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function resize() {
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  function rand(min, max) { return Math.random() * (max - min) + min; }

  const roseImg = new Image();
  roseImg.src = "rose.png";

  function makeRose() {
    return {
      x: rand(-60, window.innerWidth + 60),
      y: rand(-window.innerHeight, 0),
      s: rand(16, 34),
      vx: rand(-0.7, 0.7),
      vy: rand(1.2, 3.0),
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.02, 0.02),
      a: rand(0.25, 0.65),
      wobble: rand(0, Math.PI * 2),
    };
  }

  const roses = Array.from({ length: 90 }, makeRose);

  function drawRose(p) {
    if (!roseImg.complete || roseImg.naturalWidth === 0) return;
    ctx.save();
    ctx.globalAlpha = p.a;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    const half = p.s / 2;
    ctx.drawImage(roseImg, -half, -half, p.s, p.s);
    ctx.restore();
  }

  function tick() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (const p of roses) {
      p.wobble += 0.018;
      p.x += p.vx + Math.sin(p.wobble) * 0.22;
      p.y += p.vy;
      p.rot += p.vr;

      if (p.y > window.innerHeight + 80) Object.assign(p, makeRose(), { y: -40 });
      if (p.x < -90) p.x = window.innerWidth + 90;
      if (p.x > window.innerWidth + 90) p.x = -90;

      drawRose(p);
    }
    requestAnimationFrame(tick);
  }

  setTimeout(() => tick(), 60);
}

// -------- Loader：电影级 4500ms + 兜底必显示 --------
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

  // 兜底：最迟 5.8 秒强制显示
  setTimeout(() => {
    clearInterval(fakeProgress);
    showApp();
  }, 5800);
}

// -------- 音乐：点击解锁 → 延迟3秒 → 渐入/渐出 --------
function setupMusic() {
  const bgm = document.getElementById("bgm");
  const btn = document.getElementById("musicBtn");
  if (!bgm || !btn) return;

  let isPlaying = false;
  let fadeTimer = null;
  let unlocked = false;

  function clearFade(){ if (fadeTimer) { clearInterval(fadeTimer); fadeTimer = null; } }

  function fadeTo(target, durationMs = 2000) {
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
      fadeTo(0.25, 2000);
    } catch (e) {}
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

  function unlockOnce() {
    if (unlocked) return;
    unlocked = true;
    setTimeout(() => { if (!isPlaying) playWithFade(); }, 3000);
    document.removeEventListener("click", unlockOnce);
    document.removeEventListener("touchstart", unlockOnce);
  }

  document.addEventListener("click", unlockOnce, { passive: true });
  document.addEventListener("touchstart", unlockOnce, { passive: true });

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    unlocked = true;
    if (isPlaying) pauseWithFade();
    else playWithFade();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pauseWithFade();
  });
}

// -------- 启动 --------
try { startRoses(); } catch(e) {}
try { setupMusic(); } catch(e) {}
try { startLoaderAndShowApp(); } catch(e) {}
