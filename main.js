(() => {
  // ===== 工具：toast =====
  const toastEl = document.getElementById("toast");
  function toast(msg, ms = 2200) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    setTimeout(() => toastEl.classList.remove("show"), ms);
  }

  // ===== 文字逐行出现 =====
  const lineEls = Array.from(document.querySelectorAll("#lines .line"));
  lineEls.forEach((el, i) => setTimeout(() => el.classList.add("show"), 600 + i * 900));

  // ===== 加载页 =====
  const loader = document.getElementById("loader");
  const bar = document.getElementById("loaderProgress");
  function startLoader() {
    if (!loader || !bar) return;

    let percent = 0;
    const duration = 4200;
    const step = 30;
    const inc = 100 / (duration / step);

    const timer = setInterval(() => {
      percent += inc;
      if (percent >= 100) {
        percent = 100;
        clearInterval(timer);
        setTimeout(() => loader.classList.add("hide"), 280);
        setTimeout(() => loader.remove(), 1800);
      }
      bar.style.width = percent + "%";
    }, step);

    setTimeout(() => {
      try { loader.classList.add("hide"); } catch {}
      try { loader.remove(); } catch {}
    }, 5200);
  }
  window.addEventListener("load", startLoader);

  // ===== 背景照片 4 张轮播（两层交叉淡入）=====
  const bgA = document.getElementById("bgA");
  const bgB = document.getElementById("bgB");
  const PHOTOS = ["bg1.jpg","bg2.jpg","bg3.jpg","bg4.jpg"];
  const CHANGE_MS = 12000;

  function preloadImg(src) {
    return new Promise((res) => {
      const img = new Image();
      img.onload = () => res(true);
      img.onerror = () => res(false);
      img.src = src + "?v=" + Date.now();
    });
  }

  function setPhoto(el, src){
    // 兜底渐变 + 照片（就算照片失败也不会黑）
    el.style.backgroundImage =
      `radial-gradient(circle at 30% 20%, rgba(255,210,200,.30), rgba(10,10,14,.92)), url("${src}")`;
  }

  if (bgA && bgB) {
    let idx = 0;
    let showingA = true;

    // 初始显示第一张（失败也没关系，有兜底渐变）
    setPhoto(bgA, PHOTOS[0]);
    bgA.classList.add("show");

    setInterval(async () => {
      idx = (idx + 1) % PHOTOS.length;
      const next = PHOTOS[idx];

      const inEl = showingA ? bgB : bgA;
      const outEl = showingA ? bgA : bgB;

      const ok = await preloadImg(next);
      setPhoto(inEl, ok ? next : ""); // 失败也有渐变兜底

      inEl.classList.add("show");
      outEl.classList.remove("show");
      showingA = !showingA;
    }, CHANGE_MS);
  }

  // ===== 背景音乐（按钮 + 首次点击解锁）=====
  const musicBtn = document.getElementById("musicBtn");
  const bgm = document.getElementById("bgm");
  let playing = false;

  function fadeInMusic(){
    if(!bgm || !musicBtn) return;
    bgm.volume = 0;
    bgm.play().then(()=>{
      playing = true;
      musicBtn.classList.add("playing");
      let v = 0;
      const t = setInterval(()=>{
        v += 0.02;
        bgm.volume = Math.min(0.22, v);
        if(v >= 0.22) clearInterval(t);
      }, 120);
      toast("♪ 音乐已开启");
    }).catch(()=> toast("需要点一下按钮才能播放音乐"));
  }

  function fadeOutPause(){
    if(!bgm || !musicBtn || !playing) return;
    const t = setInterval(()=>{
      bgm.volume = Math.max(0, bgm.volume - 0.03);
      if(bgm.volume <= 0){
        clearInterval(t);
        bgm.pause();
        playing = false;
        musicBtn.classList.remove("playing");
        toast("♪ 音乐已暂停");
      }
    }, 70);
  }

  if(musicBtn){
    musicBtn.addEventListener("click",(e)=>{
      e.stopPropagation();
      playing ? fadeOutPause() : fadeInMusic();
    });
  }

  document.addEventListener("click", ()=>{
    if(!playing) fadeInMusic();
  }, { once:true });

  // ===== 玫瑰特效（不变：大朵慢飘）=====
  const canvas = document.getElementById("roses");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    const rose = new Image();
    rose.src = "rose.png";
    const rand = (min, max) => Math.random() * (max - min) + min;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    let petals = [];
    function build(count) {
      petals = Array.from({ length: count }).map(() => ({
        x: rand(0, canvas.width),
        y: rand(-canvas.height, canvas.height),
        s: rand(64, 140),
        vy: rand(0.22, 0.55),
        vx: rand(-0.10, 0.10),
        a: rand(0.18, 0.38),
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.0025, 0.0025),
        wob: rand(0, Math.PI * 2)
      }));
    }
    build(28);

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (rose.complete && rose.naturalWidth) {
        for (const p of petals) {
          p.wob += 0.006;
          p.x += p.vx + Math.sin(p.wob) * 0.14;
          p.y += p.vy;
          p.rot += p.vr;

          if (p.y > canvas.height + 180) {
            p.y = -180;
            p.x = rand(0, canvas.width);
          }

          ctx.save();
          ctx.globalAlpha = p.a;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.drawImage(rose, -p.s / 2, -p.s / 2, p.s, p.s);
          ctx.restore();
        }
      }
      requestAnimationFrame(loop);
    }
    rose.onload = loop;

    // ===== 彩蛋（互不干扰版）=====
    const card = document.getElementById("card");
    if(card){
      // 互斥核心：用一个“手势判定器”
      // 逻辑：双击只认 “2次点击且没有变成三连击”，三连击优先级高于双击。
      let clickTimes = [];
      let clickTimer = null;
      let romanticLock = false;

      // 长按彩蛋（独立，不干扰）
      let pressTimer = null;
      const startPress = () => {
        pressTimer = setTimeout(() => {
          toast("🌙 有些温柔，是时间慢慢给你的。", 2600);
        }, 700);
      };
      const cancelPress = () => {
        if (!pressTimer) return;
        clearTimeout(pressTimer);
        pressTimer = null;
      };
      card.addEventListener("touchstart", startPress, { passive: true });
      card.addEventListener("touchend", cancelPress, { passive: true });
      card.addEventListener("touchmove", cancelPress, { passive: true });
      card.addEventListener("mousedown", startPress);
      card.addEventListener("mouseup", cancelPress);
      card.addEventListener("mouseleave", cancelPress);

      function triggerRomanticMode() {
        if (romanticLock) return;
        romanticLock = true;

        build(46);
        document.documentElement.style.setProperty(
          "--veil",
          "linear-gradient(rgba(0,0,0,.14), rgba(0,0,0,.14))"
        );
        toast("✨ 更浪漫模式 10 秒", 2200);

        setTimeout(() => {
          build(28);
          document.documentElement.style.setProperty(
            "--veil",
            "linear-gradient(rgba(0,0,0,.22), rgba(0,0,0,.22))"
          );
          romanticLock = false;
          toast("🌙 回归安静", 1800);
        }, 10000);
      }

      card.addEventListener("click", () => {
        const now = Date.now();

        // 记录点击时间（只保留最近3秒内）
        clickTimes.push(now);
        clickTimes = clickTimes.filter(t => now - t <= 3000);

        // 清除旧结算
        if (clickTimer) clearTimeout(clickTimer);

        // 三连击优先：一旦达到3次立即触发，并清空
        if (clickTimes.length >= 3) {
          clickTimes = [];
          triggerRomanticMode();
          return;
        }

        // 结算双击：等待 350ms 看会不会继续变成三连击
        clickTimer = setTimeout(() => {
          // 结算时如果刚好是2次且未升级到3次 → 双击彩蛋
          if (clickTimes.length === 2) {
            toast("🌹 愿你一直被温柔对待。", 2200);
          }
          clickTimes = [];
          clickTimer = null;
        }, 350);
      });
    }
  }
})();
