"use client";

import React, { useState } from "react";
import { GlassCards } from "@/components/ui/glass-cards";
import { ABOUT_STORY_CARDS } from "@/data/about-story";

export function AboutSection() {
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  return (
    <section
      id="about"
      className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-12 border-b border-white/10 scroll-mt-24 overflow-visible"
    >
      {/* Background Subtle Gradient & Grid Texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="mx-auto max-w-7xl relative z-10">
        {/* Two-Column Editorial Layout: Sticky Left Intro + Scroll-Driven Right Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-20 items-start">
          {/* LEFT COLUMN — Persistent About Introduction (Sticky on desktop) */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-28 xl:top-32 self-start space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#B9FF66]">
                {"// 01 — THE STORY BEHIND SARANSH.EXE"}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#B9FF66] animate-pulse" />
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase font-mono leading-none">
              ABOUT SARANSH
            </h2>

            <div className="h-1 w-12 bg-[#B9FF66]" />

            <p className="text-sm sm:text-base text-zinc-400 font-sans leading-relaxed pt-1">
              Computer science student, vibecoder, and product builder turning ideas into systems. Scroll through the story to explore the journey.
            </p>

            {/* Story Stage Track (Sticky Left Column Progress Indicator) */}
            <div className="pt-6 border-t border-white/10 hidden lg:block space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-500 uppercase tracking-wider">
                  STORY STAGE
                </span>
                <span className="text-[#B9FF66] font-bold">
                  0{activeCardIndex + 1} / 0{ABOUT_STORY_CARDS.length}
                </span>
              </div>

              {/* Progress Stage Bars */}
              <div className="grid grid-cols-4 gap-2">
                {ABOUT_STORY_CARDS.map((card, idx) => (
                  <div
                    key={card.id}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === activeCardIndex
                        ? "bg-[#B9FF66] shadow-[0_0_8px_rgba(185,255,102,0.7)]"
                        : idx < activeCardIndex
                        ? "bg-white/40"
                        : "bg-white/10"
                    }`}
                  />
                ))}
              </div>

              {/* Active Stage Subtitle */}
              <div className="font-mono text-xs text-zinc-300 pt-1 flex items-center gap-2">
                <span className="text-[#B9FF66]">&gt;</span>
                <span className="truncate">
                  {ABOUT_STORY_CARDS[activeCardIndex]?.eyebrow.replace(/^\d+\s*\/\s*/, "")}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — Scroll-Driven Story Cards */}
          <div className="lg:col-span-7 xl:col-span-8 w-full">
            <GlassCards onCardChange={setActiveCardIndex} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
