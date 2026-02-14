(() => {
  const loader = document.getElementById("loader");
  const bar = document.getElementById("loaderProgress");
  const toastEl = document.getElementById("toast");

  const toast = (msg, ms=2200) => {
    if(!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    setTimeout(()=>toastEl.classList.remove("show"), ms);
  };

  // 加载页：固定时长 + 兜底必消失
  window.addEventListener("load", ()=>{
    if(!loader || !bar) return;

    let percent = 0;
    const duration = 3500; // 想慢：4500
    const step = 30;
    const inc = 100 / (duration / step);

    const timer = setInterval(()=>{
      percent += inc;
      if(percent >= 100){
        percent = 100;
        clearInterval(timer);
        setTimeout(()=>loader.classList.add("hide"), 280);
        setTimeout(()=>loader.remove(), 1600);
      }
      bar.style.width = percent + "%";
    }, step);

    setTimeout(()=>{
      try{ loader.classList.add("hide"); }catch{}
      try{ loader.remove(); }catch{}
    }, duration + 1200);
  });

  // 文案逐行渐显
  const TEXT = [
    "有些人出现，是为了热闹。",
    "有些人出现，是为了让时间变得更安静。",
    "愿你始终走在自己的节奏里，不被打扰，不被消耗。",
    "愿你所遇皆温柔，所行皆坦然。",
    "未来很长，祝你越来越好。"
  ];
  const linesBox = document.getElementById("lines");
  if(linesBox){
    TEXT.forEach((t,i)=>{
      const d = document.createElement("div");
      d.className = "line";
      d.textContent = t;
      linesBox.appendChild(d);
      setTimeout(()=>d.classList.add("show"), 500 + i*900);
    });
  }

  // 音乐
  const bgm = document.getElementById("bgm");
  const btn = document.getElementById("musicBtn");
  let playing = false;

  function play(){
    if(!bgm || !btn) return;
    bgm.volume = 0.25;
    bgm.play().then(()=>{
      playing = true;
      btn.classList.add("playing");
      toast("♪ 音乐已开启");
    }).catch(()=>toast("需要点一下按钮才能播放音乐"));
  }
  function pause(){
    if(!bgm || !btn) return;
    bgm.pause();
    playing = false;
    btn.classList.remove("playing");
    toast("♪ 音乐已暂停");
  }
  if(btn){
    btn.addEventListener("click",(e)=>{
      e.stopPropagation();
      playing ? pause() : play();
    });
  }

  // 玫瑰（大朵慢飘）
  const canvas = document.getElementById("petals");
  if(canvas){
    const ctx = canvas.getContext("2d");
    const rose = new Image();
    rose.src = "rose.png";
    const rand = (min,max)=>Math.random()*(max-min)+min;

    function resize(){
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    let petals = [];
    const build = (count)=> petals = Array.from({length:count}).map(()=>({
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
    build(28);

    function loop(){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      if(rose.complete && rose.naturalWidth){
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

    // 彩蛋：互不干扰（双击/长按/三连击）
    const card = document.getElementById("card");
    if(card){
      // 长按
      let pressTimer=null;
      const startPress=()=>pressTimer=setTimeout(()=>toast("🌙 有些温柔，是时间慢慢给你的。",2600),700);
      const cancelPress=()=>{ if(pressTimer) clearTimeout(pressTimer); pressTimer=null; };
      card.addEventListener("pointerdown", startPress);
      card.addEventListener("pointerup", cancelPress);
      card.addEventListener("pointerleave", cancelPress);
      card.addEventListener("pointermove", cancelPress);

      // 双击/三连击互斥：三连击优先
      let times=[];
      let settle=null;
      let lock=false;

      const romantic=()=>{
        if(lock) return;
        lock=true;
        build(46);
        toast("✨ 更浪漫模式 10 秒",2200);
        setTimeout(()=>{
          build(28);
          lock=false;
          toast("🌙 回归安静",1800);
        },10000);
      };

      card.addEventListener("click", ()=>{
        const now=Date.now();
        times.push(now);
        times=times.filter(t=>now-t<=3000);

        if(settle) clearTimeout(settle);

        if(times.length>=3){
          times=[];
          romantic();
          return;
        }

        settle=setTimeout(()=>{
          if(times.length===2){
            toast("🌹 愿你一直被温柔对待。",2200);
          }
          times=[];
          settle=null;
        },360);
      });
    }
  }
})();
