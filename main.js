(() => {

const toastEl = document.getElementById("toast");
const toast = (msg,ms=2000)=>{
 if(!toastEl)return;
 toastEl.textContent=msg;
 toastEl.classList.add("show");
 setTimeout(()=>toastEl.classList.remove("show"),ms);
};

// 加载页
window.addEventListener("load",()=>{
 const loader=document.getElementById("loader");
 const bar=document.getElementById("loaderProgress");
 if(!loader||!bar)return;

 let p=0;
 const duration=3000;
 const step=30;
 const inc=100/(duration/step);

 const timer=setInterval(()=>{
   p+=inc;
   if(p>=100){
     p=100;
     clearInterval(timer);
     setTimeout(()=>loader.classList.add("hide"),200);
     setTimeout(()=>loader.remove(),1200);
   }
   bar.style.width=p+"%";
 },step);

 setTimeout(()=>{
   try{loader.remove();}catch{}
 },duration+1500);
});

// 文案
const text=`有些人出现，是为了热闹。

有些人出现，是为了让时间变得更安静。

愿你所遇皆温柔，
所行皆坦然。

未来很长，
祝你越来越好。`;

const box=document.getElementById("text");
if(box){
 let i=0;
 const timer=setInterval(()=>{
   box.textContent=text.slice(0,i++);
   if(i>text.length)clearInterval(timer);
 },30);
}

// 音乐
const bgm=document.getElementById("bgm");
const btn=document.getElementById("musicBtn");
let playing=false;

function play(){
 if(!bgm)return;
 bgm.volume=0.25;
 bgm.play().then(()=>{
   playing=true;
   btn.classList.add("playing");
 });
}
function pause(){
 if(!bgm)return;
 bgm.pause();
 playing=false;
 btn.classList.remove("playing");
}

if(btn){
 btn.addEventListener("click",e=>{
   e.stopPropagation();
   playing?pause():play();
 });
}

// 玫瑰
const canvas=document.getElementById("petals");
if(canvas){
 const ctx=canvas.getContext("2d");
 const rose=new Image();
 rose.src="rose.png";

 function resize(){
   canvas.width=window.innerWidth;
   canvas.height=window.innerHeight;
 }
 resize();
 window.addEventListener("resize",resize);

 const rand=(min,max)=>Math.random()*(max-min)+min;

 let petals=Array.from({length:25}).map(()=>({
   x:rand(0,canvas.width),
   y:rand(-canvas.height,canvas.height),
   s:rand(60,120),
   vy:rand(.2,.5),
   vx:rand(-.1,.1),
   rot:rand(0,Math.PI*2),
   vr:rand(-.003,.003),
   a:rand(.2,.4)
 }));

 function loop(){
   ctx.clearRect(0,0,canvas.width,canvas.height);
   if(rose.complete){
     for(const p of petals){
       p.y+=p.vy;
       p.x+=p.vx;
       p.rot+=p.vr;
       if(p.y>canvas.height+150){
         p.y=-150;
         p.x=rand(0,canvas.width);
       }
       ctx.save();
       ctx.globalAlpha=p.a;
       ctx.translate(p.x,p.y);
       ctx.rotate(p.rot);
       ctx.drawImage(rose,-p.s/2,-p.s/2,p.s,p.s);
       ctx.restore();
     }
   }
   requestAnimationFrame(loop);
 }
 rose.onload=loop;
}

})();
