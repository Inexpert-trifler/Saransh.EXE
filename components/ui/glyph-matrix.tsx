"use client";

import React, { useEffect, useRef } from "react";

interface GlyphMatrixProps {
  className?: string;
  glyphs?: string;
  color?: string;
  cellSize?: number;
  mutationRate?: number;
  interval?: number;
  fade?: number;
  opacity?: number;
}

export function GlyphMatrix({
  className = "",
  glyphs = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンXYZ_#<>{}",
  color = "#B9FF66",
  cellSize = 20,
  mutationRate = 0.05,
  interval = 40,
  fade = 0.06,
  opacity = 0.18,
}: GlyphMatrixProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      return;
    }

    let animationFrameId: number;
    let lastRenderTime = 0;
    let columns = 0;
    let drops: number[] = [];

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for performance
      const width = canvas.parentElement?.clientWidth || window.innerWidth;
      const height = canvas.parentElement?.clientHeight || window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      columns = Math.floor(width / cellSize);
      drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -50));
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const render = (time: number) => {
      animationFrameId = requestAnimationFrame(render);

      // Throttle render interval for battery & performance
      if (time - lastRenderTime < interval) return;
      lastRenderTime = time;

      const width = canvas.parentElement?.clientWidth || window.innerWidth;
      const height = canvas.parentElement?.clientHeight || window.innerHeight;

      // Dark translucent fade over previous frame
      ctx.fillStyle = `rgba(8, 8, 8, ${fade})`;
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${cellSize - 4}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = glyphs[Math.floor(Math.random() * glyphs.length)];
        const x = i * cellSize;
        const y = drops[i] * cellSize;

        // Head glyph glows brighter
        if (Math.random() < 0.1) {
          ctx.fillStyle = "#ffffff";
        } else {
          ctx.fillStyle = color;
        }

        ctx.fillText(char, x, y);

        if (y > height && Math.random() > 0.985) {
          drops[i] = 0;
        }

        drops[i]++;

        // Random mutation of column speeds
        if (Math.random() < mutationRate) {
          drops[i] += Math.random() > 0.5 ? 1 : 0;
        }
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [glyphs, color, cellSize, mutationRate, interval, fade]);

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ opacity }}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
