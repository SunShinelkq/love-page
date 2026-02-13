// ====== 逐行文本 ======
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

// ====== 玫瑰飘落（贴图粒子，数量 90） ======
const canvas = document.getElementById("petals");
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

const roses = Array.from({ length: 90 }, makeRose); // 卡顿就改 72

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
roseImg.onload = () => tick();
setTimeout(() => { if (!roseImg.complete) tick(); }, 800);

// ====== Loader（电影级：至少 4500ms） ======
const loader = document.getElementById("loader");
const loaderFill = document.getElementById("loaderFill");
const loaderTip = document.getElementById("loaderTip");
const app = document.getElementById("app");

let progress = 0;
const tips = ["为你准备一点点安静的祝福", "愿你不被打扰", "愿你越来越好"];

const fakeProgress = setInterval(() => {
  let delta;
  if (progress < 40) delta = 0.8 + Math.random() * 0.9;
  else if (progress < 75) delta = 0.4 + Math.random() * 0.5;
  else delta = 0.15 + Math.random() * 0.2;

  progress = Math.min(92, progress + delta);
  loaderFill.style.width = progress.toFixed(1) + "%";
  loaderTip.textContent = tips[Math.floor(Math.random() * tips.length)];
}, 180);

const MIN_LOADING_TIME = 4500;
const startTime = Date.now();

window.addEventListener("load", () => {
  const elapsed = Date.now() - startTime;
  const remaining = Math.max(0, MIN_LOADING_TIME - elapsed);

  setTimeout(() => {
    clearInterval(fakeProgress);
    loaderFill.style.width = "100%";

    setTimeout(() => {
      loader.style.opacity = "0";
      app.classList.remove("hidden");

      setTimeout(() => revealLines("blessingText", BLESSING_TEXT, 420), 300);
      setTimeout(() => loader.remove(), 1100);
    }, 650);

  }, remaining);
});

// ====== 电影级音乐：点击解锁 → 延迟3秒 → 渐入/渐出 + 按钮控制 + 后台暂停 ======
const bgm = document.getElementById("bgm");
const musicBtn = document.getElementById("musicBtn");

let isPlaying = false;
let fadeTimer = null;

function clearFade(){
  if (fadeTimer) { clearInterval(fadeTimer); fadeTimer = null; }
}

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
    musicBtn.classList.add("playing");
    fadeTo(0.25, 2000); // 氛围音乐推荐 0.18~0.30
  } catch (e) {}
}

function pauseWithFade() {
  if (!isPlaying) return;
  fadeTo(0, 900);
  setTimeout(() => {
    bgm.pause();
    isPlaying = false;
    musicBtn.classList.remove("playing");
  }, 950);
}

let unlocked = false;
function unlockAudioOnce() {
  if (unlocked) return;
  unlocked = true;

  setTimeout(() => {
    if (!isPlaying) playWithFade();
  }, 3000);

  document.removeEventListener("click", unlockAudioOnce);
  document.removeEventListener("touchstart", unlockAudioOnce);
}

document.addEventListener("click", unlockAudioOnce, { passive: true });
document.addEventListener("touchstart", unlockAudioOnce, { passive: true });

musicBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  unlocked = true;
  if (isPlaying) pauseWithFade();
  else playWithFade();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) pauseWithFade();
});
