"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  Calendar,
  Flame,
  GitCommit,
  Layers,
  RotateCcw,
  Sparkles,
  Trophy,
  Info,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";

export interface ContributionDay {
  date: string; // YYYY-MM-DD
  count: number;
  level?: 0 | 1 | 2 | 3 | 4;
}

export type PaletteKey = "lime" | "emerald" | "cyber" | "sunset";

export interface ContributionSkylineProps {
  data?: ContributionDay[];
  username?: string;
  className?: string;
  isLoading?: boolean;
  error?: string | null;
  errorCode?: string | null;
  onRetry?: () => void;
  onDayClick?: (day: ContributionDay) => void;
}

// Color palettes for the 3D skyline and 2D grid
const PALETTES: Record<
  PaletteKey,
  {
    name: string;
    bg: string;
    cardBg: string;
    grid: string;
    wireframe: string;
    accent: string;
    levels: [string, string, string, string, string];
    sides: [string, string, string, string, string];
  }
> = {
  lime: {
    name: "Acid Lime",
    bg: "#080808",
    cardBg: "#0d0d0d",
    grid: "#1a1a1a",
    wireframe: "#27272a",
    accent: "#B9FF66",
    levels: ["#161616", "#1e3a1f", "#2f6b32", "#6ec244", "#B9FF66"],
    sides: ["#111111", "#142615", "#204622", "#4a852e", "#86cc43"],
  },
  emerald: {
    name: "Emerald",
    bg: "#0d1117",
    cardBg: "#11161d",
    grid: "#21262d",
    wireframe: "#30363d",
    accent: "#39d353",
    levels: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
    sides: ["#101419", "#092d1b", "#004720", "#1a702b", "#279139"],
  },
  cyber: {
    name: "Cyber Neon",
    bg: "#0a0612",
    cardBg: "#100a1d",
    grid: "#1c1130",
    wireframe: "#2e1d52",
    accent: "#e056fd",
    levels: ["#140c24", "#3b156b", "#6821a8", "#a855f7", "#e056fd"],
    sides: ["#0e0819", "#260e45", "#471773", "#7439aa", "#9b37ad"],
  },
  sunset: {
    name: "Sunset Ember",
    bg: "#120909",
    cardBg: "#170c0c",
    grid: "#2a1515",
    wireframe: "#422121",
    accent: "#ff6b6b",
    levels: ["#1a0f0f", "#4d1a1a", "#8a2c2c", "#e05353", "#ff6b6b"],
    sides: ["#120a0a", "#331111", "#5e1e1e", "#993838", "#ad4949"],
  },
};

const DEFAULT_ROTATION = { x: 0.62, y: -0.78 };

function formatDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// Quantize count into 0..4 color level
function getLevel(count: number, max: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (max <= 0) return 1;
  const ratio = count / max;
  if (ratio > 0.75) return 4;
  if (ratio > 0.5) return 3;
  if (ratio > 0.25) return 2;
  return 1;
}

