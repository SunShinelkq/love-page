// =======================
// FINAL STABLE VERSION
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
  text.split("\n").forEach((line, idx) => {
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
    setTimeout(() => t.classList.add("hidden"), 250);
  }, ms);
}

// -------- 彩蛋 --------
function bindEasterEgg() {
  const card = document.getElementById("card");
  if (!card) return;

  let pressTimer = null;
  let longPressed = false;
  let lastUp = 0;

  card.addEventListener("pointerdown", () => {
    longPressed = false;
    pressTimer = setTimeout(() => {
      longPressed = true;
      showToast("✨ 彩蛋：你很好，值得被好好对待。", 2200);
    }, 650);
  });

  card.addEventListener("pointerup", () => {
    clearTimeout(pressTimer);

    if (longPressed) {
      longPressed = false;
      return;
    }

    const now = Date.now();
    if (now - lastUp < 280) {
      showToast("🌹 彩蛋：愿你一直被温柔以待。");
    }
    lastUp = now;
  });
}

// -------- 电影级玫瑰 --------
function startRoses() {
  const canvas = document.getElementById("petals");
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  const img = new Image();
  img.src = "rose.png";

  const rand = (a, b) => Math.random() * (b - a) + a;

  const petals = Array.from({ length: 60 }).map(() => ({
    x: rand(0, canvas.width),
    y: rand(-canvas.height, canvas.height),
    s: rand(70, 130),
    vy: rand(.6, 1.4),
    vx: rand(-.4, .4),
    rot: rand(0, Math.PI * 2),
    vr: rand(-.01, .01),
    a: rand(.2, .5)
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of petals) {
      p.y += p.vy;
      p.x += p.vx;
      p.rot += p.vr;
      if (p.y > canvas.height + 120) {
        p.y = -60;
        p.x = rand(0, canvas.width);
      }
      ctx.save();
      ctx.globalAlpha = p.a;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.drawImage(img, -p.s/2, -p.s/2, p.s, p.s);
      ctx.restore();
    }
    requestAnimationFrame(draw);
  }

  img.onload = draw;
}

// -------- Loader --------
function loader() {
  const fill = document.getElementById("loaderFill");
  const loader = document.getElementById("loader");
  const app = document.getElementById("app");

  let p = 0;
  const t = setInterval(() => {
    p = Math.min(95, p + Math.random() * 2);
    fill.style.width = p + "%";
  }, 180);

  setTimeout(() => {
    clearInterval(t);
    fill.style.width = "100%";
    setTimeout(() => {
      loader.style.opacity = "0";
      setTimeout(() => loader.remove(), 900);
      app.classList.remove("hidden");
      revealLines("blessingText", BLESSING_TEXT, 420);
      bindEasterEgg();
    }, 500);
  }, 4500);
}

// -------- 音乐最终修复版 --------
function setupMusic() {
  const bgm = document.getElementById("bgm");
  const btn = document.getElementById("musicBtn");

  let playing = false;
  let unlocked = false;

  async function play() {
    try {
      await bgm.play();
      playing = true;
      btn.classList.add("playing");
    } catch (e) {}
  }

  function pause() {
    bgm.pause();
    playing = false;
    btn.classList.remove("playing");
  }

  function unlock() {
    if (unlocked) return;
    unlocked = true;
    bgm.volume = 0.25;
    play();
  }

  // 首次点击页面自动解锁
  window.addEventListener("pointerdown", unlock, { once: true });

  btn.onclick = (e) => {
    e.stopPropagation();
    if (!playing) {
      bgm.volume = 0.25;
      play();
    } else {
      pause();
    }
  };

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pause();
  });
}

// -------- 启动 --------
loader();
startRoses();
setupMusic();
