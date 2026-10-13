"use client";

import React from "react";
import { portfolioData } from "@/data/portfolio";
import { Trophy, Code2, Users, BookOpen, Sparkles } from "lucide-react";

export function AchievementsSection() {
  const { achievements } = portfolioData;

  const getIcon = (category: string) => {
    switch (category) {
      case "Hackathon":
        return <Trophy className="h-4 w-4 text-[#F59E0B]" />;
      case "Building":
        return <Code2 className="h-4 w-4 text-[#B9FF66]" />;
      case "Open Source":
        return <Sparkles className="h-4 w-4 text-[#38BDF8]" />;
      case "Community":
        return <Users className="h-4 w-4 text-[#A78BFA]" />;
      default:
        return <BookOpen className="h-4 w-4 text-zinc-400" />;
    }
  };

  return (
    <section id="achievements" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-12 border-b border-white/10 scroll-mt-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#B9FF66]">
            {"// 05 · PROOF OF WORK & ENDURANCE"}
          </span>
          <h2 className="mt-2 text-3xl sm:text-5xl font-black tracking-tight text-white uppercase">
            HIGHLIGHTS & MILESTONES
          </h2>
          <div className="mt-2 h-1 w-12 bg-[#B9FF66]" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {achievements.map((item, idx) => (
            <div
              key={idx}
              className="group rounded-2xl border border-white/10 bg-[#111111] p-6 transition-all hover:border-[#B9FF66]/40 hover:bg-[#141414] hover:shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#171717]">
                    {getIcon(item.category)}
                  </div>
                  <span className="font-mono text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                    {item.category}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                      {item.badge}
                    </span>
                  )}
                  <span className="font-mono text-xs text-zinc-500">{item.date}</span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-[#B9FF66] transition-colors">
                {item.title}
              </h3>

              <p className="mt-2 text-sm text-[#A1A1AA] leading-relaxed font-sans">
                {item.summary}
              </p>

              <div className="mt-4 pt-3 border-t border-white/5 text-xs text-zinc-400 font-sans">
                {item.details}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