export function ContributionSkyline({
  data,
  username = "Inexpert-trifler",
  className = "",
  isLoading = false,
  error = null,
  errorCode = null,
  onRetry,
  onDayClick,
}: ContributionSkylineProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [selectedPalette, setSelectedPalette] = useState<PaletteKey>("lime");
  const [is3D, setIs3D] = useState<boolean>(true);
  const [rotation, setRotation] = useState<{ x: number; y: number }>(DEFAULT_ROTATION);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [morphProgress, setMorphProgress] = useState<number>(1); // 0 = 2D, 1 = 3D
  const [hoveredDay, setHoveredDay] = useState<{
    day: ContributionDay;
    clientX: number;
    clientY: number;
  } | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);
  const isReducedMotion = useRef<boolean>(false);
  const morphRef = useRef<number>(1);

  // Projected screen coordinates of each day pillar for hit-testing and keyboard focus
  const projectedPointsRef = useRef<
    Array<{ x: number; y: number; day: ContributionDay; index: number }>
  >([]);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      isReducedMotion.current = mq.matches;
      const listener = (e: MediaQueryListEvent) => {
        isReducedMotion.current = e.matches;
      };
      mq.addEventListener("change", listener);
      return () => mq.removeEventListener("change", listener);
    }
  }, []);

  // Filter valid real data only (strictly never falling back to synthetic data)
  const validContributions = useMemo<ContributionDay[]>(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }
    return data;
  }, [data]);

  // Statistics derived strictly from real API response
  const stats = useMemo(() => {
    if (validContributions.length === 0) {
      return {
        total: 0,
        activeDays: 0,
        peak: { count: 0, date: "" },
        currentStreak: 0,
        maxStreak: 0,
        maxCount: 1,
      };
    }

    let total = 0;
    let activeDays = 0;
    let maxCount = 0;
    let peakDate = "";
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < validContributions.length; i++) {
      const item = validContributions[i];
      const count = Math.max(0, item.count || 0);
      total += count;

      if (count > 0) {
        activeDays++;
        tempStreak++;
        if (tempStreak > maxStreak) {
          maxStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }

      if (count > maxCount) {
        maxCount = count;
        peakDate = item.date;
      }
    }

    // Calculate current streak from the end
    let streakIdx = validContributions.length - 1;
    while (streakIdx >= 0 && (validContributions[streakIdx].count || 0) > 0) {
      currentStreak++;
      streakIdx--;
    }

    return {
      total,
      activeDays,
      peak: { count: maxCount, date: peakDate },
      currentStreak,
      maxStreak,
      maxCount: Math.max(maxCount, 1),
    };
  }, [validContributions]);

  // Smooth 2D <-> 3D transition animation
  useEffect(() => {
    const target = is3D ? 1 : 0;
    if (isReducedMotion.current) {
      morphRef.current = target;
      setMorphProgress(target);
      return;
    }

    let cancelled = false;

    const step = () => {
      if (cancelled) return;
      const current = morphRef.current;
      const diff = target - current;
      if (Math.abs(diff) < 0.01) {
        morphRef.current = target;
        setMorphProgress(target);
        return;
      }
      const next = current + diff * 0.14;
      morphRef.current = next;
      setMorphProgress(next);
      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      cancelled = true;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [is3D]);

  // Canvas drawing loop
  const drawScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const rect = canvas.getBoundingClientRect();
    const displayWidth = Math.floor(rect.width);
    const displayHeight = Math.floor(rect.height);

    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    const width = displayWidth;
    const height = displayHeight;
    const palette = PALETTES[selectedPalette];

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, palette.cardBg);
    bgGrad.addColorStop(1, palette.bg);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // If no data, return early (empty/loading handled by HTML overlay)
    if (validContributions.length === 0) {
      ctx.restore();
      return;
    }

    // Grid layout: 52 weeks x 7 days
    const totalDays = validContributions.length;
    const weeksCount = Math.min(52, Math.ceil(totalDays / 7));
    const daysPerWeek = 7;

    const cellSpacing = Math.min(width / (weeksCount + 4), 14);
    const cellSize = cellSpacing * 0.76;
    const maxElevation = Math.min(height * 0.38, 70);

    const morph = morphProgress; // 0 = flat 2D, 1 = 3D isometric
    const cosX = Math.cos(rotation.x);
    const sinX = Math.sin(rotation.x);
    const cosY = Math.cos(rotation.y);
    const sinY = Math.sin(rotation.y);

    const centerX = width / 2;
    const centerY = height / 2 + (morph * 24);

    const points: Array<{
      x: number;
      y: number;
      depth: number;
      day: ContributionDay;
      index: number;
      drawFn: () => void;
    }> = [];

    // Precalculate all days in week order
    for (let i = 0; i < totalDays; i++) {
      const item = validContributions[i];
      const weekIdx = Math.floor(i / daysPerWeek);
      const dayIdx = i % daysPerWeek;

      if (weekIdx >= weeksCount) break;

      const normX = (weekIdx - weeksCount / 2) * cellSpacing;
      const normY = (dayIdx - daysPerWeek / 2) * cellSpacing;

      // 2D position
      const flatX = centerX + normX;
      const flatY = centerY + normY - 20;

      // 3D Isometric position
      const count = Math.max(0, item.count || 0);
      const elevation = (count / stats.maxCount) * maxElevation;
      const baseHeight = count > 0 ? Math.max(elevation, 5) : 2;

      // Rotate ground plane (X, Y) by yaw (rotation.y)
      const rotatedX = normX * cosY - normY * sinY;
      const rotatedY = normX * sinY + normY * cosY;

      // Project onto screen with pitch (rotation.x)
      const isoX = centerX + rotatedX;
      const isoGroundY = centerY + rotatedY * sinX;
      const isoTopY = isoGroundY - (baseHeight * cosX);

      // Interpolate between flat 2D and 3D
      const screenX = flatX * (1 - morph) + isoX * morph;
      const screenY = flatY * (1 - morph) + isoTopY * morph;
      const groundY = flatY * (1 - morph) + isoGroundY * morph;

      const level = getLevel(count, stats.maxCount);
      const topColor = palette.levels[level];
      const sideColor = palette.sides[level];
      const depth = rotatedY; // for sorting back-to-front in 3D

      const isHovered = hoveredDay?.day.date === item.date;
      const isFocused = focusedIndex === i;

      points.push({
        x: screenX,
        y: screenY,
        depth,
        day: item,
        index: i,
        drawFn: () => {
          ctx.save();

          if (morph > 0.05) {
            // Draw isometric extruded pillar
            const halfW = (cellSize / 2) * (1 + (isHovered ? 0.2 : 0));

            // Left / Front shading
            ctx.fillStyle = sideColor;
            ctx.beginPath();
            ctx.moveTo(screenX - halfW, groundY);
            ctx.lineTo(screenX - halfW, screenY);
            ctx.lineTo(screenX + halfW, screenY);
            ctx.lineTo(screenX + halfW, groundY);
            ctx.closePath();
            ctx.fill();

            // Pillar border
            ctx.strokeStyle = palette.wireframe;
            ctx.lineWidth = 0.5;
            ctx.stroke();

            // Pillar Top Face
            ctx.fillStyle = isHovered || isFocused ? palette.accent : topColor;
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(screenX - halfW, screenY - halfW * 0.5, halfW * 2, halfW, 2);
            } else {
              ctx.rect(screenX - halfW, screenY - halfW * 0.5, halfW * 2, halfW);
            }
            ctx.fill();

            if (isHovered || isFocused) {
              ctx.strokeStyle = "#FFFFFF";
              ctx.lineWidth = 1.5;
              ctx.shadowColor = palette.accent;
              ctx.shadowBlur = 10;
              ctx.stroke();
            } else {
              ctx.strokeStyle = palette.wireframe;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          } else {
            // Draw 2D Grid Cell
            const size = cellSize * (isHovered ? 1.25 : 1);
            const x = screenX - size / 2;
            const y = screenY - size / 2;

            ctx.fillStyle = isHovered || isFocused ? palette.accent : topColor;
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(x, y, size, size, 2);
            } else {
              ctx.rect(x, y, size, size);
            }
            ctx.fill();

            if (isHovered || isFocused) {
              ctx.strokeStyle = "#FFFFFF";
              ctx.lineWidth = 1.5;
              ctx.shadowColor = palette.accent;
              ctx.shadowBlur = 8;
              ctx.stroke();
            } else {
              ctx.strokeStyle = count > 0 ? "rgba(255,255,255,0.06)" : palette.grid;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }

          ctx.restore();
        },
      });
    }

    // Sort back-to-front if in 3D mode
    if (morph > 0.05) {
      points.sort((a, b) => a.depth - b.depth);
    }

    // Draw all points
    projectedPointsRef.current = points.map((p) => ({
      x: p.x,
      y: p.y,
      day: p.day,
      index: p.index,
    }));

    for (let k = 0; k < points.length; k++) {
      points[k].drawFn();
    }

    // Draw ground shadow / grid base in 3D
    if (morph > 0.3) {
      ctx.save();
      ctx.strokeStyle = palette.grid;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 40, width * 0.45, height * 0.22, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }, [
    validContributions,
    selectedPalette,
    morphProgress,
    rotation,
    hoveredDay,
    focusedIndex,
    stats.maxCount,
  ]);

  // Render canvas on state change or resize
  useEffect(() => {
    drawScene();
  }, [drawScene]);

  // Window resize observer to keep canvas responsive
  useEffect(() => {
    const handleResize = () => {
      drawScene();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawScene]);

  // Pointer drag to orbit 3D view
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDragging) {
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      setRotation((prev) => ({
        x: Math.max(0.18, Math.min(1.35, prev.x - deltaY * 0.007)),
        y: prev.y + deltaX * 0.008,
      }));

      dragStartRef.current = { x: e.clientX, y: e.clientY };
    } else {
      // Hit testing for hover
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let closest: { day: ContributionDay; dist: number; index: number } | null = null;
      for (const pt of projectedPointsRef.current) {
        const dx = pt.x - mouseX;
        const dy = pt.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 15 && (!closest || dist < closest.dist)) {
          closest = { day: pt.day, dist, index: pt.index };
        }
      }

      if (closest) {
        setFocusedIndex(closest.index);
        setHoveredDay({
          day: closest.day,
          clientX: e.clientX,
          clientY: e.clientY,
        });
      } else {
        setFocusedIndex(null);
        setHoveredDay(null);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setHoveredDay(null);
    setFocusedIndex(null);
  };

  // Touch controls for mobile orbit & tap
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      dragStartRef.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStartRef.current.x;
    const deltaY = touch.clientY - dragStartRef.current.y;

    setRotation((prev) => ({
      x: Math.max(0.18, Math.min(1.35, prev.x - deltaY * 0.007)),
      y: prev.y + deltaX * 0.008,
    }));

    dragStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Keyboard navigation & accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (validContributions.length === 0) return;

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setRotation((prev) => ({ ...prev, y: prev.y - 0.08 }));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setRotation((prev) => ({ ...prev, y: prev.y + 0.08 }));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setRotation((prev) => ({ ...prev, x: Math.min(1.35, prev.x + 0.05) }));
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setRotation((prev) => ({ ...prev, x: Math.max(0.18, prev.x - 0.05) }));
    } else if (e.key === "r" || e.key === "R") {
      setRotation(DEFAULT_ROTATION);
    } else if (e.key === "m" || e.key === "M") {
      setIs3D((prev) => !prev);
    } else if (e.key === "Enter" || e.key === " ") {
      if (hoveredDay) {
        onDayClick?.(hoveredDay.day);
      }
    }
  };

  const handleCanvasClick = () => {
    if (!hoveredDay) return;
    onDayClick?.(hoveredDay.day);
  };

  const currentPalette = PALETTES[selectedPalette];

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label={`GitHub contribution skyline for ${username}`}
      className={`relative rounded-xl border border-white/10 bg-[#0d0d0d] p-5 sm:p-7 shadow-2xl focus:outline-none focus:ring-1 focus:ring-[#B9FF66]/50 transition-all ${className}`}
    >
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#B9FF66]">
              <Sparkles className="h-3.5 w-3.5 animate-pulse text-[#B9FF66]" />
              <span>GITHUB SKYLINE</span>
            </span>

            {/* Live Data Status Indicator */}
            {isLoading && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-0.5 font-mono text-[10px] text-amber-300 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>Syncing live GitHub data...</span>
              </span>
            )}

            {!isLoading && !error && validContributions.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#B9FF66]/30 bg-[#B9FF66]/10 px-2.5 py-0.5 font-mono text-[10px] text-[#B9FF66] font-semibold shadow-[0_0_8px_rgba(185,255,102,0.2)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#B9FF66]" />
                <span>Live GraphQL feed</span>
              </span>
            )}

            {!isLoading && error && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 font-mono text-[10px] text-rose-300 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                <span>Sync offline</span>
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-mono">
            <a
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-zinc-200 hover:text-[#B9FF66] transition-colors"
              aria-label={`Visit GitHub profile for @${username}`}
            >
              <GithubIcon className="h-3.5 w-3.5" />
              <span>@{username}</span>
              <ExternalLink className="h-3 w-3 opacity-70" />
            </a>

            {!isLoading && validContributions.length > 0 && (
              <>
                <span className="text-zinc-600">·</span>
                <span className="text-[11px] text-zinc-400">
                  {validContributions[0]?.date} → {validContributions[validContributions.length - 1]?.date}
                </span>
              </>
            )}
          </div>
        </div>

        {/* View Controls & Palettes */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Palette selector */}
          <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
            {(["lime", "emerald", "cyber", "sunset"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPalette(p)}
                className={`rounded px-2 py-0.5 font-mono text-[10px] uppercase transition-all ${
                  selectedPalette === p
                    ? "bg-[#B9FF66] text-[#080808] font-bold shadow-[0_0_8px_rgba(185,255,102,0.3)]"
                    : "text-zinc-400 hover:text-white"
                }`}
                title={`Switch to ${PALETTES[p].name} palette`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* 2D / 3D Toggle */}
          <button
            onClick={() => setIs3D((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-zinc-200 hover:border-[#B9FF66]/50 hover:text-[#B9FF66] transition-all"
            title="Toggle between 3D Isometric Skyline and 2D Grid"
          >
            <Layers className="h-3.5 w-3.5 text-[#B9FF66]" />
            <span>{is3D ? "3D Skyline" : "2D Grid"}</span>
          </button>

          {/* Reset Camera Orbit */}
          <button
            onClick={() => setRotation(DEFAULT_ROTATION)}
            className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-zinc-400 hover:border-white/20 hover:text-white transition-all"
            title="Reset 3D camera orientation (Hotkey: R)"
            aria-label="Reset camera rotation"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Recoverable Error Notification Banner */}
      {!isLoading && error && (
        <div className="my-5 rounded-lg border border-amber-500/25 bg-amber-500/5 p-4 font-mono text-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-semibold text-amber-300">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                <span>
                  {errorCode === "MISSING_TOKEN"
                    ? "GitHub Token Missing"
                    : errorCode === "RATE_LIMITED"
                    ? "GitHub Rate Limit Reached"
                    : "GitHub Contribution Feed Offline"}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-400">
                {error || "Unable to retrieve contribution calendar data."}
              </p>
              {errorCode === "MISSING_TOKEN" && (
                <p className="mt-1 text-[10px] text-zinc-500">
                  Configure <code className="rounded bg-white/10 px-1 py-0.5 text-[#B9FF66]">GITHUB_TOKEN</code> in your environment variables to enable the live contribution skyline.
                </p>
              )}
            </div>

            {onRetry && (
              <button
                onClick={onRetry}
                className="shrink-0 flex items-center gap-1.5 rounded-md border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white hover:border-[#B9FF66] hover:text-[#B9FF66] transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Real Statistics Strip */}
      <div className="my-5 grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
        <div className="rounded-lg border border-white/5 bg-[#141414] p-3">
          <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase">
            <Trophy className="h-3 w-3 text-[#B9FF66]" />
            <span>Annual Commits</span>
          </div>
          <div className="mt-1 text-lg font-bold text-[#B9FF66]">
            {!isLoading && validContributions.length > 0 ? (
              stats.total.toLocaleString()
            ) : isLoading ? (
              <span className="text-zinc-500 animate-pulse">Syncing...</span>
            ) : (
              <span className="text-zinc-600">—</span>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-white/5 bg-[#141414] p-3">
          <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase">
            <Flame className="h-3 w-3 text-amber-400" />
            <span>Active Days</span>
          </div>
          <div className="mt-1 text-lg font-bold text-white">
            {!isLoading && validContributions.length > 0 ? (
              `${stats.activeDays} / ${validContributions.length}`
            ) : isLoading ? (
              <span className="text-zinc-500 animate-pulse">Syncing...</span>
            ) : (
              <span className="text-zinc-600">—</span>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-white/5 bg-[#141414] p-3">
          <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase">
            <GitCommit className="h-3 w-3 text-[#38BDF8]" />
            <span>Peak Activity</span>
          </div>
          <div className="mt-1 text-lg font-bold text-[#38BDF8]">
            {!isLoading && validContributions.length > 0 && stats.peak.count > 0 ? (
              `${stats.peak.count} commits`
            ) : isLoading ? (
              <span className="text-zinc-500 animate-pulse">Syncing...</span>
            ) : (
              <span className="text-zinc-600">—</span>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-white/5 bg-[#141414] p-3">
          <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase">
            <Calendar className="h-3 w-3 text-purple-400" />
            <span>Longest Streak</span>
          </div>
          <div className="mt-1 text-lg font-bold text-purple-300">
            {!isLoading && validContributions.length > 0 ? (
              `${stats.maxStreak} ${stats.maxStreak === 1 ? "day" : "days"}`
            ) : isLoading ? (
              <span className="text-zinc-500 animate-pulse">Syncing...</span>
            ) : (
              <span className="text-zinc-600">—</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="relative w-full h-[360px] sm:h-[400px] rounded-xl overflow-hidden border border-white/10 bg-[#080808] cursor-grab active:cursor-grabbing select-none">
        {/* Render Canvas ONLY when actual contribution data is loaded */}
        {!isLoading && !error && validContributions.length > 0 && (
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={handleCanvasClick}
            className="w-full h-full block"
          />
        )}

        {/* Loading state skeleton */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#080808]/90 backdrop-blur-sm p-6 text-center font-mono">
            <div className="h-8 w-8 rounded-full border-2 border-[#B9FF66]/20 border-t-[#B9FF66] animate-spin" />
            <div className="text-sm font-semibold text-white">GENERATING ISOMETRIC SKYLINE</div>
            <div className="text-xs text-zinc-500">Retrieving daily commit volumes from GitHub GraphQL...</div>
          </div>
        )}

        {/* Error / Empty state overlay */}
        {!isLoading && (error || validContributions.length === 0) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#080808] p-6 text-center font-mono">
            <AlertTriangle className="h-8 w-8 text-amber-400/80" />
            <div className="text-sm font-bold text-white">SKYLINE DATA UNAVAILABLE</div>
            <p className="max-w-md text-xs text-zinc-400">
              {error || "No contribution activity records found for this period. Demo fallback is disabled."}
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-2 inline-flex items-center gap-2 rounded-lg border border-[#B9FF66]/30 bg-[#B9FF66]/10 px-4 py-2 text-xs font-semibold text-[#B9FF66] hover:bg-[#B9FF66]/20 transition-all"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry Connection</span>
              </button>
            )}
          </div>
        )}

        {/* Floating Tooltip */}
        {hoveredDay && !isDragging && (
          <div
            className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full mb-3 rounded-lg border border-white/20 bg-[#161616]/95 backdrop-blur-md px-3 py-2 font-mono text-xs text-white shadow-2xl transition-all"
            style={{
              left: `${hoveredDay.clientX}px`,
              top: `${hoveredDay.clientY - 12}px`,
            }}
          >
            <div className="text-[11px] text-zinc-400">{formatDate(hoveredDay.day.date)}</div>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="font-bold text-[#B9FF66]">
                {hoveredDay.day.count} {hoveredDay.day.count === 1 ? "contribution" : "contributions"}
              </span>
            </div>
          </div>
        )}

        {/* Floating Controls Hint Badge */}
        {!isLoading && !error && validContributions.length > 0 && (
          <div className="absolute bottom-3 left-3 pointer-events-none hidden sm:flex items-center gap-2 rounded-lg border border-white/10 bg-black/70 backdrop-blur-md px-3 py-1.5 font-mono text-[11px] text-zinc-400">
            <Info className="h-3.5 w-3.5 text-[#B9FF66]" />
            <span>Drag to orbit 3D view · Arrow keys to rotate · Hotkey R to reset</span>
          </div>
        )}
      </div>

      {/* Footer Legend & Controls Strip */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10 font-mono text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="text-[11px]">Activity Level:</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-zinc-500">Less</span>
            {currentPalette.levels.map((color, idx) => (
              <span
                key={idx}
                className="h-3 w-3 rounded-sm border border-white/10"
                style={{ backgroundColor: color }}
                title={`Level ${idx}`}
              />
            ))}
            <span className="text-[10px] text-zinc-500">More</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-zinc-500">
          <span>Projection: {is3D ? "Isometric 3D" : "2D Orthographic"}</span>
          <span>·</span>
          <span>Theme: {currentPalette.name}</span>
        </div>
      </div>
    </div>
  );
}
