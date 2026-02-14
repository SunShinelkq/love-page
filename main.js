// ====== 背景切换（极柔导演剪辑） ======
const BG_LIST = ["bg1.jpg", "bg2.jpg", "bg3.jpg", "bg4.jpg"];
const BG_INTERVAL = 26000;

function randomMove(){
  const x = (Math.random()*2 - 1).toFixed(2) + "%";
  const y = (Math.random()*2 - 1).toFixed(2) + "%";
  return {x,y};
}

function startBackgroundSlideshow(){
  const bgA = document.getElementById("bgA");
  const bgB = document.getElementById("bgB");
  if(!bgA || !bgB || BG_LIST.length===0) return;

  BG_LIST.forEach(src => { const img = new Image(); img.src = src; });

  let idx = 0;
  let showingA = true;

  function setLayer(layer, src){
    layer.style.backgroundImage = `url("${src}")`;
    const move = randomMove();
    layer.style.setProperty("--tx", move.x);
    layer.style.setProperty("--ty", move.y);
  }

  setLayer(bgA, BG_LIST[idx]);
  bgA.classList.add("show");

  setInterval(() => {
    idx = (idx + 1) % BG_LIST.length;
    const next = BG_LIST[idx];

    const inLayer  = showingA ? bgB : bgA;
    const outLayer = showingA ? bgA : bgB;

    setLayer(inLayer, next);
    inLayer.classList.remove("show");
    void inLayer.offsetWidth;
    inLayer.classList.add("show");

    outLayer.classList.remove("show");
    showingA = !showingA;
  }, BG_INTERVAL);
}

// ====== 文案逐行 ======
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

function revealLines() {
  const el = document.getElementById("blessingText");
  if (!el) return;

  el.innerHTML = "";
  BLESSING_TEXT.split("\n").forEach((line, i) => {
    const div = document.createElement("div");
    div.className = "line";
    div.innerHTML = line || "&nbsp;";
    el.appendChild(div);
    setTimeout(() => div.classList.add("show"), i * 600);
  });
}

// ====== Toast ======
function showToast(msg, ms = 2000) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), ms);
}

// ====== 玫瑰（基础 + 彩蛋增强） ======
const canvas = document.getElementById("petals");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

function rand(min, max) { return Math.random() * (max - min) + min; }

const roseImg = new Image();
roseImg.src = "rose.png";

const ROSE_BASE = { count: 50, sizeMin: 32, sizeMax: 78, vyMin: 0.40, vyMax: 1.00, scale: 1.00 };
const ROSE_BOOST = { count: 85, sizeMin: 34, sizeMax: 86, vyMin: 0.26, vyMax: 0.75, scale: 1.12 };

let roseBoostOn = false;
let roses = [];

function makeRose(mode) {
  const size = rand(mode.sizeMin, mode.sizeMax);
  return {
    x: rand(0, canvas.width),
    y: rand(-canvas.height, 0),
    s: size,
    vx: rand(-0.18, 0.18),
    vy: rand(mode.vyMin, mode.vyMax),
    a: rand(0.20, 0.45),
    rot: rand(0, Math.PI * 2),
    vr: rand(-0.0045, 0.0045),
    wobble: rand(0, Math.PI * 2),
  };
}

function rebuildRoses(mode){
  roses = Array.from({ length: mode.count }, () => makeRose(mode));
}

function drawRose(p, mode) {
  if (!roseImg.complete || roseImg.naturalWidth === 0) return;
  ctx.save();
  ctx.globalAlpha = p.a;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  const s = p.s * mode.scale;
  ctx.drawImage(roseImg, -s / 2, -s / 2, s, s);
  ctx.restore();
}

function tick() {
  const mode = roseBoostOn ? ROSE_BOOST : ROSE_BASE;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const p of roses) {
    p.wobble += 0.009;
    p.x += p.vx + Math.sin(p.wobble) * 0.10;
    p.y += p.vy;
    p.rot += p.vr;

    if (p.y > canvas.height + 80) Object.assign(p, makeRose(mode), { y: -80 });
    drawRose(p, mode);
  }
  requestAnimationFrame(tick);
}

roseImg.onload = () => {
  rebuildRoses(ROSE_BASE);
  tick();
};

// ====== 第三层彩蛋：强呼吸10秒 + 玫瑰增强10秒 ======
function retriggerActiveBgAnimation(){
  const active = document.querySelector(".bg-layer.show");
  if (!active) return;
  active.classList.remove("show");
  void active.offsetWidth;
  active.classList.add("show");
}

