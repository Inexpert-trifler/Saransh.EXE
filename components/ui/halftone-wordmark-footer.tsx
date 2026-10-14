"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { portfolioData } from "@/data/portfolio";

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface HalftoneWordmarkFooterProps {
  wordmark?: string;
  label?: string;
  meta?: string;
  bio?: string;
  columns?: FooterColumn[];
  backToTop?: boolean;
  preset?: "night" | "paper" | "ember" | "cobalt";
  palette?: {
    background?: string;
    ink?: string;
    warm?: string;
  };
  dotGap?: number;
  radius?: number;
  crop?: number;
  grain?: number;
  interactive?: boolean;
  fontFamily?: string;
  fontWeight?: number | string;
  monoFamily?: string;
  className?: string;
}

const PRESET_PALETTES = {
  night: {
    background: "#080808",
    ink: "#e4e4e7",
    warm: "#B9FF66", // Signature acid-lime green
  },
  paper: {
    background: "#efebe3",
    ink: "#17150f",
    warm: "#84cc16",
  },
  ember: {
    background: "#160a06",
    ink: "#f2c48c",
    warm: "#B9FF66",
  },
  cobalt: {
    background: "#0d1b4d",
    ink: "#dfe7ff",
    warm: "#B9FF66",
  },
};

export const DEFAULT_SARANSH_COLUMNS: FooterColumn[] = [
  {
    title: "EXPLORE",
    links: [
      { label: "About", href: "#about" },
      { label: "Selected Projects", href: "#work" },
      { label: "Tech Stack", href: "#stack" },
      { label: "Contribution Activity", href: "#activity" },
      { label: "Journey", href: "#journey" },
    ],
  },
  {
    title: "PROJECTS",
    links: [
      {
        label: "SignalX",
        href: "https://github.com/Inexpert-trifler/SignalX-Hackathon",
        external: true,
      },
      {
        label: "PromptGym",
        href: "https://github.com/Inexpert-trifler/Scaler_Hackathon",
        external: true,
      },
      {
        label: "RakshakLogix",
        href: "https://github.com/Inexpert-trifler/RakshakLogix",
        external: true,
      },
      {
        label: "ResumeOS",
        href: "https://github.com/Inexpert-trifler/ResumeOS",
        external: true,
      },
      {
        label: "FinSightAI",
        href: "https://github.com/Inexpert-trifler/FinSightAI",
        external: true,
      },
    ],
  },
  {
    title: "CONNECT",
    links: [
      {
        label: "GitHub",
        href: "https://github.com/Inexpert-trifler",
        external: true,
      },
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/saransh-yadav-b72643336/",
        external: true,
      },
      {
        label: "Email",
        href: `mailto:${portfolioData.contact.email}`,
        external: false,
      },
      {
        label: "Get in Touch",
        href: "#contact",
        external: false,
      },
    ],
  },
];

const SAFE_CANVAS_FONT =
  '"Space Grotesk", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const DEFAULT_FONT_MONO =
  'var(--font-jetbrains), "JetBrains Mono", "SF Mono", ui-monospace, Menlo, Consolas, monospace';

function hexToRgb(colorStr: string): [number, number, number] | null {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((colorStr || "").trim());
  if (!match) return null;
  const hex =
    match[1].length === 3
      ? match[1]
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : match[1];
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
  ];
}

function computeDotRadius(intensity: number, dotGap: number): number {
  const clamped = intensity < 0 ? 0 : intensity > 1 ? 1 : intensity;
  return Math.max(0.75, Math.sqrt(clamped) * dotGap * 0.58);
}

function springStep(
  x: number,
  y: number,
  vx: number,
  vy: number,
  baseX: number,
  baseY: number,
  mouseX: number,
  mouseY: number,
  radius: number
): [number, number, number, number] {
  const dx = x - mouseX;
  const dy = y - mouseY;
  const distSq = dx * dx + dy * dy;

  if (radius > 0 && distSq < radius * radius) {
    const dist = Math.sqrt(distSq) + 0.001;
    const force = (1 - dist / radius) * 2.8;
    vx += (dx / dist) * force;
    vy += (dy / dist) * force;
  }

  vx = (vx + (baseX - x) * 0.05) * 0.84;
  vy = (vy + (baseY - y) * 0.05) * 0.84;

  return [x + vx, y + vy, vx, vy];
}

