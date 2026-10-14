"use client";

import * as React from "react";

// ============================================================================
// ART RECIPES & PROCEDURAL FBM ART GENERATOR
// ============================================================================

export type ArtStyle = "marble" | "streak";

export interface ArtRecipe {
  style: ArtStyle;
  colors: string[];
  scale?: number;
  warp?: number;
  angle?: number;
  gloss?: number;
  veins?: number;
}

export type ArtPresetName =
  | "aurora"
  | "ember"
  | "dusk"
  | "glacier"
  | "verdant"
  | "lime"
  | "cyber"
  | "vault"
  | "none";

export const ART_PRESETS: Record<Exclude<ArtPresetName, "none">, ArtRecipe> = {
  aurora: {
    style: "streak",
    colors: ["#f4efe9", "#e9c2b8", "#c2433f", "#2a1e2a", "#22395e", "#6f97c2", "#e5edf4"],
    scale: 0.7,
    warp: 1.4,
    angle: -0.62,
    gloss: 0.18,
    veins: 0,
  },
  ember: {
    style: "marble",
    colors: ["#07090c", "#16252c", "#3d5f68", "#1a1416", "#a3201a", "#ef4a2b", "#ff8a5c"],
    scale: 0.62,
    warp: 3.2,
    angle: -0.5,
    gloss: 0.55,
    veins: 0.6,
  },
  dusk: {
    style: "marble",
    colors: ["#120c18", "#3e2850", "#8f6c9c", "#2b1a24", "#b3502f", "#eab08a", "#fbe7d2"],
    scale: 0.75,
    warp: 3.6,
    angle: 0.8,
    gloss: 0.5,
    veins: 0.5,
  },
  glacier: {
    style: "streak",
    colors: ["#f7f8fa", "#d9e2ea", "#9fb4c7", "#e8edf2", "#bccbd8", "#ffffff"],
    scale: 0.7,
    warp: 1.6,
    angle: 0.35,
    gloss: 0.25,
    veins: 0,
  },
  verdant: {
    style: "marble",
    colors: ["#070b08", "#173024", "#4f7a5a", "#141812", "#a7843a", "#e9cf87", "#fbf3d6"],
    scale: 0.7,
    warp: 3.4,
    angle: 2.1,
    gloss: 0.5,
    veins: 0.5,
  },
  lime: {
    style: "streak",
    colors: ["#050805", "#0b160b", "#143315", "#225923", "#4ade80", "#b9ff66", "#f0fdf4"],
    scale: 0.68,
    warp: 1.8,
    angle: -0.45,
    gloss: 0.4,
    veins: 0,
  },
  cyber: {
    style: "marble",
    colors: ["#08090c", "#101920", "#182c2b", "#122a22", "#22593e", "#b9ff66", "#f5fdf7"],
    scale: 0.68,
    warp: 3.2,
    angle: 0.95,
    gloss: 0.55,
    veins: 0.55,
  },
  vault: {
    style: "marble",
    colors: ["#09090b", "#18181b", "#27272a", "#142618", "#15803d", "#b9ff66", "#fafafa"],
    scale: 0.72,
    warp: 2.8,
    angle: 1.35,
    gloss: 0.6,
    veins: 0.65,
  },
};