function activateStrongBreath10s(){
  if (document.body.classList.contains("strong-breath")) return;

  showToast("✨ 第三层彩蛋：世界正在为你呼吸。", 2400);

  document.body.classList.add("strong-breath");
  retriggerActiveBgAnimation();

  roseBoostOn = true;
  rebuildRoses(ROSE_BOOST);

  setTimeout(() => {
    document.body.classList.remove("strong-breath");
    retriggerActiveBgAnimation();

    roseBoostOn = false;
    rebuildRoses(ROSE_BASE);

    showToast("🌙 呼吸回归平静。", 1800);
  }, 10000);
}

// ====== 彩蛋：双击 + 长按 + 连点5次 ======
function bindEasterEgg() {
  const card = document.getElementById("card");
  if (!card) return;

  // 双击
  let lastTap = 0;
  card.addEventListener("click", () => {
    const now = Date.now();
    if (now - lastTap < 320) showToast("🌹 彩蛋：愿你一直被温柔解释。", 2200);
    lastTap = now;
  });

  // 长按 700ms
  let pressTimer = null;
  function startPress() {
    pressTimer = setTimeout(() => {
      showToast("🌙 长按彩蛋：有些温柔，是时间慢慢给你的。", 2600);
    }, 700);
  }
  function cancelPress() {
    if (!pressTimer) return;
    clearTimeout(pressTimer);
    pressTimer = null;
  }

  card.addEventListener("touchstart", startPress, { passive: true });
  card.addEventListener("touchend", cancelPress, { passive: true });
  card.addEventListener("touchmove", cancelPress, { passive: true });
  card.addEventListener("mousedown", startPress);
  card.addEventListener("mouseup", cancelPress);
  card.addEventListener("mouseleave", cancelPress);

  // 3秒内连点5次
  let tapCount = 0;
  let tapTimer = null;

  card.addEventListener("click", () => {
    tapCount++;
    if (tapTimer) clearTimeout(tapTimer);

    tapTimer = setTimeout(() => {
      tapCount = 0;
      tapTimer = null;
    }, 3000);

    if (tapCount >= 5) {
      tapCount = 0;
      clearTimeout(tapTimer);
      tapTimer = null;
      activateStrongBreath10s();
    }
  });
}

// ====== Loader（4500ms） ======
const loader = document.getElementById("loader");
const loaderFill = document.getElementById("loaderFill");
const loaderTip = document.getElementById("loaderTip");

let progress = 0;
const startTime = Date.now();
const MIN_LOADING_TIME = 4500;
const tips = ["为你准备一点点安静的祝福", "愿你不被打扰", "愿你越来越好"];

const fake = setInterval(() => {
  progress = Math.min(92, progress + 0.4);
  if (loaderFill) loaderFill.style.width = progress + "%";
  if (loaderTip) loaderTip.textContent = tips[Math.floor(Math.random() * tips.length)];
}, 180);

window.addEventListener("load", () => {
  const wait = Math.max(0, MIN_LOADING_TIME - (Date.now() - startTime));

  setTimeout(() => {
    clearInterval(fake);
    if (loaderFill) loaderFill.style.width = "100%";

    setTimeout(() => {
      if (loader) loader.style.opacity = "0";

      const app = document.getElementById("app");
      if (app) app.classList.remove("hidden");

      revealLines();
      bindEasterEgg();

      setTimeout(() => { if (loader) loader.remove(); }, 1000);
    }, 700);

  }, wait);
});

// ====== 音乐（点击解锁 → 延迟3秒 → 渐入；按钮控制） ======
const bgm = document.getElementById("bgm");
const musicBtn = document.getElementById("musicBtn");

let unlocked = false;
let playing = false;

function fadeIn() {
  if (!bgm) return;
  bgm.volume = 0;
  bgm.play().then(() => {
    playing = true;
    musicBtn?.classList.add("playing");

    let v = 0;
    const t = setInterval(() => {
      v += 0.02;
      bgm.volume = Math.min(0.25, v);
      if (v >= 0.25) clearInterval(t);
    }, 100);
  }).catch(() => {});
}

function fadeOutPause() {
  if (!bgm || !playing) return;
  const t = setInterval(() => {
    bgm.volume -= 0.03;
    if (bgm.volume <= 0) {
      clearInterval(t);
      bgm.pause();
      playing = false;
      musicBtn?.classList.remove("playing");
    }
  }, 60);
}

document.addEventListener("click", () => {
  if (unlocked) return;
  unlocked = true;
  setTimeout(fadeIn, 3000);
}, { once: true });

musicBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  unlocked = true;
  if (playing) fadeOutPause();
  else fadeIn();
});

// ====== 启动 ======
startBackgroundSlideshow();
