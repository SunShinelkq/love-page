const BASE = "/love-page/";

// 背景图片
const BG_LIST = [
  BASE + "bg1.jpg",
  BASE + "bg2.jpg",
  BASE + "bg3.jpg",
  BASE + "bg4.jpg"
];

function setLayer(layer, src){
  layer.style.backgroundImage =
    `radial-gradient(circle at 30% 20%, rgba(255,230,220,.18), rgba(0,0,0,.65)), url("${src}")`;
}

function startBackground(){
  const bgA = document.getElementById("bgA");
  const bgB = document.getElementById("bgB");

  let index = 0;
  let showA = true;

  setLayer(bgA, BG_LIST[index]);
  bgA.classList.add("show");

  setInterval(()=>{
    index = (index + 1) % BG_LIST.length;
    const next = BG_LIST[index];

    const showLayer = showA ? bgB : bgA;
    const hideLayer = showA ? bgA : bgB;

    setLayer(showLayer, next);
    showLayer.classList.add("show");
    hideLayer.classList.remove("show");

    showA = !showA;
  }, 8000);
}

startBackground();

// 文案
const text = `
有些人出现，是为了热闹。

有些人出现，是为了让时间变得更安静。

愿你始终走在自己的节奏里，
不被打扰，不被消耗。

未来很长，
祝你越来越好。
`;

document.getElementById("blessingText").innerText = text;

// 音乐
const bgm = document.getElementById("bgm");
const btn = document.getElementById("musicBtn");

btn.onclick = ()=>{
  if(bgm.paused){
    bgm.volume = 0.3;
    bgm.play();
  }else{
    bgm.pause();
  }
};

// 玫瑰
const canvas = document.getElementById("petals");
const ctx = canvas.getContext("2d");

function resize(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

const img = new Image();
img.src = BASE + "rose.png";

const roses = Array.from({length:40}).map(()=>({
  x:Math.random()*canvas.width,
  y:Math.random()*canvas.height,
  size:30+Math.random()*40,
  speed:0.4+Math.random()*0.6
}));

function animate(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  roses.forEach(r=>{
    r.y += r.speed;
    if(r.y>canvas.height) r.y = -50;
    ctx.drawImage(img,r.x,r.y,r.size,r.size);
  });
  requestAnimationFrame(animate);
}

img.onload = animate;