function hexToRgb(hex: string): [number, number, number] {
  let u = hex.trim().replace(/^#/, "");
  if (u.length === 3) u = u[0] + u[0] + u[1] + u[1] + u[2] + u[2];
  const d = /^[0-9a-f]{6}$/i.test(u) ? parseInt(u, 16) : 0x808080;
  return [(d >> 16) & 255, (d >> 8) & 255, d & 255];
}

function rng(seed: number) {
  let u = seed >>> 0;
  return () => {
    u = (u + 1831565813) >>> 0;
    let d = u;
    d = Math.imul(d ^ (d >>> 15), d | 1);
    d ^= d + Math.imul(d ^ (d >>> 7), d | 61);
    return ((d ^ (d >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(str: string): number {
  let u = 2166136261;
  for (let i = 0; i < str.length; i++) {
    u = Math.imul(u ^ str.charCodeAt(i), 16777619);
  }
  return u >>> 0;
}

function makeFbm(seed: number) {
  const u = rng(seed);
  const perm = new Uint8Array(512);
  const grad = new Float32Array(512);
  const z: number[] = [];

  for (let i = 0; i < 256; i++) z.push(i);
  for (let i = 255; i > 0; i--) {
    const r = Math.floor(u() * (i + 1));
    const tmp = z[i];
    z[i] = z[r];
    z[r] = tmp;
  }
  for (let i = 0; i < 512; i++) perm[i] = z[i & 255];
  for (let i = 0; i < 256; i++) {
    const angle = u() * Math.PI * 2;
    grad[i * 2] = Math.cos(angle);
    grad[i * 2 + 1] = Math.sin(angle);
  }

  const noise = (x: number, y: number) => {
    const fx = Math.floor(x);
    const fy = Math.floor(y);
    const dx = x - fx;
    const dy = y - fy;
    const s = fx & 255;
    const t = fy & 255;
    const c00 = perm[s + perm[t]] * 2;
    const c10 = perm[s + 1 + perm[t]] * 2;
    const c01 = perm[s + perm[t + 1]] * 2;
    const c11 = perm[s + 1 + perm[t + 1]] * 2;
    const g00 = grad[c00] * dx + grad[c00 + 1] * dy;
    const g10 = grad[c10] * (dx - 1) + grad[c10 + 1] * dy;
    const g01 = grad[c01] * dx + grad[c01 + 1] * (dy - 1);
    const g11 = grad[c11] * (dx - 1) + grad[c11 + 1] * (dy - 1);
    const sx = dx * dx * dx * (dx * (dx * 6 - 15) + 10);
    const sy = dy * dy * dy * (dy * (dy * 6 - 15) + 10);
    return g00 + sx * (g10 - g00) + sy * (g01 - g00 + sx * (g11 - g01 - g10 + g00));
  };

  return (x: number, y: number, octaves: number) => {
    let sum = 0;
    let amp = 0.5;
    for (let o = 0; o < octaves; o++) {
      sum += amp * noise(x, y);
      const nx = 1.6 * x + 1.2 * y + 7.1;
      y = -1.2 * x + 1.6 * y + 3.3;
      x = nx;
      amp *= 0.5;
    }
    return sum;
  };
}

interface ArtJob {
  width: number;
  height: number;
  pixels: Uint8ClampedArray;
  step: (chunk: number) => boolean;
}

function createArtJob(width: number, height: number, recipe: ArtRecipe, seed: number): ArtJob {
  const z = Math.max(1, Math.round(width));
  const q = Math.max(1, Math.round(height));
  const colors = recipe.colors.length >= 2 ? recipe.colors : ["#111111", "#eeeeee"];
  const stops = colors.map((col, idx) => ({
    t: idx / (colors.length - 1),
    c: hexToRgb(col),
  }));

  const scale = recipe.scale ?? 0.7;
  const warp = recipe.warp ?? 3;
  const gloss = recipe.gloss ?? 0.4;
  const veins = recipe.veins ?? 0;
  const isStreak = recipe.style === "streak";

  const fbm = makeFbm(seed * 977 + 13);
  const rand = rng(seed + 1);
  const ox = rand() * 50;
  const oy = rand() * 50;
  const angle = (recipe.angle ?? 0) + (rand() - 0.5) * 0.5;
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const minDim = Math.min(z, q);

  const L = Math.ceil(z / 2) + 3;
  const rt = Math.ceil(q / 2) + 3;
  const At = new Float32Array(L * rt);
  const Dt = new Float32Array(L * rt);
  const Mt = new Float32Array(z * q);
  const al = new Float32Array(z * q);
  const Ut = new Uint8ClampedArray(z * q * 4);
  let currentRow = 0;

  const computeFieldRow = (row: number) => {
    for (let col = 0; col < L; col++) {
      const rx = ((col - 1) * 2 - z / 2) / minDim;
      const ry = ((row - 1) * 2 - q / 2) / minDim;
      let bx = (rx * cosA - ry * sinA) * scale;
      let by = (rx * sinA + ry * cosA) * scale;
      if (isStreak) {
        bx *= 0.14;
        by *= 2.2;
      }
      bx += ox;
      by += oy;

      const f1 = fbm(bx, by, 3);
      const f2 = fbm(bx + 5.2, by + 1.3, 3);
      const f3 = fbm(bx + warp * f1 + 1.7, by + warp * f2 + 9.2, 3);
      const f4 = fbm(bx + warp * f1 + 8.3, by + warp * f2 + 2.8, 3);

      At[row * L + col] = fbm(bx + warp * f3, by + warp * f4, 4);
      Dt[row * L + col] = Math.sqrt(f1 * f1 + f2 * f2);
    }
  };

  const upsample = () => {
    const cr = (p0: number, p1: number, p2: number, p3: number) =>
      (-p0 + 9 * p1 + 9 * p2 - p3) / 16;
    const temp = new Float32Array(z * rt);

    for (let r = 0; r < rt; r++) {
      const rowOffset = r * L;
      for (let c = 0; c < z; c++) {
        const m = (c >> 1) + 1;
        temp[r * z + c] =
          c & 1
            ? cr(At[rowOffset + m - 1], At[rowOffset + m], At[rowOffset + m + 1], At[rowOffset + m + 2])
            : At[rowOffset + m];
      }
    }

    for (let r = 0; r < q; r++) {
      const m = (r >> 1) + 1;
      for (let c = 0; c < z; c++) {
        Mt[r * z + c] =
          r & 1
            ? cr(temp[(m - 1) * z + c], temp[m * z + c], temp[(m + 1) * z + c], temp[(m + 2) * z + c])
            : temp[m * z + c];

        const cm = (c >> 1) + 1;
        const dVal = Dt[m * L + cm];
        const avgX = c & 1 ? (dVal + Dt[m * L + cm + 1]) / 2 : dVal;
        const avgY =
          r & 1
            ? c & 1
              ? (Dt[(m + 1) * L + cm] + Dt[(m + 1) * L + cm + 1]) / 2
              : Dt[(m + 1) * L + cm]
            : avgX;
        al[r * z + c] = (avgX + avgY) / 2;
      }
    }
  };

  const colorize = () => {
    const samples: number[] = [];
    const stepSample = Math.max(1, Math.floor(Mt.length / 4096));
    for (let i = 0; i < Mt.length; i += stepSample) samples.push(Mt[i]);
    samples.sort((a, b) => a - b);

    const minV = samples[Math.floor(samples.length * 0.02)];
    const norm = 1 / (samples[Math.floor(samples.length * 0.98)] - minV || 1);
    const lightX = -0.55;
    const lightY = -0.65;
    const lightZ = 0.52;
    const scaleFactor = norm * minDim * 0.012;

    for (let r = 0; r < q; r++) {
      for (let c = 0; c < z; c++) {
        const idx = r * z + c;
        let t = (Mt[idx] - minV) * norm;
        t = t < 0 ? 0 : t > 1 ? 1 : t;

        let stopIdx = 1;
        while (stopIdx < stops.length - 1 && stops[stopIdx].t < t) stopIdx++;
        const s0 = stops[stopIdx - 1];
        const s1 = stops[stopIdx];
        let factor = (t - s0.t) / (s1.t - s0.t || 1);
        factor = factor < 0 ? 0 : factor > 1 ? 1 : factor;
        factor = factor * factor * (3 - 2 * factor);

        const dx = (Mt[c < z - 1 ? idx + 1 : idx] - Mt[c > 0 ? idx - 1 : idx]) * scaleFactor;
        const dy = (Mt[r < q - 1 ? idx + z : idx] - Mt[r > 0 ? idx - z : idx]) * scaleFactor;
        const normFactor = Math.sqrt(dx * dx + dy * dy + 1);
        const dot = (-dx * lightX - dy * lightY + lightZ) / normFactor;
        const spec = Math.pow(dot > 0 ? dot : 0, 24) * gloss * 255;
        const ripple = 1 + 0.035 * Math.sin(t * 150 + al[idx] * 24);
        const vein = veins * Math.max(0, 1 - Math.abs(al[idx] - 0.42) * 14) * 0.6;
        const lighting = (0.82 + 0.28 * dot) * ripple * (1 - vein);

        Ut[idx * 4] = (s0.c[0] + (s1.c[0] - s0.c[0]) * factor) * lighting + spec;
        Ut[idx * 4 + 1] = (s0.c[1] + (s1.c[1] - s0.c[1]) * factor) * lighting + spec;
        Ut[idx * 4 + 2] = (s0.c[2] + (s1.c[2] - s0.c[2]) * factor) * lighting + spec;
        Ut[idx * 4 + 3] = 255;
      }
    }
  };

  return {
    width: z,
    height: q,
    pixels: Ut,
    step: (chunk: number) => {
      if (currentRow >= rt) return true;
      const target = Math.min(rt, currentRow + Math.max(1, chunk));
      while (currentRow < target) computeFieldRow(currentRow++);
      if (currentRow < rt) return false;
      upsample();
      colorize();
      return true;
    },
  };
}

function fanSlot(index: number, total: number): number {
  return total <= 1 ? 0 : (index / (total - 1)) * 2 - 1;
}

function recipeOf(art: ArtPresetName | ArtRecipe): ArtRecipe {
  if (typeof art === "string") {
    if (art in ART_PRESETS) return ART_PRESETS[art as keyof typeof ART_PRESETS];
    return ART_PRESETS.aurora;
  }
  return art;
}

interface PaintTask {
  job: ArtJob;
  priority: number;
  done: (canvas: HTMLCanvasElement) => void;
}

const artCache = new Map<string, Promise<HTMLCanvasElement>>();
const queue: PaintTask[] = [];
let isPumping = false;

function pump() {
  if (isPumping) return;
  isPumping = true;

  const tick = () => {
    const deadline = performance.now() + 7;
    while (queue.length && performance.now() < deadline) {
      const task = queue[0];
      if (task.job.step(4)) {
        queue.shift();
        const canvas = document.createElement("canvas");
        canvas.width = task.job.width;
        canvas.height = task.job.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const imgData = ctx.createImageData(canvas.width, canvas.height);
          imgData.data.set(task.job.pixels);
          ctx.putImageData(imgData, 0, 0);
        }
        task.done(canvas);
      }
    }

    if (queue.length) {
      requestAnimationFrame(tick);
    } else {
      isPumping = false;
    }
  };

  requestAnimationFrame(tick);
}

function paint(recipe: ArtRecipe, seed: number, width: number, height: number, priority: number) {
  const key = JSON.stringify([recipe, seed, width, height]);
  let promise = artCache.get(key);
  if (!promise) {
    promise = new Promise<HTMLCanvasElement>((resolve) => {
      let idx = queue.length;
      while (idx > 1 && queue[idx - 1].priority > priority) idx--;
      queue.splice(idx, 0, {
        job: createArtJob(width, height, recipe, seed),
        priority,
        done: resolve,
      });
      pump();
    });
    artCache.set(key, promise);
  }
  return promise;
}

interface ArtCanvasProps {
  art: ArtPresetName | ArtRecipe;
  seed: number;
  w: number;
  h: number;
  density: number;
  priority: number;
  className?: string;
}

function ArtCanvas({ art, seed, w, h, density, priority, className }: ArtCanvasProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const recipe = recipeOf(art);
  const recipeJson = JSON.stringify(recipe);
  const finalW = Math.round(w * density);
  const finalH = Math.round(h * density);
  const currentKey = `${recipeJson}-${seed}-${finalW}-${finalH}`;
  const [readyKey, setReadyKey] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;

    paint(JSON.parse(recipeJson), seed, finalW, finalH, priority).then((rendered) => {
      if (!active || !canvasRef.current) return;
      canvasRef.current.width = rendered.width;
      canvasRef.current.height = rendered.height;
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.drawImage(rendered, 0, 0);
        setReadyKey(currentKey);
      }
    });

    return () => {
      active = false;
    };
  }, [recipeJson, seed, finalW, finalH, priority, currentKey]);

  const isReady = readyKey === currentKey;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      data-ready={isReady || undefined}
      style={{ width: w, height: h, maxWidth: "none" }}
    />
  );
}

// ============================================================================
// COMPONENT GEOMETRY CONSTANTS
// ============================================================================

const STAGE_W = 340;
const STAGE_H = 272;
const OVERHANG_TOP = 54;
const FRONT_OFFSET_Y = 74;
const FRONT_H = STAGE_H - FRONT_OFFSET_Y; // 198px
const SHEET_W = 272;
const SHEET_H = 184;

const BACK_PATH =
  "M0 56A22 22 0 0 1 22 34L146 34C170 34 172 0 198 0L318 0A22 22 0 0 1 340 22L340 250A22 22 0 0 1 318 272L22 272A22 22 0 0 1 0 250Z";

const FRONT_PATH =
  "M0 22A22 22 0 0 1 22 0L118 0C144 0 146 32 172 32L318 32A22 22 0 0 1 340 54L340 " +
  (FRONT_H - 22) +
  "A22 22 0 0 1 318 " +
  FRONT_H +
  "L22 " +
  FRONT_H +
  "A22 22 0 0 1 0 " +
  (FRONT_H - 22) +
  "Z";

const MAX_DISPLAY_SHEETS = 4;

const DEFAULT_FILES: GlassFolderFile[] = [
  { name: "README.md", meta: "Markdown · Overview", art: "ember" },
  { name: "source-code", meta: "TypeScript · Core", art: "dusk" },
  { name: "package.json", meta: "Config · 1.2 KB" },
];

// ============================================================================
// TYPES
// ============================================================================

export interface GlassFolderFile {
  name: string;
  meta?: string;
  art?: ArtPresetName | ArtRecipe;
  image?: string;
  href?: string;
  [key: string]: unknown;
}

export interface GlassFolderMenuItem {
  label: string;
  danger?: boolean;
  onSelect?: () => void;
}

export interface GlassFolderProps {
  label?: string;
  meta?: string;
  tone?: "light" | "dark";
  art?: ArtPresetName | ArtRecipe;
  seed?: number;
  image?: string;
  files?: GlassFolderFile[];
  action?: "add" | "more" | "none";
  onAdd?: (currentFiles: GlassFolderFile[]) => GlassFolderFile | void;
  onFilesChange?: (files: GlassFolderFile[]) => void;
  menu?: GlassFolderMenuItem[];
  labelPlacement?: "bottom-left" | "top-left" | "top-right";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onFileSelect?: (file: GlassFolderFile, index: number) => void;
  width?: number;
  appear?: boolean;
  appearDelay?: number;
  className?: string;
  style?: React.CSSProperties;
}

// ============================================================================
// GLASS FOLDER EMBEDDED STYLES
// ============================================================================

const GLASS_FOLDER_CSS = `
.gf-root {
  --gf-px: 0;
  --gf-py: 0;
  --gf-ease: cubic-bezier(.2, .8, .2, 1);
  --gf-spring: cubic-bezier(.34, 1.36, .5, 1);
  --gf-hinge: 0deg;
  --gf-lift: 42px;
  --gf-spread: 0px;
  --gf-fan: 0deg;
  --gf-stack: 15px;
  --gf-ink: #141416;
  --gf-ink-soft: rgba(20, 20, 22, .55);
  position: relative;
  display: inline-block;
  flex: none;
  vertical-align: top;
  font-family: inherit;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
  isolation: isolate;
  user-select: none;
}
.gf-root[data-tone="dark"] {
  --gf-ink: #f5f5f7;
  --gf-ink-soft: rgba(245, 245, 247, .65);
}
.gf-root:hover,
.gf-root:focus-within {
  --gf-hinge: -11deg;
  --gf-lift: -34px;
  --gf-spread: 8px;
  --gf-fan: 1.4deg;
  --gf-stack: 10px;
}
.gf-root[data-open] {
  --gf-hinge: -24deg;
  --gf-lift: -96px;
  --gf-spread: 40px;
  --gf-fan: 5deg;
  --gf-stack: 30px;
}

.gf-stage {
  position: absolute;
  left: 0;
  top: 0;
  width: 340px;
  height: 272px;
  transform-origin: 0 0;
}
.gf-tilt {
  position: absolute;
  inset: 0;
  transform: perspective(1400px) rotateX(calc(var(--gf-py) * -3deg)) rotateY(calc(var(--gf-px) * 4deg));
  transition: transform .9s var(--gf-ease);
}

.gf-shadow {
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: -6px;
  height: 60px;
  border-radius: 40px;
  background: rgba(16, 18, 24, .34);
  filter: blur(22px);
  transform: translateX(calc(var(--gf-px) * -8px));
  transition: transform .9s var(--gf-ease), opacity .9s var(--gf-ease);
}
.gf-root[data-tone="dark"] .gf-shadow {
  background: rgba(0, 0, 0, .85);
  box-shadow: 0 20px 40px -10px rgba(185, 255, 102, 0.08);
}

.gf-back {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: linear-gradient(180deg, #f3f3f4 0%, #e3e3e6 100%);
}
.gf-root[data-tone="dark"] .gf-back {
  background: linear-gradient(180deg, #1f2024 0%, #0c0d10 100%);
}
.gf-art {
  position: absolute;
  left: -12px;
  top: -12px;
  max-width: none;
  object-fit: cover;
  transform: translate(calc(var(--gf-px) * -7px), calc(var(--gf-py) * -6px)) scale(1.02);
  transition: transform 1.1s var(--gf-ease), opacity 1.2s var(--gf-ease), filter 1.2s var(--gf-ease);
}
canvas.gf-art {
  opacity: 0;
  filter: blur(14px) saturate(.6);
}
canvas.gf-art[data-ready] {
  opacity: 1;
  filter: none;
}
.gf-back-sheen {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .22) 0%, rgba(255, 255, 255, 0) 22%),
    radial-gradient(120% 80% at 80% 0%, rgba(255, 255, 255, .16), rgba(255, 255, 255, 0) 60%);
  pointer-events: none;
}
.gf-root[data-tone="dark"] .gf-back-sheen {
  background:
    linear-gradient(180deg, rgba(185, 255, 102, .08) 0%, rgba(255, 255, 255, 0) 25%),
    radial-gradient(120% 80% at 80% 0%, rgba(255, 255, 255, .08), rgba(255, 255, 255, 0) 60%);
}

.gf-rim {
  position: absolute;
  left: 0;
  top: 0;
  max-width: none;
  overflow: visible;
  pointer-events: none;
  fill: none;
}
.gf-back-rim {
  width: 340px;
  height: 272px;
}
.gf-back-rim path {
  stroke: rgba(255, 255, 255, .45);
  stroke-width: 1;
}
.gf-root[data-tone="dark"] .gf-back-rim path {
  stroke: rgba(255, 255, 255, .18);
}

/* ---- files ---------------------------------------------------------------- */
.gf-files {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
  clip-path: inset(-400px -400px 10px -400px);
}
.gf-sheet-slot {
  display: contents;
}
.gf-sheet {
  all: unset;
  box-sizing: border-box;
  position: absolute;
  left: 34px;
  top: 96px;
  width: 272px;
  height: 184px;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  pointer-events: auto;
  background: linear-gradient(180deg, #ffffff 0%, #f2f2f0 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .9),
    0 0 0 .5px rgba(0, 0, 0, .1),
    0 10px 26px -8px rgba(10, 12, 20, .28);
  transform-origin: 50% 100%;
  transform:
    translate(calc(var(--gf-jx) + var(--gf-slot) * var(--gf-spread)), calc(var(--gf-lift) + var(--gf-depth) * var(--gf-stack) * -1))
    rotate(calc(var(--gf-jr) + var(--gf-slot) * var(--gf-fan)));
  transition:
    transform .75s var(--gf-spring) calc(var(--gf-depth) * 40ms),
    box-shadow .4s var(--gf-ease),
    translate .9s var(--gf-ease),
    opacity .9s var(--gf-ease);
}
.gf-root[data-tone="dark"] .gf-sheet {
  background: linear-gradient(180deg, #232328 0%, #141417 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .18),
    0 0 0 .5px rgba(255, 255, 255, .08),
    0 12px 28px -8px rgba(0, 0, 0, .8);
}
.gf-sheet--art {
  background: #121316;
}
.gf-root[data-open] .gf-sheet:hover,
.gf-root[data-open] .gf-sheet:focus-visible {
  transform:
    translate(calc(var(--gf-jx) + var(--gf-slot) * var(--gf-spread)), calc(var(--gf-lift) + var(--gf-depth) * var(--gf-stack) * -1 - 18px))
    rotate(calc(var(--gf-slot) * var(--gf-fan) * .6));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .9),
    0 0 0 1px #b9ff66,
    0 22px 40px -12px rgba(10, 12, 20, .42);
  transition-delay: 0s;
}
.gf-root[data-tone="dark"][data-open] .gf-sheet:hover,
.gf-root[data-tone="dark"][data-open] .gf-sheet:focus-visible {
  box-shadow:
    inset 0 1px 0 rgba(185, 255, 102, .4),
    0 0 0 1px #b9ff66,
    0 24px 44px -10px rgba(0, 0, 0, .9);
}
.gf-sheet:focus-visible {
  outline: 2px solid #b9ff66;
  outline-offset: 2px;
}
.gf-sheet-art {
  position: absolute;
  left: 0;
  top: 0;
  width: 272px;
  height: 184px;
  max-width: none;
  object-fit: cover;
  transition: opacity .9s var(--gf-ease), filter .9s var(--gf-ease);
}
canvas.gf-sheet-art {
  opacity: 0;
  filter: blur(10px);
}
canvas.gf-sheet-art[data-ready] {
  opacity: 1;
  filter: none;
}
.gf-sheet--art::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(180deg, rgba(0, 0, 0, .45) 0%, rgba(0, 0, 0, 0) 36%);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .2);
  pointer-events: none;
}
.gf-sheet-head {
  position: absolute;
  left: 14px;
  right: 14px;
  top: 11px;
  z-index: 1;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  white-space: nowrap;
}
.gf-sheet-name {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: -.005em;
  color: #18181b;
}
.gf-sheet-meta {
  flex: none;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 10px;
  letter-spacing: .02em;
  color: rgba(24, 24, 27, .5);
}
.gf-root[data-tone="dark"] .gf-sheet-name,
.gf-sheet--art .gf-sheet-name {
  color: #fafafa;
}
.gf-root[data-tone="dark"] .gf-sheet-meta,
.gf-sheet--art .gf-sheet-meta {
  color: #b9ff66;
}
.gf-lines {
  position: absolute;
  left: 14px;
  right: 14px;
  top: 40px;
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.gf-lines i {
  display: block;
  height: 5px;
  border-radius: 3px;
  background: rgba(24, 24, 27, .08);
}
.gf-lines i:first-child {
  height: 9px;
  margin-bottom: 4px;
  background: rgba(24, 24, 27, .14);
}
.gf-root[data-tone="dark"] .gf-lines i {
  background: rgba(255, 255, 255, .08);
}
.gf-root[data-tone="dark"] .gf-lines i:first-child {
  background: rgba(185, 255, 102, .2);
}

.gf-sheet--drop {
  animation: gf-drop .85s var(--gf-ease) both;
}
@keyframes gf-drop {
  0% { translate: 0 -190px; rotate: -9deg; opacity: 0; }
  35% { opacity: 1; }
  72% { translate: 0 10px; rotate: 1deg; }
  100% { translate: 0 0; rotate: 0deg; opacity: 1; }
}

/* ---- front glass ----------------------------------------------------------- */
.gf-front {
  position: absolute;
  left: 0;
  top: 74px;
  width: 340px;
  height: 198px;
  z-index: 10;
  -webkit-backdrop-filter: blur(22px) saturate(1.5);
  backdrop-filter: blur(22px) saturate(1.5);
  transform-origin: 50% 100%;
  transform: perspective(760px) rotateX(var(--gf-hinge));
  transition: transform .8s var(--gf-spring), translate 1s var(--gf-ease), opacity 1s var(--gf-ease);
}
.gf-front--bump {
  animation: gf-bump .7s var(--gf-ease) .38s both;
}
@keyframes gf-bump {
  0% { scale: 1; }
  35% { scale: 1.018 .975; }
  70% { scale: .996 1.006; }
  100% { scale: 1; }
}
.gf-tint {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, .16) 0%, rgba(255, 255, 255, .5) 42%, rgba(252, 252, 252, .93) 100%);
}
.gf-root[data-tone="dark"] .gf-tint {
  background: linear-gradient(180deg, rgba(18, 18, 22, .25) 0%, rgba(14, 14, 18, .68) 46%, rgba(8, 8, 10, .96) 100%);
}
.gf-spec {
  position: absolute;
  inset: 0;
  background: radial-gradient(260px 200px at calc(50% + var(--gf-px) * 46%) calc(30% + var(--gf-py) * 40%), rgba(255, 255, 255, .5), rgba(255, 255, 255, 0) 70%);
  mix-blend-mode: soft-light;
  opacity: .9;
  transition: background-position .6s var(--gf-ease);
  pointer-events: none;
}
.gf-root[data-tone="dark"] .gf-spec {
  mix-blend-mode: screen;
  opacity: .22;
}
.gf-front-rim {
  width: 340px;
  height: 198px;
}
.gf-front-rim path {
  stroke-width: 2.4;
  transition: stroke-width .3s var(--gf-ease);
}
.gf-root[data-tone="dark"] .gf-front-rim {
  opacity: .65;
}

.gf-hit {
  all: unset;
  position: absolute;
  inset: 0;
  z-index: 1;
  cursor: pointer;
}
.gf-hit:focus-visible ~ .gf-label .gf-title {
  text-decoration: underline;
  text-decoration-thickness: 1.5px;
  text-underline-offset: 4px;
}
.gf-front:has(.gf-hit:focus-visible) .gf-front-rim path {
  stroke: #b9ff66 !important;
  stroke-width: 4;
}

.gf-label {
  position: absolute;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 220px;
  pointer-events: none;
  color: var(--gf-ink);
}
.gf-root[data-place="bottom-left"] .gf-label {
  left: 28px;
  bottom: 30px;
}
.gf-root[data-place="top-left"] .gf-label {
  left: 28px;
  top: 34px;
}
.gf-root[data-place="top-right"] .gf-label {
  right: 32px;
  top: 52px;
  align-items: flex-start;
}
.gf-title {
  font-size: 19px;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -.015em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.gf-root[data-tone="dark"] .gf-title {
  color: #ffffff;
}
.gf-meta {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  letter-spacing: .03em;
  color: var(--gf-ink-soft);
  white-space: nowrap;
  animation: gf-roll .5s var(--gf-ease) both;
}
.gf-root[data-tone="dark"] .gf-meta {
  color: #b9ff66;
}
@keyframes gf-roll {
  from { opacity: 0; translate: 0 7px; filter: blur(3px); }
  to { opacity: 1; translate: 0 0; filter: blur(0); }
}

/* ---- the key: + or ··· ------------------------------------------------------ */
.gf-key {
  all: unset;
  box-sizing: border-box;
  position: absolute;
  right: 22px;
  bottom: 22px;
  z-index: 12;
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: transform .35s var(--gf-spring), box-shadow .35s var(--gf-ease), background .35s var(--gf-ease);
}
.gf-key:hover {
  transform: translateY(-2px);
}
.gf-key:active {
  transform: translateY(0) scale(.93);
  transition-duration: .12s;
}
.gf-key:focus-visible {
  outline: 2px solid #b9ff66;
  outline-offset: 3px;
}
.gf-key--add {
  color: #fff;
  background: radial-gradient(120% 90% at 50% 0%, #3a3a3f 0%, #121214 55%, #050506 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .22),
    inset 0 -3px 8px rgba(0, 0, 0, .7),
    0 0 0 1px rgba(0, 0, 0, .75),
    0 14px 22px -8px rgba(0, 0, 0, .55),
    0 3px 6px -2px rgba(0, 0, 0, .35);
}
.gf-root[data-tone="dark"] .gf-key--add {
  color: #080808;
  background: radial-gradient(120% 90% at 50% 0%, #e6ffb3 0%, #b9ff66 55%, #88df28 100%);
  box-shadow:
    inset 0 1px 0 #ffffff,
    inset 0 -3px 8px rgba(0, 0, 0, .25),
    0 0 0 1px rgba(185, 255, 102, .5),
    0 14px 22px -8px rgba(0, 0, 0, .7);
}
.gf-key--more {
  color: #111113;
  background: linear-gradient(180deg, rgba(255, 255, 255, .92) 0%, rgba(226, 226, 230, .82) 100%);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  box-shadow:
    inset 0 1px 0 #fff,
    inset 0 -2px 4px rgba(0, 0, 0, .06),
    0 0 0 1px rgba(0, 0, 0, .16),
    0 10px 18px -8px rgba(0, 0, 0, .3);
}
.gf-root[data-tone="dark"] .gf-key--more {
  color: #f5f5f7;
  background: linear-gradient(180deg, rgba(255, 255, 255, .16) 0%, rgba(255, 255, 255, .06) 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .22),
    0 0 0 1px rgba(255, 255, 255, .15),
    0 10px 18px -8px rgba(0, 0, 0, .6);
}
.gf-key--more[aria-expanded="true"] {
  transform: scale(.96);
  border-color: #b9ff66;
}
.gf-glyph {
  display: block;
  max-width: none;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
}
.gf-glyph--plus {
  width: 26px;
  height: 26px;
  stroke-width: 1.8;
  animation: gf-turn .6s var(--gf-spring);
}
.gf-glyph--more {
  width: 28px;
  height: 12px;
  stroke-width: 1.8;
}
@keyframes gf-turn {
  from { rotate: -90deg; }
  to { rotate: 0deg; }
}

/* ---- menu ------------------------------------------------------------------- */
.gf-menu {
  position: absolute;
  right: 22px;
  bottom: 90px;
  z-index: 20;
  min-width: 185px;
  padding: 6px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  background: rgba(252, 252, 253, .9);
  -webkit-backdrop-filter: blur(24px) saturate(1.6);
  backdrop-filter: blur(24px) saturate(1.6);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .9),
    0 0 0 .5px rgba(0, 0, 0, .14),
    0 24px 48px -16px rgba(10, 12, 20, .4);
  transform-origin: 100% 100%;
  opacity: 0;
  visibility: hidden;
  transform: translateY(6px) scale(.94);
  transition: opacity .2s var(--gf-ease), transform .32s var(--gf-spring), visibility 0s .32s;
}
.gf-menu[data-open] {
  opacity: 1;
  visibility: visible;
  transform: none;
  transition-delay: 0s;
}
.gf-root[data-tone="dark"] .gf-menu {
  background: rgba(18, 18, 22, .92);
  border: 1px solid rgba(255, 255, 255, .12);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .1),
    0 24px 48px -16px rgba(0, 0, 0, .9);
}
.gf-menu-item {
  all: unset;
  box-sizing: border-box;
  padding: 9px 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  color: #18181b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.gf-root[data-tone="dark"] .gf-menu-item {
  color: #f4f4f5;
}
.gf-menu-item:hover,
.gf-menu-item:focus-visible {
  background: rgba(185, 255, 102, .12);
  color: #b9ff66;
}
.gf-menu-item--danger {
  color: #d92d20;
}
.gf-root[data-tone="dark"] .gf-menu-item--danger {
  color: #ff6b5e;
}

/* ---- entrance: the folder assembles itself ---------------------------------- */
.gf-root:not([data-entered]) .gf-back,
.gf-root:not([data-entered]) .gf-back-rim {
  translate: 0 22px;
  opacity: 0;
}
.gf-root:not([data-entered]) .gf-sheet {
  translate: 0 -120px;
  opacity: 0;
}
.gf-root:not([data-entered]) .gf-front {
  translate: 0 46px;
  opacity: 0;
}
.gf-root:not([data-entered]) .gf-key {
  opacity: 0;
  scale: .6;
}
.gf-root:not([data-entered]) .gf-shadow {
  opacity: 0;
}
.gf-back,
.gf-back-rim {
  transition: translate 1s var(--gf-ease), opacity .9s var(--gf-ease);
}
.gf-root[data-entered] .gf-sheet {
  transition-delay: calc(var(--gf-depth) * 40ms), 0s, calc(.18s + var(--gf-depth) * 90ms), calc(.18s + var(--gf-depth) * 90ms);
}
.gf-root[data-entered] .gf-front {
  transition-delay: 0s, .42s, .42s;
}
.gf-key {
  transition:
    transform .35s var(--gf-spring),
    box-shadow .35s var(--gf-ease),
    opacity .6s var(--gf-ease) .7s,
    scale .7s var(--gf-spring) .7s;
}

@media (prefers-reduced-motion: reduce) {
  .gf-root *,
  .gf-root *::before,
  .gf-root *::after {
    transition-duration: 0s !important;
    transition-delay: 0s !important;
    animation: none !important;
  }
  .gf-tilt {
    transform: none !important;
  }
}
`;

// ============================================================================
// MAIN COMPONENT: GlassFolder
// ============================================================================

export function GlassFolder({
  label = "My Files",
  meta,
  tone = "dark",
  art = "aurora",
  seed = 3,
  image,
  files = DEFAULT_FILES,
  action = "more",
  onAdd,
  onFilesChange,
  menu = [],
  labelPlacement = "bottom-left",
  open,
  defaultOpen = false,
  onOpenChange,
  onFileSelect,
  width = STAGE_W,
  appear = true,
  appearDelay = 0,
  className,
  style,
}: GlassFolderProps) {
  const uid = React.useId().replace(/:/g, "");
  const rootRef = React.useRef<HTMLDivElement>(null);
  const filesRef = React.useRef<HTMLDivElement>(null);
  const hitRef = React.useRef<HTMLButtonElement>(null);
  const keyRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const [addedFiles, setAddedFiles] = React.useState<GlassFolderFile[]>([]);
  const currentFiles = React.useMemo(() => [...files, ...addedFiles], [files, addedFiles]);
  const [droppingIdx, setDroppingIdx] = React.useState<number | null>(null);
  const [bumpCount, setBumpCount] = React.useState<number>(0);

  // Controlled or uncontrolled open state
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState<boolean>(defaultOpen);
  const isOpen = open !== undefined ? open : uncontrolledOpen;

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (open === undefined) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [open, onOpenChange]
  );

  const [menuOpen, setMenuOpen] = React.useState<boolean>(false);
  const [entered, setEntered] = React.useState<boolean>(!appear);

  // Scale calculations
  const scale = width / STAGE_W;
  const dpr =
    typeof window === "undefined"
      ? 1
      : Math.min(1.5, Math.max(1, window.devicePixelRatio || 1)) * scale;

  // IntersectionObserver for entrance animation
  React.useEffect(() => {
    if (!appear) return;
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setEntered(true);
      return;
    }

    let timer = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          timer = window.setTimeout(() => setEntered(true), appearDelay);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [appear, appearDelay]);

  // Mouse tilt physics
  React.useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    let rafId = 0;
    let targetX = 0;
    let targetY = 0;

    const applyTilt = () => {
      rafId = 0;
      el.style.setProperty("--gf-px", targetX.toFixed(3));
      el.style.setProperty("--gf-py", targetY.toFixed(3));
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const rect = el.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      targetY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      if (!rafId) rafId = requestAnimationFrame(applyTilt);
    };

    const handlePointerLeave = () => {
      targetX = 0;
      targetY = 0;
      if (!rafId) rafId = requestAnimationFrame(applyTilt);
    };

    el.addEventListener("pointermove", handlePointerMove);
    el.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      el.removeEventListener("pointermove", handlePointerMove);
      el.removeEventListener("pointerleave", handlePointerLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // inert attribute on files container when closed
  React.useEffect(() => {
    filesRef.current?.toggleAttribute("inert", !isOpen);
  }, [isOpen]);

  // Keyboard navigation & outside click
  React.useEffect(() => {
    if (!isOpen && !menuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (menuOpen) {
          setMenuOpen(false);
          keyRef.current?.focus();
        } else {
          setOpen(false);
          hitRef.current?.focus();
        }
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        menuOpen &&
        !menuRef.current?.contains(target) &&
        !keyRef.current?.contains(target)
      ) {
        setMenuOpen(false);
      }
      if (isOpen && !menuOpen && !rootRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen, menuOpen, setOpen]);

  // Focus first menu item on open
  React.useEffect(() => {
    if (menuOpen) {
      menuRef.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus();
    }
  }, [menuOpen]);

  const handleAddFile = () => {
    const newFile = onAdd?.(currentFiles) || {
      name: `Untitled ${currentFiles.length + 1}`,
      meta: "Just now",
    };
    const nextAdded = [...addedFiles, newFile];
    setAddedFiles(nextAdded);
    setDroppingIdx(currentFiles.length);
    setBumpCount((c) => c + 1);
    onFilesChange?.([...files, ...nextAdded]);
  };

  const menuItems: GlassFolderMenuItem[] = [
    {
      label: isOpen ? "Close folder" : "Open folder",
      onSelect: () => setOpen(!isOpen),
    },
    ...menu,
  ];

  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>("[role=menuitem]") || []);
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);

    const focusItem = (idx: number) => {
      e.preventDefault();
      items[(idx + items.length) % items.length]?.focus();
    };

    if (e.key === "ArrowDown") focusItem(currentIndex + 1);
    else if (e.key === "ArrowUp") focusItem(currentIndex - 1);
    else if (e.key === "Home") focusItem(0);
    else if (e.key === "End") focusItem(items.length - 1);
    else if (e.key === "Tab") setMenuOpen(false);
  };

  // Only take the top MAX_DISPLAY_SHEETS files to preserve fan animation
  const startIdx = Math.max(0, currentFiles.length - MAX_DISPLAY_SHEETS);
  const visibleFiles = currentFiles.slice(startIdx);
  const totalCount = currentFiles.length;
  const displayMeta = meta ?? `${totalCount} ${totalCount === 1 ? "item" : "items"}`;

  return (
    <div
      ref={rootRef}
      className={`gf-root${className ? ` ${className}` : ""}`}
      data-tone={tone}
      data-open={isOpen || undefined}
      data-entered={entered || undefined}
      data-place={labelPlacement}
      style={{
        width,
        height: (STAGE_H + OVERHANG_TOP) * scale,
        ...style,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: GLASS_FOLDER_CSS }} />

      <div
        className="gf-stage"
        style={{
          transform: `translateY(${OVERHANG_TOP * scale}px) scale(${scale})`,
        }}
      >
        <div className="gf-tilt">
          {/* Floor Shadow */}
          <div className="gf-shadow" aria-hidden="true" />

          {/* Back Pocket with Generative Art or Image */}
          <div
            className="gf-back"
            style={{ clipPath: `path('${BACK_PATH}')` }}
            aria-hidden="true"
          >
            {image ? (
              <img
                className="gf-art"
                src={image}
                alt=""
                width={STAGE_W + 24}
                height={STAGE_H + 24}
                draggable={false}
              />
            ) : art !== "none" ? (
              <ArtCanvas
                className="gf-art"
                art={art}
                seed={seed}
                w={STAGE_W + 24}
                h={STAGE_H + 24}
                density={dpr}
                priority={0}
              />
            ) : null}
            <div className="gf-back-sheen" />
          </div>

          {/* Back Rim SVG */}
          <svg
            className="gf-rim gf-back-rim"
            viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
            aria-hidden="true"
          >
            <path d={BACK_PATH} />
          </svg>

          {/* Front Translucent Glass */}
          <div
            key={bumpCount}
            className={`gf-front${bumpCount ? " gf-front--bump" : ""}`}
            style={{ clipPath: `path('${FRONT_PATH}')` }}
          >
            <div className="gf-tint" aria-hidden="true" />
            <div className="gf-spec" aria-hidden="true" />

            <svg
              className="gf-rim gf-front-rim"
              viewBox={`0 0 ${STAGE_W} ${FRONT_H}`}
              aria-hidden="true"
            >
              <defs>
                <linearGradient id={`gf-rim-${uid}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
                  <stop offset="0.35" stopColor="#b9ff66" stopOpacity="0.45" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0.12" />
                </linearGradient>
              </defs>
              <path d={FRONT_PATH} stroke={`url(#gf-rim-${uid})`} />
            </svg>

            {/* Click Hit Target to Toggle Open */}
            <button
              ref={hitRef}
              type="button"
              className="gf-hit"
              aria-expanded={isOpen}
              aria-label={`${isOpen ? "Close " : "Open "}${label}, ${totalCount} ${
                totalCount === 1 ? "item" : "items"
              }`}
              onClick={() => {
                setMenuOpen(false);
                setOpen(!isOpen);
              }}
            />

            {/* Folder Front Title & Metadata */}
            <div className="gf-label">
              <span className="gf-title">{label}</span>
              <span key={displayMeta} className="gf-meta">
                {displayMeta}
              </span>
            </div>
          </div>

          {/* Stacked File Sheets */}
          <div
            ref={filesRef}
            className="gf-files"
            role="list"
            aria-label={`${label} contents`}
          >
            {visibleFiles.map((file, idx) => {
              const globalIdx = startIdx + idx;
              const fileKey = `${file.name}-${globalIdx}`;
              const slot = fanSlot(idx, visibleFiles.length);
              const rand = rng(hashString(file.name) + globalIdx);
              const hasArt = Boolean(file.art || file.image);

              const sheetContent = (
                <>
                  {hasArt ? (
                    file.image ? (
                      <img
                        className="gf-sheet-art"
                        src={file.image}
                        alt=""
                        width={SHEET_W}
                        height={SHEET_H}
                        draggable={false}
                      />
                    ) : (
                      <ArtCanvas
                        className="gf-sheet-art"
                        art={file.art || "aurora"}
                        seed={hashString(file.name) % 997}
                        w={SHEET_W}
                        h={SHEET_H}
                        density={Math.min(dpr, 1.25)}
                        priority={1}
                      />
                    )
                  ) : (
                    <span className="gf-lines" aria-hidden="true">
                      <i style={{ width: "86%" }} />
                      <i style={{ width: "92%" }} />
                      <i style={{ width: "64%" }} />
                      <i style={{ width: "88%" }} />
                      <i style={{ width: "42%" }} />
                    </span>
                  )}

                  <span className="gf-sheet-head">
                    <span className="gf-sheet-name">{file.name}</span>
                    {file.meta ? <span className="gf-sheet-meta">{file.meta}</span> : null}
                  </span>
                </>
              );

              const sheetProps = {
                className: `gf-sheet${hasArt ? " gf-sheet--art" : ""}${
                  globalIdx === droppingIdx ? " gf-sheet--drop" : ""
                }`,
                style: {
                  "--gf-slot": slot,
                  "--gf-depth": visibleFiles.length - 1 - idx,
                  "--gf-jx": `${((rand() - 0.5) * 10).toFixed(2)}px`,
                  "--gf-jr": `${((rand() - 0.5) * 3.2).toFixed(2)}deg`,
                  zIndex: idx + 1,
                } as React.CSSProperties,
                onAnimationEnd:
                  globalIdx === droppingIdx ? () => setDroppingIdx(null) : undefined,
              };

              return (
                <div key={fileKey} role="listitem" className="gf-sheet-slot">
                  {file.href ? (
                    <a
                      {...sheetProps}
                      href={file.href}
                      onClick={() => {
                        onFileSelect?.(file, globalIdx);
                      }}
                    >
                      {sheetContent}
                    </a>
                  ) : (
                    <button
                      {...sheetProps}
                      type="button"
                      onClick={() => onFileSelect?.(file, globalIdx)}
                    >
                      {sheetContent}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Key Button (+ or ···) */}
          {action !== "none" ? (
            <button
              ref={keyRef}
              type="button"
              className={`gf-key gf-key--${action}`}
              aria-label={
                action === "add"
                  ? `Add a file to ${label}`
                  : `More options for ${label}`
              }
              aria-haspopup={action === "more" ? "menu" : undefined}
              aria-expanded={action === "more" ? menuOpen : undefined}
              aria-controls={action === "more" ? `gf-menu-${uid}` : undefined}
              onClick={() => {
                if (action === "add") handleAddFile();
                else setMenuOpen((prev) => !prev);
              }}
            >
              {action === "add" ? (
                <svg
                  key={bumpCount}
                  className="gf-glyph gf-glyph--plus"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 4.5v15M4.5 12h15" />
                </svg>
              ) : (
                <svg
                  className="gf-glyph gf-glyph--more"
                  viewBox="0 0 30 12"
                  aria-hidden="true"
                >
                  <rect x="1" y="1.5" width="8" height="9" rx="3.4" />
                  <rect x="11" y="1.5" width="8" height="9" rx="3.4" />
                  <rect x="21" y="1.5" width="8" height="9" rx="3.4" />
                </svg>
              )}
            </button>
          ) : null}

          {/* More Options Popover Menu */}
          {action === "more" ? (
            <div
              ref={menuRef}
              id={`gf-menu-${uid}`}
              role="menu"
              aria-label={`${label} options`}
              className="gf-menu"
              data-open={menuOpen || undefined}
              onKeyDown={handleMenuKeyDown}
            >
              {menuItems.map((item, i) => (
                <button
                  key={`${item.label}-${i}`}
                  type="button"
                  role="menuitem"
                  tabIndex={menuOpen ? 0 : -1}
                  disabled={!menuOpen}
                  className={`gf-menu-item${item.danger ? " gf-menu-item--danger" : ""}`}
                  onClick={() => {
                    setMenuOpen(false);
                    keyRef.current?.focus();
                    item.onSelect?.();
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
