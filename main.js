// ====== 1) 修正 OG 里的 SITE_URL（如果你忘了改 HTML 里的，也能兜底） ======
(function fixOg() {
  const site = (window.__SITE_URL__ || "").trim();
  if (!site || site.includes("SITE_URL_REPLACE_ME")) return;
  const metas = document.querySelectorAll('meta[property="og:image"], meta[property="og:url"]');
  metas.forEach(m => {
    const v = m.getAttribute("content") || "";
    if (v.includes("SITE_URL_REPLACE_ME")) {
      m.setAttribute("content", v.replaceAll("SITE_URL_REPLACE_ME", site.replace(/\/?$/, "/")));
    }
  });
})();

// ====== 2) Loader（克制高级） ======
const loader = document.getElementById("loader");
const loaderFill = document.getElementById("loaderFill");
const loaderTip = document.getElementById("loader-tip");
const app = document.getElementById("app");

let p = 0;
const tips = ["为你准备一点点安静的祝福", "愿你不被打扰", "愿你越来越好"];
const timer = setInterval(() => {
  p = Math.min(92, p + (p < 60 ? 7 : 2));
  loaderFill.style.width = p + "%";
  loaderTip.textContent = tips[Math.floor(Math.random() * tips.length)];
}, 220);

window.addEventListener("load", () => {
  clearInterval(timer);
  loaderFill.style.width = "100%";
  setTimeout(() => {
    loader.style.opacity = "0";
    app.classList.remove("hidden");
    setTimeout(() => loader.remove(), 480);
  }, 260);
});

// ====== 3) 花瓣（渐变 + 轻微飘动） ======
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

function makePetal() {
  return {
    x: rand(-40, window.innerWidth + 40),
    y: rand(-window.innerHeight, 0),
    r: rand(7, 15),
    vx: rand(-0.55, 0.55),
    vy: rand(1.0, 2.4),
    rot: rand(0, Math.PI * 2),
    vr: rand(-0.03, 0.03),
    a: rand(0.35, 0.78),
    wobble: rand(0, Math.PI * 2),
  };
}

const petals = Array.from({ length: 30 }, makePetal);

function drawPetal(p) {
  ctx.save();
  ctx.globalAlpha = p.a;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);

  ctx.beginPath();
  ctx.moveTo(0, -p.r);
  ctx.quadraticCurveTo(p.r, -p.r / 3, 0, p.r);
  ctx.quadraticCurveTo(-p.r, -p.r / 3, 0, -p.r);
  ctx.closePath();

  const g = ctx.createLinearGradient(0, -p.r, 0, p.r);
  g.addColorStop(0, "rgba(255,140,175,0.95)");
  g.addColorStop(1, "rgba(255,60,130,0.85)");
  ctx.fillStyle = g;
  ctx.fill();

  // 细微高光（更“高级”）
  ctx.globalAlpha = p.a * 0.22;
  ctx.beginPath();
  ctx.ellipse(0, -p.r * 0.15, p.r * 0.35, p.r * 0.6, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fill();

  ctx.restore();
}

function tick() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  for (const p of petals) {
    p.wobble += 0.02;
    p.x += p.vx + Math.sin(p.wobble) * 0.12;
    p.y += p.vy;
    p.rot += p.vr;

    if (p.y > window.innerHeight + 40) Object.assign(p, makePetal(), { y: -30 });
    if (p.x < -60) p.x = window.innerWidth + 60;
    if (p.x > window.innerWidth + 60) p.x = -60;

    drawPetal(p);
  }
  requestAnimationFrame(tick);
}
tick();

// ====== 4) 彩蛋：双击卡片弹一句祝福；长按卡片弹出“额外祝福” ======
const toast = document.getElementById("toast");
const modal = document.getElementById("modal");
const modalText = document.getElementById("modalText");
const modalClose = document.getElementById("modalClose");
const card = document.querySelector(".card");

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove("hidden");
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 1600);
}

function openModal(text) {
  modalText.textContent = text;
  modal.classList.remove("hidden");
}
function closeModal() {
  modal.classList.add("hidden");
}
modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

card.addEventListener("dblclick", () => {
  const lines = [
    "愿你永远有选择。",
    "愿你不必讨好任何人。",
    "愿你把自己放在第一位。",
    "愿你越来越笃定。"
  ];
  showToast(lines[Math.floor(Math.random() * lines.length)]);
});

// 长按（500ms）
let pressTimer = null;
card.addEventListener("touchstart", () => {
  pressTimer = setTimeout(() => {
    openModal(
      "愿你在疲惫时也能被温柔对待。\n\n" +
      "愿你把热爱留给值得的人和事，\n" +
      "把清醒留给自己。\n\n" +
      "愿你越来越好。"
    );
  }, 520);
}, { passive: true });

card.addEventListener("touchend", () => {
  if (pressTimer) clearTimeout(pressTimer);
  pressTimer = null;
}, { passive: true });

card.addEventListener("touchmove", () => {
  if (pressTimer) clearTimeout(pressTimer);
  pressTimer = null;
}, { passive: true });
