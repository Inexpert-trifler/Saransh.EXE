"use client";

import React from "react";
import { GlyphMatrix } from "./glyph-matrix";
import { ArrowDownRight, ArrowUpRight, MapPin } from "lucide-react";
import { portfolioData } from "@/data/portfolio";
import { GlassCard } from "@/components/ui/glass-card";

export function MinimalistHero() {
  const { profile, contact } = portfolioData;

  return (
    <section id="hero" className="relative min-h-[92vh] flex flex-col justify-center overflow-hidden px-4 sm:px-6 lg:px-12 pt-28 pb-16 border-b border-white/10 scroll-mt-24">
      {/* Background GlyphMatrix layer */}
      <GlyphMatrix
        className="opacity-25"
        color="#B9FF66"
        cellSize={22}
        interval={45}
        mutationRate={0.04}
      />

      {/* Subtle radial glow in the corner */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 right-5 sm:right-20 h-[380px] w-[380px] rounded-full bg-[#B9FF66]/5 blur-[120px]"
      />

      <div className="relative z-10 mx-auto max-w-7xl w-full">
        {/* Top Eyebrow Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-[#111111]/80 px-3.5 py-1.5 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B9FF66] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B9FF66]" />
            </span>
            <span className="font-mono text-xs text-[#F5F5F5] font-medium">
              {profile.availability.status}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#A1A1AA]">
            <MapPin className="h-3.5 w-3.5 text-[#B9FF66]" />
            <span>{profile.location}</span>
          </div>
        </div>

        {/* Main Headline & Hero Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8">
            <p className="font-mono text-xs sm:text-sm font-semibold tracking-widest text-[#B9FF66] uppercase mb-4">
              {"// "}{profile.eyebrow}
            </p>

            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.92] text-white uppercase select-none">
              <span className="block">{profile.headline}</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#B9FF66] via-white to-zinc-400">
                {profile.headlineAccent}
              </span>
            </h1>

            <div className="mt-6 max-w-2xl">
              <p className="text-base sm:text-lg text-[#A1A1AA] leading-relaxed font-sans">
                {profile.bioShort}
              </p>
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#work"
                className="group flex items-center gap-2.5 rounded-xl bg-[#B9FF66] px-6 py-3.5 text-sm font-bold text-[#080808] transition-all hover:bg-[#a3e635] hover:shadow-[0_0_24px_rgba(185,255,102,0.4)] focus:outline-none focus:ring-2 focus:ring-[#B9FF66]"
              >
                <span>EXPLORE MY WORK</span>
                <ArrowDownRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
              </a>

              <a
                href="#contact"
                className="group flex items-center gap-2.5 rounded-xl border border-white/15 bg-[#111111] px-6 py-3.5 text-sm font-mono text-[#F5F5F5] transition-all hover:border-[#B9FF66]/50 hover:bg-[#171717] hover:text-[#B9FF66] focus:outline-none focus:ring-2 focus:ring-[#B9FF66]"
              >
                <span>LET&apos;S TALK</span>
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>

          {/* Right Floating Interactive 3D Glass Card */}
          <div className="lg:col-span-4 w-full">
            <GlassCard
              title="SARANSH.EXE"
              badgeText="ONLINE"
              isOnline={true}
              items={[
                { label: "ENVIRONMENT", value: "Next.js 16 / React 19", accent: "white" },
                { label: "CORE FOCUS", value: "Full Stack & AI Agents", accent: "lime" },
                { label: "DESIGN LANGUAGE", value: "Digital Brutalism", accent: "cyan" },
                { label: "GITHUB", value: "@Inexpert-trifler", accent: "muted" },
                { label: "TIMEZONE", value: "IST (UTC+5:30)", accent: "white" },
              ]}
              socialLinks={[
                {
                  label: "GitHub",
                  href: "https://github.com/Inexpert-trifler",
                  icon: "github",
                  ariaLabel: "GitHub profile @Inexpert-trifler",
                },
                {
                  label: "LinkedIn",
                  href: "https://www.linkedin.com/in/saransh-yadav-b72643336/",
                  icon: "linkedin",
                  ariaLabel: "LinkedIn profile Saransh Yadav",
                },
                {
                  label: "Email",
                  href: `mailto:${contact.email}`,
                  icon: "mail",
                  ariaLabel: `Send direct transmission to ${contact.email}`,
                },
              ]}
              actionLabel="VIEW PROFILE"
              actionHref="#about"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