function calculateWarmth(
  x: number,
  y: number,
  baseX: number,
  baseY: number,
  maxDisplacement: number
): number {
  const dist = Math.hypot(x - baseX, y - baseY);
  return Math.min(1, dist / maxDisplacement);
}

const HWF_STYLES = `
.hwf-root {
  position: relative;
  width: 100%;
  background: var(--hwf-bg);
  color: var(--hwf-ink);
  -webkit-font-smoothing: antialiased;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
.hwf-content-wrap {
  position: relative;
  width: 100%;
  z-index: 2;
}
.hwf-top {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) repeat(3, minmax(0, 1fr));
  gap: 32px;
  padding: clamp(28px, 4vw, 48px) clamp(20px, 4vw, 56px) 0;
  font-family: var(--hwf-mono);
  font-size: 11px;
  letter-spacing: .18em;
  text-transform: uppercase;
  line-height: 1.8;
}
.hwf-brand strong {
  display: block;
  font-weight: 700;
  color: #ffffff;
  font-size: 14px;
  letter-spacing: .2em;
}
.hwf-brand .hwf-brand-meta {
  opacity: .6;
  display: block;
  font-size: 9.5px;
  margin-top: 4px;
  letter-spacing: .14em;
  color: #a1a1aa;
}
.hwf-brand .hwf-brand-bio {
  margin-top: 12px;
  opacity: .75;
  text-transform: none;
  font-family: "Space Grotesk", sans-serif;
  font-size: 12.5px;
  line-height: 1.6;
  letter-spacing: normal;
  max-width: 340px;
  color: #d4d4d8;
}
.hwf-col h3 {
  margin: 0 0 12px;
  font: inherit;
  opacity: .9;
  font-weight: 700;
  color: #B9FF66;
}
.hwf-col ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.hwf-col a, .hwf-up {
  color: inherit;
  text-decoration: none;
  opacity: .78;
  background: none;
  border: 0;
  padding: 0;
  font: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  cursor: pointer;
  background-image: linear-gradient(#B9FF66, #B9FF66);
  background-size: 0% 1px;
  background-repeat: no-repeat;
  background-position: 0 100%;
  transition: opacity .25s ease, background-size .35s cubic-bezier(.2,.7,.1,1), color .2s ease;
}
.hwf-col a:hover, .hwf-up:hover {
  opacity: 1;
  color: #B9FF66;
  background-size: 100% 1px;
}
.hwf-col a:focus-visible, .hwf-up:focus-visible {
  outline: 1.5px solid #B9FF66;
  outline-offset: 4px;
  opacity: 1;
  border-radius: 2px;
}
.hwf-rule {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin: clamp(24px, 3.2vw, 36px) clamp(20px, 4vw, 56px) 0;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-family: var(--hwf-mono);
  font-size: 10px;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
}
.hwf-rule-signoff {
  display: flex;
  align-items: center;
  gap: 8px;
}
.hwf-rule-signoff .hwf-indicator {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background-color: #B9FF66;
  box-shadow: 0 0 8px #B9FF66;
}
.hwf-wordmark-stage {
  position: relative;
  width: 100%;
  height: clamp(140px, 18vw, 250px);
  overflow: hidden;
  isolation: isolate;
  margin-top: 14px;
  cursor: crosshair;
  background: var(--hwf-bg);
}
.hwf-wordmark-stage canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}
.hwf-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
@media (max-width: 860px) {
  .hwf-top {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    row-gap: 28px;
  }
  .hwf-brand {
    grid-column: 1 / -1;
  }
}
@media (max-width: 560px) {
  .hwf-top {
    grid-template-columns: 1fr;
    row-gap: 22px;
    padding-top: 24px;
  }
  .hwf-rule {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .hwf-wordmark-stage {
    height: clamp(100px, 24vw, 150px);
    margin-top: 10px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .hwf-col a, .hwf-up { transition: none; }
}
`;

