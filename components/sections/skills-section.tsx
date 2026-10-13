"use client";

import React, { useState } from "react";
import { portfolioData } from "@/data/portfolio";
import { LogoCloud4 } from "@/components/ui/logo-cloud-4";


export function SkillsSection() {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number>(0);
  const categories = portfolioData.skillCategories;
  const currentCategory = categories[activeCategoryIndex];

  return (
    <section id="stack" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-12 border-b border-white/10 scroll-mt-24">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-12">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#B9FF66]">
            {"// 03 · WEAPONRY & CAPABILITIES"}
          </span>
          <h2 className="mt-2 text-3xl sm:text-5xl font-black tracking-tight text-white uppercase">
            SKILLS & TECHNOLOGY STACK
          </h2>
          <div className="mt-2 h-1 w-12 bg-[#B9FF66]" />
        </div>

        {/* Dynamic LogoCloud Marquee */}
        <div className="mb-16">
          <LogoCloud4
            technologies={portfolioData.technologiesMarquee}
            title="ACTIVE DEVELOPMENT ECOSYSTEM & TOOLING"
          />
        </div>

        {/* Categorized Interactive Skill Matrix */}
        <div className="rounded-2xl border border-white/10 bg-[#111111] p-6 sm:p-8 shadow-xl">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-6 mb-8">
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCategoryIndex(idx)}
                className={`rounded-lg px-4 py-2 font-mono text-xs transition-all ${
                  activeCategoryIndex === idx
                    ? "bg-[#B9FF66] text-[#080808] font-bold shadow-[0_0_12px_rgba(185,255,102,0.3)]"
                    : "border border-white/10 bg-[#171717] text-zinc-400 hover:text-white hover:border-white/20"
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>

          {/* Active Category Header */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white tracking-tight">
              {currentCategory.title}
            </h3>
            <p className="mt-1 text-xs text-[#A1A1AA] font-mono">
              {currentCategory.description}
            </p>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentCategory.skills.map((skill, sIdx) => {
              const levelColor =
                skill.level === "Core"
                  ? "text-[#B9FF66] bg-[#B9FF66]/10 border-[#B9FF66]/30"
                  : skill.level === "Advanced"
                  ? "text-[#38BDF8] bg-[#38BDF8]/10 border-[#38BDF8]/30"
                  : "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30";

              return (
                <div
                  key={sIdx}
                  tabIndex={0}
                  className="group rounded-xl border border-white/5 bg-[#171717] p-4 transition-all hover:border-[#B9FF66]/40 hover:bg-[#1a1a1a] focus:outline-none focus:ring-1 focus:ring-[#B9FF66]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-semibold text-white group-hover:text-[#B9FF66] transition-colors">
                      {skill.name}
                    </span>
                    <span className={`rounded px-2 py-0.5 text-[10px] font-mono border ${levelColor}`}>
                      {skill.level}
                    </span>
                  </div>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed font-sans">
                    {skill.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Honest Skill Level Legend */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs font-mono text-zinc-400">
            <span className="text-zinc-500 uppercase tracking-wider">LEVEL KEY:</span>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B9FF66]" />
              <span>Core (Daily production driver)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#38BDF8]" />
              <span>Advanced (Production proficient)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
              <span>Exploring (Active experimentation)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
