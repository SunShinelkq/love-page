const BASE = "/love-page/";
const BG = ["bg1.jpg","bg2.jpg","bg3.jpg","bg4.jpg"].map(x => BASE + x);

// 永不黑屏：柔光兜底 + 图片双层背景
const SAFE = `radial-gradient(circle at 30% 20%, rgba(255,238,230,.22), rgba(10,10,14,.78))`;

const bgA = document.getElementById("bgA");
const bgB = document.getElementById("bgB");
const toastEl = document.getElementById("toast");

function toast(msg, ms=2400){
  if(!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  setTimeout(()=>toastEl.classList.remove("show"), ms);
}

function setBg(el, url){
  el.style.backgroundImage = `${SAFE}, url("${url}")`;
}

// 背景轮播（稳定版：先验证图片能加载）
let idx = 0;
let showingA = true;

function preload(url){
  return new Promise((res, rej)=>{
    const img = new Image();
    img.onload = ()=>res(true);
    img.onerror = ()=>rej(false);
    img.src = url + "?v=" + Date.now();
  });
}

async function showFirst(){
  try{
    await preload(BG[0]);
    setBg(bgA, BG[0]);
    bgA.classList.add("show");
  }catch{
    setBg(bgA, ""); // 仍保留 SAFE
    bgA.classList.add("show");
    toast("背景图未加载到（请确认 bg1.jpg 在仓库根目录）");
  }
}

async function tick(){
  idx = (idx + 1) % BG.length;
  const next = BG[idx];

  const inEl  = showingA ? bgB : bgA;
  const outEl = showingA ? bgA : bgB;

  try{
    await preload(next);
    setBg(inEl, next);
  }catch{
    // 图片失败也不黑：只显示 SAFE
    setBg(inEl, "");
    toast("背景加载失败：" + next.split("/").pop());
  }

  inEl.classList.add("show");
  outEl.classList.remove("show");
  showingA = !showingA;
}

showFirst();
setInterval(tick, 12000); // 12秒切换一张

// 文案逐行
const TEXT = [
  "有些人出现，是为了热闹。",
  "有些人出现，是为了让时间变得更安静。",
  "愿你始终走在自己的节奏里，不被打扰，不被消耗。",
  "愿你所遇皆温柔，所行皆坦然。",
  "未来很长，祝你越来越好。"
];

const linesBox = document.getElementById("lines");
function renderLines(){
  linesBox.innerHTML = "";
  TEXT.forEach((t,i)=>{
    const d = document.createElement("div");
    d.className = "line";
    d.textContent = t;
    linesBox.appendChild(d);
    setTimeout(()=>d.classList.add("show"), i*900);
  });
}
renderLines();

// 音乐：iPhone 需要用户手势触发
const bgm = document.getElementById("bgm");
const musicBtn = document.getElementById("musicBtn");
let playing = false;

function play(){
  bgm.volume = 0.28;
  bgm.play().then(()=>{
    playing = true;
    musicBtn.classList.add("playing");
    toast("音乐已开启");
  }).catch(()=>{
    toast("需要点一下屏幕才能播放音乐");
  });
}
function pause(){
  bgm.pause();
  playing = false;
  musicBtn.classList.remove("playing");
  toast("音乐已暂停");
}

musicBtn.addEventListener("click",(e)=>{
  e.stopPropagation();
  playing ? pause() : play();
});

document.addEventListener("click", ()=>{
  if(!playing) play();
}, { once:true });

// 大朵玫瑰慢慢飘（电影感）
const canvas = document.getElementById("roses");
const ctx = canvas.getContext("2d");

function resize(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

const rose = new Image();
rose.src = BASE + "rose.png";

function rand(min,max){return Math.random()*(max-min)+min;}

let romanticBoost = false;
let particles = [];

function build(count){
  particles = Array.from({length:count}).map(()=>({
    x: rand(0, canvas.width),
    y: rand(-canvas.height, canvas.height),
    s: rand(64, 140),       // 大朵
    vy: rand(0.22, 0.55),   // 很慢
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
  if(rose.complete && rose.naturalWidth){
    for(const p of particles){
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

// 彩蛋（可选）：3秒内连点5次 -> 10秒更浪漫
const card = document.getElementById("card");
let taps = 0, tapTimer = null;

card.addEventListener("click", ()=>{
  taps++;
  clearTimeout(tapTimer);
  tapTimer = setTimeout(()=>{taps=0;}, 3000);

  if(taps >= 5){
    taps = 0;
    romanticBoost = true;
    build(46); // 更多
    document.documentElement.style.setProperty("--veil","linear-gradient(rgba(0,0,0,.12), rgba(0,0,0,.12))");
    toast("✨ 彩蛋：更浪漫模式 10 秒");
    setTimeout(()=>{
      romanticBoost = false;
      build(28);
      document.documentElement.style.setProperty("--veil","linear-gradient(rgba(0,0,0,.18), rgba(0,0,0,.18))");
      toast("🌙 回归安静");
    }, 10000);
  }
});
