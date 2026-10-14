"use client";

import React, { useEffect, useMemo, useRef } from "react";

export interface GatewayFlowProps {
  mode?: "dark" | "light" | "auto";
  speed?: number;
  size?: number;
  gap?: number;
  length?: number;
  density?: number;
  strokeWidth?: number;
  opacity?: number;
  hue?: number;
  saturation?: number;
  brightness?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const DEFAULT_GATEWAY_FLOW_CONTROLS = {
  mode: "dark",
  speed: 0.8,
  size: 1,
  gap: 2,
  length: 1,
  density: 1,
  strokeWidth: 1,
  opacity: 0.7,
  hue: 0,
  saturation: 1,
  brightness: 1,
} as const;

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

function generateGatewayFlowHtml(controls: {
  mode: string;
  speed: number;
  size: number;
  gap: number;
  length: number;
  density: number;
  strokeWidth: number;
  opacity: number;
}): string {
  const isLight = controls.mode === "light";
  const bgColor = isLight ? "#eef1f6" : "#080808";
  const strokeColor = isLight ? "rgba(26, 31, 42, 0.35)" : "rgba(240, 245, 255, 0.40)";
  const numPaths = Math.max(16, Math.round(120 * (controls.density || 1)));

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gateway Flow Animation</title>
  <style>
    html, body {
      width: 100% !important;
      height: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden !important;
      background: ${bgColor} !important;
    }
    #flow-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: block;
      pointer-events: none;
    }
  </style>
  <script>
    (function () {
      var controls = ${JSON.stringify(controls)};
      window.__SF_CONTROLS = controls;
      window.addEventListener('message', function (event) {
        if (!event.data || event.data.type !== 'threeui-controls') return;
        var next = event.data.controls || {};
        Object.keys(next).forEach(function (key) { controls[key] = next[key]; });
      });
    })();
  </script>
</head>
<body>
  <div style="position: absolute; inset: 0; overflow: hidden; background: ${bgColor};">
    <div style="position: absolute; inset: 0; opacity: 0.16; background: radial-gradient(circle at 50% 50%, rgba(185, 255, 102, 0.06) 0%, rgba(255, 255, 255, 0.04) 40%, rgba(0, 0, 0, 0) 80%);"></div>
    <canvas id="flow-canvas"></canvas>
  </div>
  <script>
    window.addEventListener('DOMContentLoaded', function () {
      const canvas = document.getElementById('flow-canvas');
      const ctx = canvas.getContext('2d');
      let width = 300, height = 150;
      let explosions = [];
      let animId;

      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      let prefersReducedMotion = motionQuery.matches;
      if (motionQuery.addEventListener) {
        motionQuery.addEventListener('change', function (e) {
          prefersReducedMotion = e.matches;
        });
      }

      function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth || document.documentElement.clientWidth || 300;
        height = window.innerHeight || document.documentElement.clientHeight || 150;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      window.addEventListener('resize', resize);
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(function () {
          resize();
        });
        ro.observe(document.documentElement);
      }
      resize();

      window.addEventListener('click', function (e) {
        explosions.push({ x: e.clientX, y: e.clientY, radius: 0, life: 1 });
      });

      const paths = [];
      const pathCount = ${numPaths};
      
      for (let i = 0; i < pathCount; i++) {
        const isLeft = i % 2 === 0;
        const isAccentLine = i % 7 === 2;
        const particles = [];
        const particlesPerPath = 2;

        for (let p = 0; p < particlesPerPath; p++) {
          const isAccent = Math.random() < 0.20; // ~20% lime-green particles
          particles.push({
            t: (p / particlesPerPath) + Math.random() * (1 / particlesPerPath),
            speed: 0.0010 + Math.random() * 0.0018,
            size: 2.0 + Math.random() * 1.5,
            isAccent: isAccent,
            alpha: 0.70 + Math.random() * 0.30
          });
        }

        paths.push({
          isLeft: isLeft,
          isAccentLine: isAccentLine,
          yRatio: (i / pathCount) * 1.4 - 0.2,
          offsetY: 0,
          particles: particles
        });
      }

      function getBezierPoint(t, p0, p1, p2, p3) {
        const u = 1 - t;
        return {
          x: u**3 * p0.x + 3 * u**2 * t * p1.x + 3 * u * t**2 * p2.x + t**3 * p3.x,
          y: u**3 * p0.y + 3 * u**2 * t * p1.y + 3 * u * t**2 * p2.y + t**3 * p3.y
        };
      }

      function render() {
        const speed = (window.__SF_CONTROLS && window.__SF_CONTROLS.speed != null) ? window.__SF_CONTROLS.speed : 1;
        const opacity = (window.__SF_CONTROLS && window.__SF_CONTROLS.opacity != null) ? window.__SF_CONTROLS.opacity : 1;
        const strokeW = (window.__SF_CONTROLS && window.__SF_CONTROLS.strokeWidth != null) ? window.__SF_CONTROLS.strokeWidth : 1;
        const effectiveSpeed = prefersReducedMotion ? 0 : speed;

        ctx.clearRect(0, 0, width, height);
        const centerX = width / 2;
        const centerY = height / 2;

        explosions.forEach(exp => {
          exp.radius += 14;
          exp.life -= 0.018;
        });
        explosions = explosions.filter(exp => exp.life > 0);

        paths.forEach(path => {
          const startY = path.yRatio * height + path.offsetY;
          const p0 = { x: path.isLeft ? 0 : width, y: startY };
          const p1 = { x: path.isLeft ? centerX * 0.45 : width - centerX * 0.45, y: startY };
          const p2 = { x: path.isLeft ? centerX * 0.8 : width - centerX * 0.8, y: centerY };
          const p3 = { x: centerX, y: centerY };

          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
          
          if (path.isAccentLine) {
            ctx.strokeStyle = 'rgba(185, 255, 102, ' + (0.28 * opacity) + ')';
            ctx.lineWidth = 1.35 * strokeW;
          } else {
            ctx.strokeStyle = '${strokeColor}'.replace(/0\\.40\\)/, (0.42 * opacity) + ')');
            ctx.lineWidth = 1.15 * strokeW;
          }
          ctx.setLineDash([1.5, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          path.particles.forEach(p => {
            p.t += p.speed * effectiveSpeed;
            if (p.t > 1) {
              p.t = 0;
              path.offsetY += (Math.random() - 0.5) * 12;
            }

            let pos = getBezierPoint(p.t, p0, p1, p2, p3);

            let dxTotal = 0, dyTotal = 0;
            explosions.forEach(exp => {
              let dx = pos.x - exp.x;
              let dy = pos.y - exp.y;
              let dist = Math.hypot(dx, dy);
              if (dist < exp.radius + 120 && dist > exp.radius - 120) {
                let force = (1 - Math.abs(dist - exp.radius) / 120) * exp.life;
                dxTotal += (dx / dist) * force * 70;
                dyTotal += (dy / dist) * force * 70;
              }
            });

            pos.x += dxTotal;
            pos.y += dyTotal;

            // Focal prominence: subtle scale increase near convergence arc
            const focalFactor = 0.88 + 0.30 * Math.sin(p.t * Math.PI);
            const radius = Math.max(1, p.size * focalFactor * 0.5);

            ctx.beginPath();
            ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);

            if (p.isAccent) {
              ctx.shadowBlur = 6;
              ctx.shadowColor = 'rgba(185, 255, 102, 0.55)';
              ctx.fillStyle = 'rgba(185, 255, 102, ' + (p.alpha * 0.95 * opacity) + ')';
            } else {
              ctx.shadowBlur = 0;
              // Brighter silver/white base
              ctx.fillStyle = 'rgba(238, 244, 255, ' + (p.alpha * 0.92 * opacity) + ')';
            }

            ctx.fill();
            if (p.isAccent) {
              ctx.shadowBlur = 0;
            }
          });
        });

        animId = requestAnimationFrame(render);
      }

      render();

      window.addEventListener('beforeunload', function () {
        if (animId) cancelAnimationFrame(animId);
      });
    });
  </script>
