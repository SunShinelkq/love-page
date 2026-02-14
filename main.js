// ===== 背景轮播 =====
const BG = ["bg1.jpg","bg2.jpg","bg3.jpg","bg4.jpg"];
const CHANGE_MS = 12000;

const SAFE = `radial-gradient(circle at 30% 20%, rgba(255,238,230,.22), rgba(10,10,14,.78))`;

const bgA = document.getElementById("bgA");
const bgB = document.getElementById("bgB");
let idx = 0;
let showingA = true;

const toastEl = document.getElementById("toast");
function toast(msg, ms=2200){
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  setTimeout(()=>toastEl.classList.remove("show"), ms);
}

function setBg(el, file){
  el.style.backgroundImage = `${SAFE}, url("${file}")`;
}

async function preload(file){
  return new Promise((res)=>{
    const img = new Image();
    img.onload = ()=>res(true);
    img.onerror = ()=>res(false);
    img.src = file + "?v=" + Date.now();
  });
}

async function initBg(){
  const ok = await preload(BG[0]);
  setBg(bgA, ok ? BG[0] : "");
  bgA.classList.add("show");
}

async function rotateBg(){
  idx = (idx + 1) % BG.length;
  const next = BG[idx];
  const inEl  = showingA ? bgB : bgA;
  const outEl = showingA ? bgA : bgB;

  const ok = await preload(next);
  setBg(inEl, ok ? next : "");

  inEl.classList.add("show");
  outEl.classList.remove("show");
  showingA = !showingA;
}

initBg();
setInterval(rotateBg, CHANGE_MS);

// ===== 文案逐行渐显 =====
const TEXT = [
  "有些人出现，是为了热闹。",
  "有些人出现，是为了让时间变得更安静。",
  "愿你始终走在自己的节奏里，不被打扰，不被消耗。",
  "愿你所遇皆温柔，所行皆坦然。",
  "未来很长，祝你越来越好。"
];

const linesBox = document.getElementById("lines");
TEXT.forEach((t,i)=>{
  const d = document.createElement("div");
  d.className = "line";
  d.textContent = t;
  linesBox.appendChild(d);
  setTimeout(()=>d.classList.add("show"), i*900);
});

// ===== 音乐 =====
const bgm = document.getElementById("bgm");
const musicBtn = document.getElementById("musicBtn");
let playing = false;

function play(){
  bgm.volume = 0.28;
  bgm.play().then(()=>{
    playing = true;
    musicBtn.classList.add("playing");
    toast("音乐已开启");
  });
}
function pause(){
  bgm.pause();
  playing = false;
  musicBtn.classList.remove("playing");
  toast("音乐已暂停");
}
musicBtn.onclick = ()=> playing ? pause() : play();

// ===== 玫瑰 =====
const canvas = document.getElementById("roses");
const ctx = canvas.getContext("2d");

function resize(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

const rose = new Image();
rose.src = "rose.png";

function rand(min,max){return Math.random()*(max-min)+min;}

let petals = [];
function build(count){
  petals = Array.from({length:count}).map(()=>({
    x: rand(0, canvas.width),
    y: rand(-canvas.height, canvas.height),
    s: rand(64, 140),
    vy: rand(0.22, 0.55),
    vx: rand(-0.10, 0.10),
    a: rand(0.18, 0.38),
    rot: rand(0, Math.PI*2),
    vr: rand(-0.0025, 0.0025),
    wob: rand(0, Math.PI*2)
  }));
}
build(28);

function loop(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if(rose.complete){
    for(const p of petals){
      p.wob += 0.006;
      p.x += p.vx + Math.sin(p.wob)*0.14;
      p.y += p.vy;
      p.rot += p.vr;
      if(p.y > canvas.height + 180){
        p.y = -180;
        p.x = rand(0, canvas.width);
      }
      ctx.save();
      ctx.globalAlpha = p.a;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.drawImage(rose, -p.s/2, -p.s/2, p.s, p.s);
      ctx.restore();
    }
  }
  requestAnimationFrame(loop);
}
rose.onload = loop;

// ===== 三彩蛋 =====
const card = document.getElementById("card");

// 双击彩蛋（已改文本）
let lastTap = 0;
card.addEventListener("click", () => {
  const now = Date.now();
  if (now - lastTap < 320) {
    toast("🌹 愿你一直被温柔对待。", 2200);
  }
  lastTap = now;
});

// 长按彩蛋
let pressTimer = null;
function startPress(){
  pressTimer = setTimeout(()=>{
    toast("🌙 有些温柔，是时间慢慢给你的。", 2600);
  }, 700);
}
function cancelPress(){
  if(pressTimer) clearTimeout(pressTimer);
}
card.addEventListener("touchstart", startPress, { passive:true });
card.addEventListener("touchend", cancelPress, { passive:true });
card.addEventListener("mousedown", startPress);
card.addEventListener("mouseup", cancelPress);

// 连点三下彩蛋
let tapCount = 0;
let tapTimer = null;
let romanticLock = false;

function triggerRomanticMode(){
  if(romanticLock) return;
  romanticLock = true;
  build(46);
  document.documentElement.style.setProperty(
    "--veil",
    "linear-gradient(rgba(0,0,0,.12), rgba(0,0,0,.12))"
  );
  toast("✨ 更浪漫模式 10 秒", 2200);
  setTimeout(()=>{
    build(28);
    document.documentElement.style.setProperty(
      "--veil",
      "linear-gradient(rgba(0,0,0,.18), rgba(0,0,0,.18))"
    );
    romanticLock = false;
  }, 10000);
}

card.addEventListener("click", ()=>{
  tapCount++;
  if(tapTimer) clearTimeout(tapTimer);
  tapTimer = setTimeout(()=> tapCount = 0, 3000);
  if(tapCount >= 3){
    tapCount = 0;
    triggerRomanticMode();
  }
});

// ===== 加载页 =====
window.addEventListener("load", ()=>{
  const loader = document.getElementById("loader");
  const bar = document.getElementById("loaderProgress");
  let percent = 0;
  const duration = 3500;
  const step = 30;
  const inc = 100 / (duration / step);
  const timer = setInterval(()=>{
    percent += inc;
    if(percent >= 100){
      percent = 100;
      clearInterval(timer);
      setTimeout(()=> loader.classList.add("hide"), 300);
    }
    bar.style.width = percent + "%";
  }, step);
});
