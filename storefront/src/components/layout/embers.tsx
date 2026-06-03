"use client";

import { useEffect, useRef } from "react";

/**
 * Floating ash embers — a single rAF loop over a fixed particle pool.
 * Perf contract: capped count (fewer on mobile), DPR<=2, paused when the tab
 * is hidden, and disabled entirely under prefers-reduced-motion.
 */
export function Embers() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const COUNT = isMobile ? 12 : 34;

    let w = 0;
    let h = 0;
    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    type P = { x: number; y: number; r: number; vy: number; vx: number; a: number };
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const spawn = (): P => ({
      x: rand(0, w),
      y: rand(0, h),
      r: rand(0.6, 1.8),
      vy: rand(-0.25, -0.7),
      vx: rand(-0.15, 0.15),
      a: rand(0.15, 0.6),
    });
    const pool: P[] = Array.from({ length: COUNT }, spawn);

    let raf = 0;
    let running = true;
    const tick = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (const p of pool) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -4 || p.x < -4 || p.x > w + 4) Object.assign(p, spawn(), { y: h + 4 });
        ctx.beginPath();
        ctx.fillStyle = `rgba(249, 115, 22, ${p.a})`;
        ctx.shadowColor = "rgba(255, 106, 26, 0.8)";
        ctx.shadowBlur = 6;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onVisibility = () => {
      running = !document.hidden;
      if (running) raf = requestAnimationFrame(tick);
      else cancelAnimationFrame(raf);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