export default function HalftoneWordmarkFooter({
  wordmark = "saransh.exe",
  label = "SARANSH.EXE",
  meta = "CS STUDENT · DEVELOPER · VIBECODER · HACKATHON ENTHUSIAST",
  bio = "An experimental engineering lab turning late-night ideas into working systems. Exploring agentic AI, creative interfaces, and full-stack software.",
  columns = DEFAULT_SARANSH_COLUMNS,
  backToTop = true,
  preset = "night",
  palette,
  dotGap = 6,
  radius = 80,
  crop = 0.16,
  grain = 0.45,
  interactive = true,
  fontFamily = SAFE_CANVAS_FONT,
  fontWeight = 800,
  monoFamily = DEFAULT_FONT_MONO,
  className = "",
}: HalftoneWordmarkFooterProps) {
  const mergedPalette = useMemo(() => {
    return {
      ...(PRESET_PALETTES[preset] || PRESET_PALETTES.night),
      ...(palette || {}),
    };
  }, [preset, palette]);

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stateRef = useRef({
    colors: mergedPalette,
    dotGap,
    radius,
    crop,
    grain,
    interactive,
    fontFamily,
    fontWeight,
    wordmark,
  });

  useEffect(() => {
    stateRef.current = {
      colors: mergedPalette,
      dotGap,
      radius,
      crop,
      grain,
      interactive,
      fontFamily,
      fontWeight,
      wordmark,
    };
  }, [
    mergedPalette,
    dotGap,
    radius,
    crop,
    grain,
    interactive,
    fontFamily,
    fontWeight,
    wordmark,
  ]);

  const paletteKey = [
    wordmark,
    dotGap,
    crop,
    grain,
    fontFamily,
    fontWeight,
    mergedPalette.background,
    mergedPalette.ink,
    mergedPalette.warm,
  ].join("|");

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    stateRef.current = {
      colors: mergedPalette,
      dotGap,
      radius,
      crop,
      grain,
      interactive,
      fontFamily,
      fontWeight,
      wordmark,
    };

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let heightPx = 0;
    let dpr = 1;
    let mouseX = -1e5;
    let mouseY = -1e5;
    let rafId = 0;
    let isVisible = true;
    let isAnimating = true;
    let shockwave = { x: 0, y: 0, t: -1 };
    let dotBuffer = new Float32Array(0);
    let dotCount = 0;
    let noiseCanvas: HTMLCanvasElement | null = null;

    const inkRgb = hexToRgb(stateRef.current.colors.ink) || [228, 228, 231];
    const warmRgb = hexToRgb(stateRef.current.colors.warm) || [185, 255, 102];

    const layout = () => {
      const state = stateRef.current;
      const rect = stage.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      heightPx = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(heightPx * dpr);

      // Rasterize wordmark on offscreen canvas
      const offscreen = document.createElement("canvas");
      offscreen.width = width;
      offscreen.height = heightPx;
      const offCtx = offscreen.getContext("2d", { willReadFrequently: true });
      if (!offCtx) return;

      const text = state.wordmark || "saransh.exe";

      // Ensure valid canvas font family without CSS variables
      let safeFamily = state.fontFamily;
      if (!safeFamily || safeFamily.includes("var(")) {
        safeFamily = SAFE_CANVAS_FONT;
      }

      // Check font string validity
      const testFont = `${state.fontWeight} 100px ${safeFamily}`;
      offCtx.font = testFont;
      let effectiveFamily = safeFamily;
      if (offCtx.font.indexOf("100px") === -1) {
        effectiveFamily = "sans-serif";
        offCtx.font = `${state.fontWeight} 100px sans-serif`;
      }

      // Measure at 100px and compute target font size to fill the width
      const measured100 = offCtx.measureText(text).width;
      const targetWidth = Math.max(width * 0.98, width - 20);
      const fittedSize = measured100 > 0 ? (targetWidth / measured100) * 100 : 120;
      offCtx.font = `${state.fontWeight} ${fittedSize}px ${effectiveFamily}`;

      const textMetrics = offCtx.measureText(text);
      const ascent = textMetrics.actualBoundingBoxAscent || fittedSize * 0.74;
      const clampedCrop = Math.max(0, Math.min(0.35, state.crop));

      // Center horizontally and crop bottom edge intentionally
      const drawX = (width - textMetrics.width) / 2;
      const drawY = heightPx + ascent * clampedCrop;

      offCtx.fillStyle = "#000000";
      offCtx.textBaseline = "alphabetic";
      offCtx.fillText(text, drawX, drawY);

      const imgData = offCtx.getImageData(0, 0, width, heightPx).data;
      const effectiveGap = Math.max(4, state.dotGap);
      const cols = Math.ceil(width / effectiveGap);
      const rows = Math.ceil(heightPx / effectiveGap);
      const rawDots: number[] = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let alphaSum = 0;
          for (let sy = 0; sy < 3; sy++) {
            for (let sx = 0; sx < 3; sx++) {
              const px = Math.min(
                width - 1,
                Math.floor(c * effectiveGap + ((sx + 0.5) * effectiveGap) / 3)
              );
              const py = Math.min(
                heightPx - 1,
                Math.floor(r * effectiveGap + ((sy + 0.5) * effectiveGap) / 3)
              );
              alphaSum += imgData[(py * width + px) * 4 + 3];
            }
          }
          const density = alphaSum / (9 * 255);
          if (density < 0.05) continue;

          const dotX = c * effectiveGap + effectiveGap / 2;
          const dotY = r * effectiveGap + effectiveGap / 2;
          rawDots.push(
            dotX,
            dotY,
            0,
            0,
            dotX,
            dotY,
            computeDotRadius(density, effectiveGap)
          );
        }
      }

      dotBuffer = new Float32Array(rawDots);
      dotCount = rawDots.length / 7;

      // Generate random print grain texture
      noiseCanvas = document.createElement("canvas");
      noiseCanvas.width = 256;
      noiseCanvas.height = 256;
      const noiseCtx = noiseCanvas.getContext("2d");
      if (noiseCtx) {
        const noiseData = noiseCtx.createImageData(256, 256);
        for (let i = 0; i < noiseData.data.length; i += 4) {
          const val = Math.random() * 255;
          noiseData.data[i] = val;
          noiseData.data[i + 1] = val;
          noiseData.data[i + 2] = val;
          noiseData.data[i + 3] = Math.random() < 0.5 ? 0 : 255;
        }
        noiseCtx.putImageData(noiseData, 0, 0);
      }

      isAnimating = true;
    };

    const draw = (currentTime: number) => {
      const state = stateRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = state.colors.background;
      ctx.fillRect(0, 0, width, heightPx);

      const effectiveRadius =
        state.interactive && !prefersReducedMotion ? Math.max(0, state.radius) : 0;
      const shockAge = shockwave.t < 0 ? 1e9 : currentTime - shockwave.t;
      const shockRadius = shockAge * 0.95;

      let stillMoving = false;

      for (let i = 0; i < dotCount; i++) {
        const offset = i * 7;
        let x = dotBuffer[offset];
        let y = dotBuffer[offset + 1];
        let vx = dotBuffer[offset + 2];
        let vy = dotBuffer[offset + 3];
        const baseX = dotBuffer[offset + 4];
        const baseY = dotBuffer[offset + 5];
        const radius = dotBuffer[offset + 6];

        if (!prefersReducedMotion) {
          // Shockwave expanding pulse ring
          if (shockAge < 900) {
            const dx = baseX - shockwave.x;
            const dy = baseY - shockwave.y;
            const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;
            const ringDelta = Math.abs(dist - shockRadius);
            const ringIntensity = 1 - Math.min(1, ringDelta / 28);
            if (ringIntensity > 0) {
              const push = ringIntensity * 3.4 * (1 - shockAge / 900);
              vx += (dx / dist) * push;
              vy += (dy / dist) * push;
            }
          }

          // Pointer displacement and spring recoil
          const [nx, ny, nvx, nvy] = springStep(
            x,
            y,
            vx,
            vy,
            baseX,
            baseY,
            mouseX,
            mouseY,
            effectiveRadius
          );
          x = nx;
          y = ny;
          vx = nvx;
          vy = nvy;

          if (
            Math.abs(vx) + Math.abs(vy) > 0.02 ||
            Math.abs(x - baseX) + Math.abs(y - baseY) > 0.05
          ) {
            stillMoving = true;
          } else {
            x = baseX;
            y = baseY;
            vx = 0;
            vy = 0;
          }

          dotBuffer[offset] = x;
          dotBuffer[offset + 1] = y;
          dotBuffer[offset + 2] = vx;
          dotBuffer[offset + 3] = vy;
        }

        // Color interpolation based on movement (vibrant acid-lime glow)
        const warmth = calculateWarmth(x, y, baseX, baseY, 28);
        if (warmth > 0.02) {
          const r = Math.round(inkRgb[0] + (warmRgb[0] - inkRgb[0]) * warmth);
          const g = Math.round(inkRgb[1] + (warmRgb[1] - inkRgb[1]) * warmth);
          const b = Math.round(inkRgb[2] + (warmRgb[2] - inkRgb[2]) * warmth);
          ctx.fillStyle = `rgb(${r},${g},${b})`;
        } else {
          ctx.fillStyle = state.colors.ink;
        }

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Render print grain overlay
      if (noiseCanvas && state.grain > 0) {
        ctx.globalAlpha = Math.min(1, state.grain) * 0.08;
        ctx.globalCompositeOperation = "overlay";
        const pattern = ctx.createPattern(noiseCanvas, "repeat");
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, width, heightPx);
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
      }

      isAnimating = stillMoving || shockAge < 900 || mouseX > -1e4;
    };

    const loop = (time: number) => {
      rafId = 0;
      if (isVisible) {
        draw(time);
        if (isAnimating) {
          rafId = requestAnimationFrame(loop);
        }
      }
    };

    const wake = () => {
      isAnimating = true;
      if (!rafId && isVisible) {
        rafId = requestAnimationFrame(loop);
      }
    };

    const toLocal = (e: PointerEvent): [number, number] => {
      const rect = canvas.getBoundingClientRect();
      return [e.clientX - rect.left, e.clientY - rect.top];
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!stateRef.current.interactive) return;
      const [lx, ly] = toLocal(e);
      mouseX = lx;
      mouseY = ly;
      wake();
    };

    const onPointerLeave = () => {
      mouseX = -1e5;
      mouseY = -1e5;
      wake();
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!stateRef.current.interactive || prefersReducedMotion) return;
      const [lx, ly] = toLocal(e);
      shockwave = { x: lx, y: ly, t: performance.now() };
      wake();
    };

    // Initialize layout and draw immediately
    layout();
    draw(performance.now());
    wake();

    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerleave", onPointerLeave);
    stage.addEventListener("pointerdown", onPointerDown);

    const resizeObserver = new ResizeObserver(() => {
      layout();
      draw(performance.now());
      wake();
    });
    resizeObserver.observe(stage);

    const intersectionObserver = new IntersectionObserver((entries) => {
      isVisible = entries[0] ? entries[0].isIntersecting : true;
      if (isVisible) wake();
    });
    intersectionObserver.observe(stage);

    let mounted = true;
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (mounted) {
          layout();
          draw(performance.now());
          wake();
        }
      });
    }

    return () => {
      mounted = false;
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerleave", onPointerLeave);
      stage.removeEventListener("pointerdown", onPointerDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paletteKey]);

  const scrollToTop = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.stopPropagation();
    if (href.startsWith("#")) {
      const targetEl = document.querySelector(href);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", href);
      }
    }
  };

  return (
    <footer
      className={`hwf-root ${className}`}
      style={
        {
          "--hwf-bg": mergedPalette.background,
          "--hwf-ink": mergedPalette.ink,
          "--hwf-mono": monoFamily,
        } as React.CSSProperties
      }
    >
      <style dangerouslySetInnerHTML={{ __html: HWF_STYLES }} />

      {/* REGION 1: Top Navigation, Brand, and Divider (In-Flow) */}
      <div className="hwf-content-wrap">
        <div className="hwf-top">
          {/* Brand Block */}
          <div className="hwf-brand">
            <strong>{label}</strong>
            <span className="hwf-brand-meta">{meta}</span>
            {bio && <p className="hwf-brand-bio">{bio}</p>}
          </div>

          {/* 3 Navigation Columns */}
          {columns.map((col) => (
            <nav key={col.title} className="hwf-col" aria-label={col.title}>
              <h3>{col.title}</h3>
              <ul>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      onClick={(e) => handleLinkClick(e, link.href)}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Divider Strip & Back to Top */}
        <div className="hwf-rule">
          <div className="hwf-rule-signoff">
            <span className="hwf-indicator" />
            <span>&copy; 2026 {portfolioData.profile.name} · ALL SYSTEMS NOMINAL</span>
          </div>

          {backToTop && (
            <button
              type="button"
              className="hwf-up"
              onClick={scrollToTop}
              aria-label="Back to top of page"
            >
              Back to top &uarr;
            </button>
          )}
        </div>
      </div>

      {/* REGION 2: Dedicated Halftone Wordmark Canvas Stage */}
      <div
        ref={stageRef}
        className="hwf-wordmark-stage"
        data-testid="halftone-wordmark-stage"
      >
        <canvas ref={canvasRef} aria-hidden="true" />
        <span className="hwf-sr">{wordmark}</span>
      </div>
    </footer>
  );
}
