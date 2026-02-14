const TEXT=[
"有些人出现，是为了热闹。",
"",
"有些人出现，是为了让时间变得更安静。",
"",
"愿你所遇皆温柔，",
"所行皆坦然。",
"",
"未来很长，",
"祝你越来越好。"
].join("\n");

function reveal(){
 const box=document.getElementById("blessingText");
 box.innerHTML="";
 TEXT.split("\n").forEach((l,i)=>{
   const d=document.createElement("div");
   d.className="line";
   d.innerHTML=l||"&nbsp;";
   box.appendChild(d);
   setTimeout(()=>d.classList.add("show"),i*420);
 });
}

function loader(){
 const fill=document.getElementById("loaderFill");
 const loader=document.getElementById("loader");
 const app=document.getElementById("app");

 let p=0;
 const t=setInterval(()=>{
   p=Math.min(95,p+Math.random()*2);
   fill.style.width=p+"%";
 },180);

 setTimeout(()=>{
   clearInterval(t);
   fill.style.width="100%";
   setTimeout(()=>{
     loader.style.opacity="0";
     setTimeout(()=>loader.remove(),1000);
     app.classList.remove("hidden");
     reveal();
   },600);
 },4500);
}

function roses(){
 const canvas=document.getElementById("petals");
 const ctx=canvas.getContext("2d");

 function resize(){
   canvas.width=window.innerWidth;
   canvas.height=window.innerHeight;
 }
 resize();
 window.addEventListener("resize",resize);

 const img=new Image();
 img.src="rose.png";

 const rand=(a,b)=>Math.random()*(b-a)+a;

 const petals=Array.from({length:70}).map(()=>({
   x:rand(0,canvas.width),
   y:rand(-canvas.height,canvas.height),
   s:rand(40,90), /* 加大 */
   vy:rand(1.2,3),
   vx:rand(-0.6,0.6),
   rot:rand(0,Math.PI*2),
   vr:rand(-0.02,0.02),
   a:rand(.3,.7)
 }));

 function draw(){
   ctx.clearRect(0,0,canvas.width,canvas.height);
   for(const p of petals){
     p.y+=p.vy;
     p.x+=p.vx;
     p.rot+=p.vr;
     if(p.y>canvas.height+120){
       p.y=-60;
       p.x=rand(0,canvas.width);
     }
     ctx.save();
     ctx.globalAlpha=p.a;
     ctx.translate(p.x,p.y);
     ctx.rotate(p.rot);
     ctx.drawImage(img,-p.s/2,-p.s/2,p.s,p.s);
     ctx.restore();
   }
   requestAnimationFrame(draw);
 }
 img.onload=draw;
}

function music(){
 const bgm=document.getElementById("bgm");
 const btn=document.getElementById("musicBtn");
 let playing=false;

 btn.onclick=e=>{
   e.stopPropagation();
   if(!playing){
     bgm.volume=0;
     bgm.play();
     let v=0;
     const f=setInterval(()=>{
       v+=.02;
       bgm.volume=Math.min(.25,v);
       if(v>=.25)clearInterval(f);
     },50);
     btn.classList.add("playing");
     playing=true;
   }else{
     bgm.pause();
     btn.classList.remove("playing");
     playing=false;
   }
 };
}

function easter(){
 const card=document.getElementById("card");
 let last=0;
 card.onclick=()=>{
   const now=Date.now();
   if(now-last<300){
     const t=document.getElementById("toast");
     t.textContent="🌹 愿你一直被温柔对待。";
     t.classList.add("show");
     setTimeout(()=>t.classList.remove("show"),2000);
   }
   last=now;
 };
}

loader();
roses();
music();
easter();
