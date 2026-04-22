"use client";

import { useEffect, useRef } from "react";

type Band = {
  y: number;
  h: number;
  color: string;
  speed: number;
  offset: number;
  drift: number;
  driftSeed: number;
};

export default function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const colors = ["#D92027", "#1E54A1"];
    const speeds = [0.18, 0.32, 0.48];
    let bands: Band[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let pointerX = 0;
    let pointerY = 0;
    let currentPX = 0;
    let currentPY = 0;
    let raf = 0;

    function seedBands() {
      const count = 32;
      const out: Band[] = [];
      for (let i = 0; i < count; i++) {
        const h = 6 + Math.random() * 34;
        const y = Math.random() * height;
        out.push({
          y,
          h,
          color: colors[Math.floor(Math.random() * colors.length)],
          speed: speeds[Math.floor(Math.random() * speeds.length)] * (Math.random() > 0.5 ? 1 : -1),
          offset: Math.random() * width,
          drift: 0,
          driftSeed: Math.random() * Math.PI * 2,
        });
      }
      bands = out;
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedBands();
    }

    function paint(t: number) {
      ctx!.clearRect(0, 0, width, height);

      // ease pointer
      currentPX += (pointerX - currentPX) * 0.06;
      currentPY += (pointerY - currentPY) * 0.06;

      // soft gradient background
      const bg = ctx!.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, "#0B0E14");
      bg.addColorStop(1, "#111827");
      ctx!.fillStyle = bg;
      ctx!.fillRect(0, 0, width, height);

      // radial bloom
      const bloom = ctx!.createRadialGradient(
        width * 0.72 + currentPX * 12,
        height * 0.2 + currentPY * 8,
        0,
        width * 0.72 + currentPX * 12,
        height * 0.2 + currentPY * 8,
        Math.max(width, height) * 0.6,
      );
      bloom.addColorStop(0, "rgba(30,84,161,0.32)");
      bloom.addColorStop(1, "rgba(30,84,161,0)");
      ctx!.fillStyle = bloom;
      ctx!.fillRect(0, 0, width, height);

      const bloom2 = ctx!.createRadialGradient(
        width * 0.18 - currentPX * 10,
        height * 0.85 - currentPY * 6,
        0,
        width * 0.18 - currentPX * 10,
        height * 0.85 - currentPY * 6,
        Math.max(width, height) * 0.5,
      );
      bloom2.addColorStop(0, "rgba(217,32,39,0.25)");
      bloom2.addColorStop(1, "rgba(217,32,39,0)");
      ctx!.fillStyle = bloom2;
      ctx!.fillRect(0, 0, width, height);

      // parallax shift
      const px = currentPX * 14;
      const py = currentPY * 10;

      for (let i = 0; i < bands.length; i++) {
        const b = bands[i];
        const drift = Math.sin(t * 0.0006 + b.driftSeed) * 6;
        const x = ((b.offset + t * b.speed) % (width + 400)) - 200 + px * 0.6;
        ctx!.fillStyle = b.color;
        ctx!.globalAlpha = 0.55;
        ctx!.fillRect(x, b.y + drift + py * 0.4, width * 0.85, b.h);
        ctx!.globalAlpha = 0.2;
        ctx!.fillRect(x - width * 0.4, b.y + drift + py * 0.4, width * 0.4, b.h);
      }

      ctx!.globalAlpha = 1;

      // vignette
      const vignette = ctx!.createLinearGradient(0, 0, 0, height);
      vignette.addColorStop(0, "rgba(11,14,20,0)");
      vignette.addColorStop(1, "rgba(11,14,20,0.55)");
      ctx!.fillStyle = vignette;
      ctx!.fillRect(0, 0, width, height);

      raf = requestAnimationFrame(paint);
    }

    function paintStatic() {
      ctx!.clearRect(0, 0, width, height);
      const bg = ctx!.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, "#0B0E14");
      bg.addColorStop(1, "#1F2937");
      ctx!.fillStyle = bg;
      ctx!.fillRect(0, 0, width, height);

      ctx!.fillStyle = "rgba(217,32,39,0.75)";
      ctx!.fillRect(0, height * 0.38, width, 18);
      ctx!.fillStyle = "rgba(30,84,161,0.6)";
      ctx!.fillRect(0, height * 0.52, width, 8);
    }

    function onMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      pointerX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    }

    resize();
    if (reduce) {
      paintStatic();
    } else {
      raf = requestAnimationFrame(paint);
      window.addEventListener("pointermove", onMove, { passive: true });
    }

    window.addEventListener("resize", resize);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
    />
  );
}
