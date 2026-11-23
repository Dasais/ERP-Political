import { useEffect, useRef } from "react";

type Ember = { x: number; y: number; r: number; vy: number; sway: number; phase: number; life: number; max: number };

/** Золотые искры, медленно поднимающиеся вверх, как от факела. Выключаются при reduced-motion. */
export default function Embers() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    let running = true;
    let visible = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const embers: Ember[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawn = (initial = false): Ember => ({
      x: Math.random() * w,
      y: initial ? Math.random() * h : h + 10,
      r: 0.6 + Math.random() * 1.9,
      vy: 0.25 + Math.random() * 0.75,
      sway: 8 + Math.random() * 22,
      phase: Math.random() * Math.PI * 2,
      life: initial ? Math.random() * 400 : 0,
      max: 420 + Math.random() * 380,
    });

    resize();
    const count = w < 640 ? 24 : 48;
    for (let i = 0; i < count; i++) embers.push(spawn(true));

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!running || !visible) return;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < embers.length; i++) {
        const e = embers[i];
        e.life += 1;
        e.y -= e.vy;
        const t = e.life / e.max;
        const x = e.x + Math.sin(e.life * 0.018 + e.phase) * e.sway;
        const alpha = Math.sin(Math.min(1, t) * Math.PI) * 0.85;
        if (t >= 1 || e.y < -10) {
          embers[i] = spawn();
          continue;
        }
        const g = ctx.createRadialGradient(x, e.y, 0, x, e.y, e.r * 4);
        g.addColorStop(0, `rgba(255, 218, 130, ${alpha})`);
        g.addColorStop(0.35, `rgba(214, 160, 70, ${alpha * 0.45})`);
        g.addColorStop(1, "rgba(214, 160, 70, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, e.y, e.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    raf = requestAnimationFrame(frame);

    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { threshold: 0 });
    io.observe(canvas);
    const onVis = () => (running = !document.hidden);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="pointer-events-none absolute inset-0 z-[1] h-full w-full" aria-hidden="true" />;
}
