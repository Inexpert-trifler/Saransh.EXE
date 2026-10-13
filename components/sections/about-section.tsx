"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Terminal,
  Sparkles,
  Bot,
  Code2,
  Zap,
  Rocket,
  Flame,
} from "lucide-react";

interface LabItem {
  name: string;
  icon: React.ReactNode;
}

const LAB_ITEMS: LabItem[] = [
  {
    name: "AI agents",
    icon: <Bot className="h-4 w-4 text-[#B9FF66]" />,
  },
  {
    name: "Full-stack builds",
    icon: <Code2 className="h-4 w-4 text-[#B9FF66]" />,
  },
  {
    name: "Motion & UI",
    icon: <Zap className="h-4 w-4 text-[#B9FF66]" />,
  },
  {
    name: "Startup ideas",
    icon: <Rocket className="h-4 w-4 text-[#B9FF66]" />,
  },
];

interface PhilosophyItem {
  number: string;
  title: string;
  description: string;
}

const PHILOSOPHY_ITEMS: PhilosophyItem[] = [
  {
    number: "01",
    title: "Speed is a feature.",
    description: "Prototype fast. Iterate faster.",
  },
  {
    number: "02",
    title: "Pixels have personality.",
    description: "No soulless templates. Make every interaction count.",
  },
  {
    number: "03",
    title: "Ship > overthink.",
    description: "Build it, test it, learn, repeat.",
  },
  {
    number: "04",
    title: "AI is the co-pilot. I'm still driving.",
    description: "Use the tools. Understand the code. Own the result.",
  },
];

const INTEREST_TAGS = [
  "VibeCoding",
  "AIAgents",
  "CreativeDev",
  "Hackathons",
  "ProductBuilding",
  "MotionDesign",
  "FullStack",
];

export function AboutSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="about"
      className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-12 border-b border-white/10 scroll-mt-24"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="mb-16"
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#B9FF66]">
              {"// 01 — THE BUILDER BEHIND THE BUGS"}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#B9FF66] animate-pulse" />
          </div>
          <h2 className="mt-2 text-3xl sm:text-5xl font-black tracking-tight text-white uppercase font-mono">
            NOT HERE TO SHIP BORING.
          </h2>
          <p className="mt-1 text-sm sm:text-base text-zinc-400 font-sans">
            Ideas are cheap. Let&apos;s build weird things that work.
          </p>
          <div className="mt-3 h-1 w-12 bg-[#B9FF66]" />
        </motion.div>

        {/* Responsive Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Intro Copy, Lab Panel & Interest Tags */}
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.5, delay: prefersReducedMotion ? 0 : 0.1, ease: "easeOut" }}
            className="lg:col-span-7 space-y-6"
          >
            {/* Intro Heading */}
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug font-mono">
              I VIBE-CODE. I BREAK THINGS. I SHIP.
            </h3>

            {/* Intro Copy */}
            <div className="space-y-4 text-base text-[#A1A1AA] leading-relaxed font-sans">
              <p>
                I&apos;m a CS student obsessed with turning late-night ideas into real
                products. AI, code, motion, and interfaces that hit different —
                that&apos;s my playground.
              </p>
              <p>
                I build across the stack, experiment aggressively, and debug
                until the thing actually works.
              </p>
            </div>

            {/* Currently in My Lab Panel */}
            <div className="mt-8 rounded-xl border border-white/10 bg-[#111111] p-5 shadow-xl">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
                <Terminal className="h-4 w-4 text-[#B9FF66]" />
                <span className="font-mono text-xs font-bold text-white tracking-wider">
                  $ CURRENTLY IN MY LAB
                </span>
                <span className="ml-auto flex items-center gap-1 font-mono text-[10px] text-zinc-500">
                  <Flame className="h-3 w-3 text-[#B9FF66]" />
                  ACTIVE WORKSPACE
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                {LAB_ITEMS.map((item, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                    className="group flex items-center gap-3 rounded-lg border border-white/5 bg-[#171717] px-3.5 py-2.5 text-zinc-300 transition-all hover:border-[#B9FF66]/50 hover:bg-[#1c1c1c] hover:shadow-[0_0_16px_rgba(185,255,102,0.12)] cursor-default"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-[#121212] group-hover:border-[#B9FF66]/40 transition-colors">
                      {item.icon}
                    </div>
                    <span className="font-semibold text-white group-hover:text-[#B9FF66] transition-colors">
                      {item.name}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Interests Tags */}
            <div className="pt-4">
              <span className="font-mono text-xs text-zinc-500 uppercase tracking-wider block mb-3">
                CORE DOMAINS & INTERESTS:
              </span>
              <div className="flex flex-wrap gap-2">
                {INTEREST_TAGS.map((tag, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs text-zinc-300 hover:border-[#B9FF66] hover:text-[#B9FF66] hover:bg-[#B9FF66]/5 transition-all"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Engineering Philosophy & Engagement Panel */}
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.5, delay: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
            className="lg:col-span-5 space-y-4"
          >
            <div className="mb-4">
              <span className="font-mono text-xs text-zinc-500 uppercase tracking-wider">
                {"// WORKING PRINCIPLES"}
              </span>
              <h4 className="text-lg font-bold text-white mt-1 font-mono">
                ENGINEERING PHILOSOPHY
              </h4>
            </div>

            {/* 4 Philosophy Cards */}
            <div className="space-y-3">
              {PHILOSOPHY_ITEMS.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.35,
                    delay: prefersReducedMotion ? 0 : idx * 0.08,
                    ease: "easeOut",
                  }}
                  className="group rounded-xl border border-white/10 bg-[#111111] p-5 transition-all hover:border-[#B9FF66]/50 hover:bg-[#141414] hover:shadow-[0_0_20px_rgba(185,255,102,0.08)]"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h5 className="font-mono text-sm font-bold text-white group-hover:text-[#B9FF66] transition-colors">
                      {item.number}. {item.title}
                    </h5>
                    <Sparkles className="h-3.5 w-3.5 text-zinc-600 group-hover:text-[#B9FF66] transition-colors" />
                  </div>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed font-sans">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Engagement Panel */}
            <div className="rounded-xl border border-[#B9FF66]/30 bg-[#B9FF66]/5 p-5 mt-6 backdrop-blur-sm shadow-[0_0_20px_rgba(185,255,102,0.05)]">
              <div className="flex items-center gap-2 mb-2 font-mono text-xs font-bold text-[#B9FF66]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B9FF66] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B9FF66]" />
                </span>
                <span>OPEN TO BUILDING COOL STUFF</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                Hackathons, ambitious side projects, AI experiments, and people who
                actually build.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
