"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  useMotionValueEvent,
} from "motion/react";
import { MilestoneItem, milestonesData } from "@/data/milestones";
import {
  Trophy,
  Code2,
  BookOpen,
  Users,
  Sparkles,
  Award,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface MilestonesRoadmapProps {
  milestones?: MilestoneItem[];
  className?: string;
}

// -------------------------------------------------------------
// STANDARDIZED DESIGN TOKENS FOR ALL MILESTONE CARDS
// -------------------------------------------------------------
const CARD_TOKENS = {
  // Desktop column and card outer dimensions
  desktopWidth: "w-[360px] sm:w-[410px] lg:w-[440px]",
  desktopHeight: "h-[390px]",
  desktopPadding: "p-6 sm:p-7",
  desktopGap: "gap-8 sm:gap-10",

  // Mobile card dimensions
  mobileWidth: "w-[85vw] max-w-[340px]",
  mobileHeight: "h-[375px]",
  mobilePadding: "p-5",

  // Shared typography and shell tokens
  borderRadius: "rounded-2xl",
  borderWidth: "border",
} as const;

function getMilestoneIcon(type: MilestoneItem["type"], featured?: boolean) {
  if (featured) {
    return <Sparkles className="h-4 w-4 text-[#B9FF66]" />;
  }
  switch (type) {
    case "hackathon":
      return <Trophy className="h-4 w-4 text-[#F59E0B]" />;
    case "project":
      return <Code2 className="h-4 w-4 text-[#38BDF8]" />;
    case "community":
      return <Users className="h-4 w-4 text-[#A78BFA]" />;
    case "learning":
    default:
      return <BookOpen className="h-4 w-4 text-[#B9FF66]" />;
  }
}

// -------------------------------------------------------------
// DESKTOP & TABLET SCROLL-DRIVEN HORIZONTAL TIMELINE
// -------------------------------------------------------------
function DesktopHorizontalRoadmap({
  milestones,
}: {
  milestones: MilestoneItem[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [travelDistance, setTravelDistance] = useState<number>(0);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);

  // Measure rendered track and viewport width to calculate dynamic travel distance
  useEffect(() => {
    const updateTravelDistance = () => {
      if (trackRef.current && viewportRef.current) {
        const trackWidth = trackRef.current.scrollWidth;
        const viewportWidth = viewportRef.current.clientWidth;
        // Ensure last card has comfortable breathing room at end of scroll
        const travel = Math.max(0, trackWidth - viewportWidth + 64);
        setTravelDistance(travel);
      }
    };

    updateTravelDistance();

    const ro = new ResizeObserver(() => {
      updateTravelDistance();
    });

    if (trackRef.current) ro.observe(trackRef.current);
    if (viewportRef.current) ro.observe(viewportRef.current);
    window.addEventListener("resize", updateTravelDistance);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateTravelDistance);
    };
  }, [milestones]);

  // Vertical scroll progress of the container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth physics-based spring interpolation
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 32,
    restDelta: 0.001,
  });

  // Horizontal translation driven strictly by vertical scroll progress
  // Buffer at start (0 to 0.04) and end (0.94 to 1.0) ensures first and final milestones are easily read
  const x = useTransform(
    smoothProgress,
    [0, 0.04, 0.94, 1],
    [0, 0, -travelDistance, -travelDistance]
  );

  // Single continuous spine progress line width synchronized with scroll progress
  const spineProgressWidth = useTransform(
    smoothProgress,
    [0, 0.94],
    ["0%", "100%"]
  );

  // Track active milestone index for node lighting
  useMotionValueEvent(smoothProgress, "change", (latest) => {
    const rawIndex = Math.round(latest * (milestones.length - 1));
    const clamped = Math.min(milestones.length - 1, Math.max(0, rawIndex));
    if (clamped !== activeCardIndex) {
      setActiveCardIndex(clamped);
    }
  });

  // Section height: scale comfortably with travel distance so 1px scroll ~ 1px travel
  const sectionHeight = travelDistance > 0 ? `${travelDistance + 900}px` : "340vh";

  return (
    <div
      ref={containerRef}
      style={{ height: sectionHeight }}
      className="relative w-full"
    >
      {/* Sticky Viewport Frame: pins to top of screen while scrolling */}
      <div
        ref={viewportRef}
        className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between py-8 select-none"
      >
        {/* Top Header: Clean, Non-Redundant, Authoritative */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#B9FF66]">
              {"// 05 · JOURNEY & EVOLUTION"}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#B9FF66] animate-pulse" />
          </div>
          <h2 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase font-mono">
            MILESTONES & ROADMAP
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400 font-sans">
            From first builds to ambitious products — the journey so far.
          </p>
          <div className="mt-3 h-1 w-12 bg-[#B9FF66]" />
        </div>

        {/* Center Arena: Continuous Horizontal Spine and Moving Track */}
        <div className="relative w-full flex-1 flex items-center overflow-hidden my-auto py-4">
          {/* Horizontal Track of Milestone Cards */}
          <motion.div
            ref={trackRef}
            style={{ x }}
            className={`relative flex items-start ${CARD_TOKENS.desktopGap} pl-6 sm:pl-12 lg:pl-16 pr-16 sm:pr-32`}
          >
            {/* 
              CONTINUOUS TRACK-LEVEL SPINE (Uninterrupted single track-level element)
              Positioned at top-5 (-translate-y-1/2 = exactly y=20px, matching vertical center of all nodes).
              Spans the complete milestone track behind all nodes with ZERO gaps between cards.
            */}
            <div
              aria-hidden="true"
              className="absolute top-5 left-0 right-0 h-[2px] -translate-y-1/2 pointer-events-none z-0"
            >
              {/* Single Continuous Muted Base Line */}
              <div className="absolute inset-0 bg-white/10" />

              {/* Single Continuous Lime Progress Overlay Synchronized with Scroll */}
              <motion.div
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#B9FF66] via-[#B9FF66] to-[#a3e635] shadow-[0_0_12px_rgba(185,255,102,0.8)]"
                style={{ width: spineProgressWidth }}
              />
            </div>

            {milestones.map((milestone, index) => {
              const isFeatured = !!milestone.featured;
              const isActive = activeCardIndex === index;
              const isPast = activeCardIndex >= index;

              return (
                <div
                  key={milestone.id}
                  className={`relative flex flex-col items-center ${CARD_TOKENS.desktopWidth} shrink-0 z-10`}
                >
                  {/* Top Node on Spine Bar Area */}
                  <div className="relative w-full flex items-center justify-center h-10 mb-4">
                    {/* 
                      Timeline Node: Layers cleanly on top of continuous track spine (z-10).
                      The line passes completely behind it without interruption.
                    */}
                    <div
                      className={`relative z-10 flex items-center justify-center rounded-full transition-all duration-300 ${
                        isFeatured
                          ? isPast
                            ? "h-9 w-9 border-2 border-[#B9FF66] bg-[#0c0c0c] shadow-[0_0_18px_rgba(185,255,102,0.7)]"
                            : "h-9 w-9 border border-white/20 bg-[#121212]"
                          : isPast
                          ? "h-7 w-7 border-2 border-[#B9FF66] bg-[#0c0c0c] shadow-[0_0_12px_rgba(185,255,102,0.5)]"
                          : "h-7 w-7 border border-white/20 bg-[#141414]"
                      }`}
                    >
                      <span
                        className={`rounded-full transition-all duration-300 ${
                          isFeatured
                            ? isPast
                              ? "h-3.5 w-3.5 bg-[#B9FF66] animate-pulse"
                              : "h-2.5 w-2.5 bg-white/30"
                            : isPast
                            ? "h-2.5 w-2.5 bg-[#B9FF66]"
                            : "h-2 w-2 bg-white/25"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Vertical Connector Stem from Node to Card */}
                  <div
                    className={`w-[2px] h-4 transition-colors duration-300 ${
                      isPast ? "bg-[#B9FF66]/50" : "bg-white/10"
                    }`}
                  />

                  {/* 
                    STANDARDIZED MILESTONE CARD:
                    Every card shares the exact same outer dimensions (desktopWidth, desktopHeight, box-border),
                    border-radius, padding, and internal vertical grid/flex layout.
                  */}
                  <div
                    tabIndex={0}
                    className={`group relative flex flex-col w-full ${CARD_TOKENS.desktopHeight} ${CARD_TOKENS.borderRadius} ${CARD_TOKENS.borderWidth} box-border transition-all duration-300 ${CARD_TOKENS.desktopPadding} backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#B9FF66] ${
                      isFeatured
                        ? isActive
                          ? "border-[#B9FF66] bg-gradient-to-b from-[#181818] via-[#121212] to-[#0c0c0c] shadow-[0_0_36px_rgba(185,255,102,0.22)]"
                          : "border-[#B9FF66]/50 bg-gradient-to-b from-[#141414] to-[#0d0d0d] shadow-[0_0_24px_rgba(185,255,102,0.08)] hover:border-[#B9FF66]"
                        : isActive
                        ? "border-[#B9FF66]/70 bg-[#141414] shadow-[0_0_20px_rgba(185,255,102,0.1)]"
                        : "border-white/10 bg-[#111111] hover:border-white/25 hover:bg-[#141414]"
                    }`}
                  >
                    {/* 1. Standardized Header: Period Badge, Icon, Featured Star */}
                    <div className="flex items-center justify-between gap-2 shrink-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider shrink-0 ${
                            isFeatured
                              ? "bg-[#B9FF66] text-[#080808] shadow-[0_0_12px_rgba(185,255,102,0.35)]"
                              : "border border-white/10 bg-[#181818] text-white"
                          }`}
                        >
                          {milestone.period}
                        </span>

                        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-[#171717] shrink-0">
                          {getMilestoneIcon(milestone.type, isFeatured)}
                        </div>
                      </div>

                      {isFeatured && (
                        <span className="flex items-center gap-1 rounded-full border border-[#B9FF66]/40 bg-[#B9FF66]/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#B9FF66] shrink-0">
                          <Sparkles className="h-3 w-3" />
                          <span>KEY HIGHLIGHT</span>
                        </span>
                      )}
                    </div>

                    {/* 2. Optional Achievement & Status Badges Row (Reserved height so titles do not jump vertically) */}
                    <div className="flex items-center gap-1.5 h-6 mt-2.5 shrink-0 overflow-hidden">
                      {milestone.achievement && (
                        <span className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-amber-300 truncate">
                          <Award className="h-3 w-3 shrink-0" />
                          <span className="truncate">{milestone.achievement}</span>
                        </span>
                      )}
                      {milestone.status && (
                        <span className="rounded-full border border-[#38BDF8]/30 bg-[#38BDF8]/10 px-2.5 py-0.5 font-mono text-[11px] font-medium text-[#38BDF8] truncate">
                          {milestone.status}
                        </span>
                      )}
                    </div>

                    {/* 3. Title: Consistent font size, weight, line height, reserved height */}
                    <div className="mt-3 min-h-[56px] flex items-start shrink-0">
                      <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-[#B9FF66] transition-colors leading-snug line-clamp-2">
                        {milestone.title}
                      </h3>
                    </div>

                    {/* 4. Description: Consistent line height and reserved content area */}
                    <div className="mt-2 flex-1 min-h-[84px] overflow-hidden">
                      <p className="text-sm leading-relaxed text-zinc-300 font-sans line-clamp-4">
                        {milestone.description}
                      </p>
                    </div>

                    {/* 5. Standard Divider: Same vertical position and spacing across all cards */}
                    <div className="w-full h-px bg-white/10 my-3.5 shrink-0" />

                    {/* 6. Tags Area: Anchored cleanly at the bottom with consistent wrapping */}
                    <div className="flex flex-wrap gap-1.5 min-h-[52px] items-start shrink-0">
                      {milestone.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="rounded-md border border-white/5 bg-white/5 px-2 py-0.5 font-mono text-[11px] text-zinc-300 transition-colors group-hover:border-white/15"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// MOBILE TOUCH-FRIENDLY HORIZONTAL CAROUSEL (< 768px)
// -------------------------------------------------------------
function MobileHorizontalRoadmap({
  milestones,
}: {
  milestones: MilestoneItem[];
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, clientWidth } = scrollContainerRef.current;
    const index = Math.round(scrollLeft / (clientWidth * 0.85));
    setActiveIndex(Math.min(milestones.length - 1, Math.max(0, index)));
  };

  const scrollPrev = () => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({
      left: -320,
      behavior: "smooth",
    });
  };

  const scrollNext = () => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({
      left: 320,
      behavior: "smooth",
    });
  };

  const progressPercent = ((activeIndex + 1) / milestones.length) * 100;

  return (
    <div className="w-full py-12 px-4 space-y-6">
      {/* Mobile Header */}
      <div className="flex flex-col gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#B9FF66]">
            {"// 05 · JOURNEY & EVOLUTION"}
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#B9FF66] animate-pulse" />
        </div>
        <h2 className="text-3xl font-black tracking-tight text-white uppercase font-mono">
          MILESTONES & ROADMAP
        </h2>
        <p className="text-xs text-zinc-400 font-sans">
          From first builds to ambitious products — the journey so far.
        </p>

        {/* Controls Strip: Active indicator and Next/Prev buttons */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="rounded-md border border-white/10 bg-[#161616] px-2.5 py-1 font-bold text-[#B9FF66]">
              {String(activeIndex + 1).padStart(2, "0")} / {String(milestones.length).padStart(2, "0")}
            </span>
            <span className="text-zinc-500 text-[11px]">SWIPE TO EXPLORE</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={scrollPrev}
              disabled={activeIndex === 0}
              aria-label="Previous milestone"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#141414] text-zinc-300 hover:border-[#B9FF66] hover:text-[#B9FF66] transition-colors disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={scrollNext}
              disabled={activeIndex === milestones.length - 1}
              aria-label="Next milestone"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#141414] text-zinc-300 hover:border-[#B9FF66] hover:text-[#B9FF66] transition-colors disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-1">
          <div
            className="h-full bg-[#B9FF66] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Swipeable Track */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none py-2 -mx-4 px-4"
        style={{ scrollbarWidth: "none" }}
      >
        {milestones.map((milestone, idx) => {
          const isFeatured = !!milestone.featured;
          const isActive = activeIndex === idx;

          return (
            <div
              key={milestone.id}
              className={`${CARD_TOKENS.mobileWidth} ${CARD_TOKENS.mobileHeight} shrink-0 snap-center flex flex-col box-border`}
            >
              {/* Spine Node for Mobile */}
              <div className="flex items-center gap-2 mb-2 font-mono text-[11px] text-zinc-500 shrink-0">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    isFeatured
                      ? "bg-[#B9FF66] animate-pulse"
                      : isActive
                      ? "bg-[#B9FF66]"
                      : "bg-white/30"
                  }`}
                />
                <span>STEP {idx + 1} OF {milestones.length}</span>
              </div>

              {/* Standardized Card Container */}
              <div
                className={`relative flex flex-col flex-1 ${CARD_TOKENS.borderRadius} ${CARD_TOKENS.borderWidth} ${CARD_TOKENS.mobilePadding} box-border transition-all overflow-hidden ${
                  isFeatured
                    ? "border-[#B9FF66]/50 bg-gradient-to-b from-[#161616] to-[#0e0e0e] shadow-[0_0_20px_rgba(185,255,102,0.1)]"
                    : "border-white/10 bg-[#111111]"
                }`}
              >
                {/* 1. Header */}
                <div className="flex items-center justify-between gap-2 shrink-0">
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase shrink-0 ${
                      isFeatured
                        ? "bg-[#B9FF66] text-[#080808]"
                        : "border border-white/10 bg-[#181818] text-white"
                    }`}
                  >
                    {milestone.period}
                  </span>

                  <div className="flex items-center gap-2 shrink-0">
                    {isFeatured && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#B9FF66]/40 bg-[#B9FF66]/10 px-2 py-0.5 font-mono text-[10px] font-bold text-[#B9FF66]">
                        <Sparkles className="h-3 w-3" />
                        <span>HIGHLIGHT</span>
                      </span>
                    )}
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 bg-[#171717]">
                      {getMilestoneIcon(milestone.type, isFeatured)}
                    </div>
                  </div>
                </div>

                {/* 2. Optional Badges Row */}
                <div className="flex items-center gap-1.5 h-5 mt-2 shrink-0 overflow-hidden">
                  {milestone.achievement && (
                    <span className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-300 truncate">
                      <Award className="h-2.5 w-2.5 shrink-0" />
                      <span className="truncate">{milestone.achievement}</span>
                    </span>
                  )}
                  {milestone.status && (
                    <span className="rounded-full border border-[#38BDF8]/30 bg-[#38BDF8]/10 px-2 py-0.5 font-mono text-[10px] font-medium text-[#38BDF8] truncate">
                      {milestone.status}
                    </span>
                  )}
                </div>

                {/* 3. Title */}
                <div className="mt-2.5 min-h-[48px] flex items-start shrink-0">
                  <h3 className="text-lg font-bold text-white leading-snug line-clamp-2">
                    {milestone.title}
                  </h3>
                </div>

                {/* 4. Description */}
                <div className="mt-1.5 flex-1 min-h-[70px] overflow-hidden">
                  <p className="text-xs leading-relaxed text-zinc-300 font-sans line-clamp-3">
                    {milestone.description}
                  </p>
                </div>

                {/* 5. Divider */}
                <div className="w-full h-px bg-white/10 my-2.5 shrink-0" />

                {/* 6. Tags */}
                <div className="flex flex-wrap gap-1 min-h-[42px] items-start shrink-0">
                  {milestone.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// REDUCED MOTION TIMELINE (ACCESSIBLE STATIC HORIZONTAL TRACK)
// -------------------------------------------------------------
function ReducedMotionRoadmap({
  milestones,
}: {
  milestones: MilestoneItem[];
}) {
  return (
    <div className="w-full py-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto space-y-8">
      <div className="border-b border-white/10 pb-5">
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#B9FF66]">
          {"// 05 · JOURNEY & EVOLUTION"}
        </span>
        <h2 className="mt-2 text-3xl sm:text-5xl font-black tracking-tight text-white uppercase font-mono">
          MILESTONES & ROADMAP
        </h2>
        <p className="mt-1 text-sm text-zinc-400 font-sans">
          From first builds to ambitious products — the journey so far.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {milestones.map((milestone) => (
          <div
            key={milestone.id}
            className={`flex flex-col h-[380px] rounded-2xl border p-6 box-border ${
              milestone.featured
                ? "border-[#B9FF66]/50 bg-[#141414]"
                : "border-white/10 bg-[#111111]"
            }`}
          >
            <div className="flex items-center justify-between mb-3 shrink-0">
              <span className="font-mono text-xs font-bold text-[#B9FF66]">
                {milestone.period}
              </span>
              {getMilestoneIcon(milestone.type, milestone.featured)}
            </div>
            <h3 className="text-xl font-bold text-white mb-2 shrink-0 line-clamp-2">{milestone.title}</h3>
            <p className="text-sm text-zinc-300 mb-4 flex-1 line-clamp-4">{milestone.description}</p>
            <div className="flex flex-wrap gap-1 border-t border-white/5 pt-3 shrink-0 mt-auto">
              {milestone.tags.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="rounded bg-white/5 px-2 py-0.5 font-mono text-[11px] text-zinc-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// MAIN COMPONENT
// -------------------------------------------------------------
export function MilestonesRoadmap({
  milestones = milestonesData,
  className = "",
}: MilestonesRoadmapProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className={`w-full ${className}`}>
        <ReducedMotionRoadmap milestones={milestones} />
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Desktop & Tablet: Sticky scroll-driven horizontal timeline */}
      <div className="hidden md:block">
        <DesktopHorizontalRoadmap milestones={milestones} />
      </div>

      {/* Mobile: Touch-friendly horizontal carousel with visible controls */}
      <div className="block md:hidden">
        <MobileHorizontalRoadmap milestones={milestones} />
      </div>
    </div>
  );
}