</body>
</html>`;
}

export default function GatewayFlow({
  mode = DEFAULT_GATEWAY_FLOW_CONTROLS.mode,
  speed = DEFAULT_GATEWAY_FLOW_CONTROLS.speed,
  size = DEFAULT_GATEWAY_FLOW_CONTROLS.size,
  gap = DEFAULT_GATEWAY_FLOW_CONTROLS.gap,
  length = DEFAULT_GATEWAY_FLOW_CONTROLS.length,
  density = DEFAULT_GATEWAY_FLOW_CONTROLS.density,
  strokeWidth = DEFAULT_GATEWAY_FLOW_CONTROLS.strokeWidth,
  opacity = DEFAULT_GATEWAY_FLOW_CONTROLS.opacity,
  hue = DEFAULT_GATEWAY_FLOW_CONTROLS.hue,
  saturation = DEFAULT_GATEWAY_FLOW_CONTROLS.saturation,
  brightness = DEFAULT_GATEWAY_FLOW_CONTROLS.brightness,
  className = "",
  style = {},
}: GatewayFlowProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const effectiveMode = mode === "auto" ? "dark" : mode;
  const safeSpeed = clamp(speed, 0, 3);
  const safeSize = clamp(size, 0.05, 20);
  const safeGap = clamp(gap, 0, 64);
  const safeLength = clamp(length, 0.35, 2.5);
  const safeDensity = clamp(density, 0.25, 2.5);
  const safeStrokeWidth = clamp(strokeWidth, 0.25, 8);
  const safeOpacity = clamp(opacity, 0.05, 1);
  const safeHue = clamp(hue, -180, 180);
  const safeSaturation = clamp(saturation, 0, 2);
  const safeBrightness = clamp(brightness, 0.35, 1.65);

  const srcDoc = useMemo(() => {
    return generateGatewayFlowHtml({
      mode: effectiveMode,
      speed: safeSpeed,
      size: safeSize,
      gap: safeGap,
      length: safeLength,
      density: safeDensity,
      strokeWidth: safeStrokeWidth,
      opacity: safeOpacity,
    });
  }, [effectiveMode, safeDensity, safeSize]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    iframe.contentWindow.postMessage(
      {
        type: "threeui-controls",
        controls: {
          mode: effectiveMode,
          speed: safeSpeed,
          size: safeSize,
          gap: safeGap,
          length: safeLength,
          density: safeDensity,
          strokeWidth: safeStrokeWidth,
          opacity: safeOpacity,
        },
      },
      "*"
    );
  }, [
    effectiveMode,
    safeSpeed,
    safeSize,
    safeGap,
    safeLength,
    safeDensity,
    safeStrokeWidth,
    safeOpacity,
  ]);

  const filterStyle = useMemo(() => {
    if (safeHue === 0 && safeSaturation === 1 && safeBrightness === 1) {
      return undefined;
    }
    return `hue-rotate(${safeHue}deg) saturate(${safeSaturation}) brightness(${safeBrightness})`;
  }, [safeHue, safeSaturation, safeBrightness]);

  return (
    <iframe
      ref={iframeRef}
      className={className}
      title="Gateway Flow"
      srcDoc={srcDoc}
      sandbox="allow-scripts"
      loading="eager"
      tabIndex={-1}
      aria-hidden="true"
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        border: 0,
        background: effectiveMode === "light" ? "#eef1f6" : "#080808",
        filter: filterStyle,
        ...style,
      }}
    />
  );
}
