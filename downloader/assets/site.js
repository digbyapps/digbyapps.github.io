// Digby family site: animated sky (canvas), solid nav after the hero, gentle rise-in on scroll.
// data-motif="family": the Compressor's sideways streaks and the Downloader's falling streaks meet at one dawn point.
// data-motif="landfall": the Downloader's falling streaks alone.
(function () {
  document.documentElement.classList.add("js");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function sky(canvas) {
    const ctx = canvas.getContext("2d");
    const motif = canvas.dataset.motif || "landfall";
    let w = 0, h = 0, dpr = 1, start = performance.now();
    function size() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function streak(x0, y0, c1x, c1y, c2x, c2y, x1, y1, width, alpha, progress, horizontal) {
      const g = horizontal ? ctx.createLinearGradient(x0, 0, x1, 0) : ctx.createLinearGradient(0, y0, 0, y1);
      g.addColorStop(0, "rgba(255,255,255,0)");
      g.addColorStop(0.45, `rgba(255,255,255,${alpha * 0.55})`);
      g.addColorStop(1, `rgba(255,255,255,${alpha})`);
      ctx.strokeStyle = g; ctx.lineWidth = width; ctx.lineCap = "round";
      ctx.beginPath();
      // draw the curve up to `progress` by sampling
      const steps = 60, n = Math.max(1, Math.round(steps * progress));
      for (let i = 0; i <= n; i++) {
        const t = i / steps, u = 1 - t;
        const x = u*u*u*x0 + 3*u*u*t*c1x + 3*u*t*t*c2x + t*t*t*x1;
        const y = u*u*u*y0 + 3*u*u*t*c1y + 3*u*t*t*c2y + t*t*t*y1;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    }
    function frame(now) {
      if (!w || !h) { size(); if (!reduce) requestAnimationFrame(frame); return; }   // not laid out yet
      const t = (now - start) / 1000;
      const p = reduce ? 1 : Math.min(1, t / 2.2);           // draw-in on load
      const eased = 1 - Math.pow(1 - p, 3);
      ctx.clearRect(0, 0, w, h);
      // Wide screens: the meeting point sits right of the text. Narrower: lower and further right, streaks softer.
      const wide = w > 1000;
      const end = { x: w * (wide ? (motif === "family" ? 0.72 : 0.7) : 0.84), y: h * (wide ? 0.78 : 0.9) };
      const soft = wide ? 1 : 0.5;
      const scale = Math.min(w, h * 1.6);
      // horizon
      const hg = ctx.createLinearGradient(0, 0, w, 0);
      hg.addColorStop(0, "rgba(255,255,255,0)"); hg.addColorStop(end.x / w, "rgba(255,255,255,.35)"); hg.addColorStop(1, "rgba(255,255,255,0)");
      ctx.strokeStyle = hg; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, end.y); ctx.lineTo(w, end.y); ctx.stroke();
      // falling streaks (Downloader)
      const fall = 7;
      for (let i = 0; i < fall; i++) {
        const f = i / (fall - 1), centre = Math.abs(f - 0.5) * 2;
        const sway = reduce ? 0 : Math.sin(t * 0.3 + i * 1.7) * w * 0.006;
        const spread = motif === "family" ? 0.5 : 0.7;
        const x0 = end.x + (f - 0.5) * w * spread + sway;
        streak(x0, -h * 0.05, x0, h * 0.4, end.x + (x0 - end.x) * 0.2, end.y * 0.82, end.x + (x0 - end.x) * 0.03, end.y,
               Math.max(1, scale * (0.006 - centre * 0.0035)), (0.9 - centre * 0.4) * soft, eased, false);
      }
      // sideways streaks (Compressor), family page only
      if (motif === "family") {
        const side = 5;
        for (let i = 0; i < side; i++) {
          const f = i / (side - 1), centre = Math.abs(f - 0.5) * 2;
          const drift = reduce ? 0 : Math.sin(t * 0.35 + i * 1.3) * h * 0.01;
          const y0 = end.y + (f - 0.5) * h * 0.55 + drift;
          // starts halfway across (wide screens), so the streaks never run through the headline and buttons
          const sx = w * 0.45;
          streak(sx, y0, sx + (end.x - sx) * 0.45, y0, end.x - (end.x - sx) * 0.2, end.y + (y0 - end.y) * 0.25, end.x - 2, end.y + (y0 - end.y) * 0.03,
                 Math.max(1, scale * (0.005 - centre * 0.003)), (0.75 - centre * 0.35) * soft, eased, true);
        }
      }
      // the dawn point
      if (eased > 0.98) {
        const r = Math.max(3, scale * 0.006);
        const glow = ctx.createRadialGradient(end.x, end.y, 0, end.x, end.y, r * 9);
        glow.addColorStop(0, "rgba(255,232,214,.9)"); glow.addColorStop(0.35, "rgba(242,194,160,.35)"); glow.addColorStop(1, "rgba(242,194,160,0)");
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(end.x, end.y, r * 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(end.x, end.y, r, 0, Math.PI * 2); ctx.fill();
      }
      if (!reduce && !document.hidden) requestAnimationFrame(frame);
    }
    size(); addEventListener("resize", () => { size(); if (reduce) frame(performance.now()); });
    document.addEventListener("visibilitychange", () => { if (!document.hidden && !reduce) requestAnimationFrame(frame); });
    requestAnimationFrame(frame);
  }
  document.querySelectorAll("canvas[data-motif]").forEach(sky);

  // nav turns solid once the hero is mostly scrolled past
  const nav = document.querySelector("nav.top"), hero = document.querySelector(".hero");
  if (nav && hero) {
    const mark = hero.querySelector(".eyebrow") || hero;
    const update = () => nav.classList.toggle("solid", mark.getBoundingClientRect().top < nav.offsetHeight + 28 || hero.getBoundingClientRect().bottom < 90);
    addEventListener("scroll", update, { passive: true }); update();
  }

  // rise-in
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target) } }), { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".rise").forEach(el => io.observe(el));
  } else document.querySelectorAll(".rise").forEach(el => el.classList.add("in"));
})();
