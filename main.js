// ===== 加载动画 =====
const loader = document.getElementById("loader");
const progress = document.getElementById("progress");
const main = document.getElementById("main");

let percent = 0;
const timer = setInterval(()=>{
  percent += Math.random()*12;
  if(percent >= 95) percent = 95;
  progress.style.width = percent + "%";
},200);

window.addEventListener("load",()=>{
  clearInterval(timer);
  progress.style.width = "100%";

  setTimeout(()=>{
    loader.style.opacity = "0";
    main.classList.remove("hidden");
    setTimeout(()=>loader.remove(),500);
  },300);
});

// ===== 玫瑰花瓣动画 =====
const canvas = document.getElementById("petals");
const ctx = canvas.getContext("2d");

function resize(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize",resize);

const petals = [];

function createPetal(){
  return {
    x: Math.random()*canvas.width,
    y: Math.random()*canvas.height - canvas.height,
    size: 8 + Math.random()*8,
    speedY: 1 + Math.random()*1.5,
    speedX: Math.random()*0.6 - 0.3,
    rotation: Math.random()*360,
    rotationSpeed: Math.random()*2 - 1
  };
}

for(let i=0;i<35;i++){
  petals.push(createPetal());
}

function drawPetal(p){
  ctx.save();
  ctx.translate(p.x,p.y);
  ctx.rotate(p.rotation*Math.PI/180);

  ctx.beginPath();
  ctx.moveTo(0,-p.size);
  ctx.quadraticCurveTo(p.size,-p.size/2,0,p.size);
  ctx.quadraticCurveTo(-p.size,-p.size/2,0,-p.size);
  ctx.fillStyle="rgba(255,120,160,0.8)";
  ctx.fill();

  ctx.restore();
}

function update(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  petals.forEach(p=>{
    p.y += p.speedY;
    p.x += p.speedX;
    p.rotation += p.rotationSpeed;

    if(p.y > canvas.height){
      Object.assign(p,createPetal(),{y:-20});
    }

    drawPetal(p);
  });

  requestAnimationFrame(update);
}

update();
