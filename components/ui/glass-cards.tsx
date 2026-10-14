"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ABOUT_STORY_CARDS, AboutStoryCard } from "@/data/about-story";
import {
  Terminal,
  Sparkles,
  ArrowUpRight,
  Cpu,
  Flame,
  Music,
  Coffee,
  Users2,
  Lightbulb,
} from "lucide-react";

interface GlassCardsProps {
  cards?: AboutStoryCard[];
  className?: string;
  onCardChange?: (index: number) => void;
}

export function GlassCards({
  cards = ABOUT_STORY_CARDS,
  className = "",
  onCardChange,
}: GlassCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardContentRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      // Active card tracker for left column indicator across all screen sizes
      cardRefs.current.forEach((cardEl, idx) => {
        if (!cardEl) return;
        ScrollTrigger.create({
          trigger: cardEl,
          start: "top 45%",
          end: "bottom 45%",
          onEnter: () => onCardChange?.(idx),
          onEnterBack: () => onCardChange?.(idx),
        });
      });

      if (prefersReducedMotion) {
        // Plain static stacked layout without transform animations
        return;
      }

      const mm = gsap.matchMedia();

      // Desktop & Tablet (>= 768px): full GSAP scroll-stacking
      mm.add("(min-width: 768px)", () => {
        cardRefs.current.forEach((cardEl, idx) => {
          const contentEl = cardContentRefs.current[idx];
          if (!cardEl || !contentEl) return;

          const totalCards = cards.length;
          // Target scale for cards as they recede
          const targetScale = 1 - (totalCards - 1 - idx) * 0.035;
          const targetOpacity = 0.55 + idx * 0.12;

          gsap.set(contentEl, {
            scale: 1,
            opacity: 1,
            transformOrigin: "center top",
          });

          // Only cards before the final card need to scale and dim down as subsequent cards scroll in
          if (idx < totalCards - 1) {
            ScrollTrigger.create({
              trigger: cardEl,
              start: "top 18%",
              end: "bottom 18%",
              endTrigger: cardRefs.current[idx + 1] || undefined,
              scrub: 0.5,
              onUpdate: (self) => {
                const p = self.progress;
                const scaleVal = gsap.utils.interpolate(1, targetScale, p);
                const opacityVal = gsap.utils.interpolate(1, targetOpacity, p);

                gsap.set(contentEl, {
                  scale: Math.max(scaleVal, targetScale),
                  opacity: Math.max(opacityVal, targetOpacity),
                  transformOrigin: "center top",
                });
              },
            });
          }
        });
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [cards, onCardChange]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      data-testid="gsap-stacked-cards"
    >
      {cards.map((card, index) => {
        const color = card.accentColor;
        const colorDim = color.replace(/[\d.]+\)$/, "0.45)");
        const colorSoft = color.replace(/[\d.]+\)$/, "0.15)");

        return (
          <div
            key={card.id}
            ref={(el) => {
              cardRefs.current[index] = el;
            }}
            className="relative md:sticky md:top-24 lg:top-28 w-full flex flex-col justify-start min-h-auto md:min-h-[70vh] lg:min-h-[76vh] py-3 sm:py-5 mb-8 md:mb-0"
            style={{
              zIndex: index + 1,
            }}
          >
            {/* The Animated Glass Card Body */}
            <div
              ref={(el) => {
                cardContentRefs.current[index] = el;
              }}
              className="relative w-full rounded-[24px] sm:rounded-[28px] p-[1.5px] isolate will-change-transform transition-shadow duration-300 shadow-[0_16px_40px_rgba(0,0,0,0.6)]"
              style={{
                top: `calc(${index * 12}px)`,
              }}
            >
              {/* Electric Gradient Border */}
              <div
                className="absolute inset-0 rounded-[24px] sm:rounded-[28px] pointer-events-none -z-10"
                style={{
                  background: `conic-gradient(
                    from 0deg,
                    transparent 0deg,
                    ${color} 60deg,
                    ${colorDim} 120deg,
                    transparent 180deg,
                    ${colorSoft} 240deg,
                    transparent 360deg
                  )`,
                }}
              />

              {/* Inner Translucent Frosted Glass Card */}
              <div
                className="relative w-full rounded-[23px] sm:rounded-[27px] overflow-hidden p-6 sm:p-9 md:p-11 flex flex-col justify-between"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(17, 18, 22, 0.88) 0%, rgba(10, 10, 12, 0.94) 100%)",
                  backdropFilter: "blur(24px) saturate(180%)",
                  WebkitBackdropFilter: "blur(24px) saturate(180%)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  boxShadow: `
                    0 8px 32px rgba(0, 0, 0, 0.5),
                    inset 0 1px 0 rgba(255, 255, 255, 0.22),
                    inset 0 -1px 0 rgba(255, 255, 255, 0.05)
                  `,
                }}
              >
                {/* Top Gloss Sheen Overlay */}
                <div
                  aria-hidden="true"
                  className="absolute top-0 left-0 right-0 h-[48%] pointer-events-none rounded-t-[23px] sm:rounded-t-[27px]"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 50%, transparent 100%)",
                  }}
                />

                {/* Top Rim Light Accent */}
                <div
                  aria-hidden="true"
                  className="absolute top-[6px] left-[12px] right-[12px] h-[1px] pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(185, 255, 102, 0.4) 30%, rgba(255, 255, 255, 0.7) 50%, rgba(185, 255, 102, 0.4) 70%, transparent 100%)",
                  }}
                />

                {/* Left Edge Subtle Reflection */}
                <div
                  aria-hidden="true"
                  className="absolute top-0 left-0 w-[1px] h-full pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 60%)",
                  }}
                />

                {/* Starlight Texture Background */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none opacity-40 rounded-[23px] sm:rounded-[27px]"
                  style={{
                    backgroundImage: `
                      radial-gradient(circle at 15% 25%, rgba(255,255,255,0.12) 1px, transparent 2px),
                      radial-gradient(circle at 85% 65%, rgba(185,255,102,0.15) 1px, transparent 2px),
                      radial-gradient(circle at 45% 85%, rgba(255,255,255,0.08) 1px, transparent 2px)
                    `,
                    backgroundSize: "36px 36px, 28px 28px, 42px 42px",
                  }}
                />

                {/* CARD CONTENT LAYER */}
                <div className="relative z-10 space-y-6 sm:space-y-8">
                  {/* Eyebrow & Index Top Row */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#B9FF66] animate-pulse" />
                      <span className="font-mono text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#B9FF66]">
                        {card.eyebrow}
                      </span>
                    </div>

                    <span className="font-mono text-xs sm:text-sm font-bold tracking-widest text-zinc-400">
                      {card.index}
                    </span>
                  </div>

                  {/* Title & Body Layout */}
                  <div className="space-y-3">
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight uppercase leading-tight font-mono">
                      {card.title}
                    </h3>
                    <p className="text-sm sm:text-base md:text-lg text-[#A1A1AA] leading-relaxed max-w-2xl font-sans">
                      {card.content}
                    </p>
                  </div>

                  {/* CARD 01 CUSTOM VISUAL: Terminal & Developer Tags */}
                  {card.id === "card-01-who-i-am" && (
                    <div className="space-y-4 pt-2">
                      {/* Terminal Visual */}
                      <div className="rounded-xl border border-white/10 bg-[#0c0d10] p-4 sm:p-5 font-mono text-xs text-zinc-300 shadow-inner">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3 text-[11px] text-zinc-500">
                          <div className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                            <span className="ml-2 text-zinc-400">saransh@mbp: ~/identity</span>
                          </div>
                          <span className="text-[#B9FF66]/80 flex items-center gap-1">
                            <Terminal className="h-3 w-3" />
                            <span>zsh</span>
                          </span>
                        </div>

                        <div className="space-y-1.5 text-zinc-300 leading-relaxed">
                          <p>
                            <span className="text-[#B9FF66]">$</span> whoami
                          </p>
                          <p className="text-zinc-400 pl-4">
                            &gt; Saransh Yadav — Computer Science Student &amp; Creative Developer
                          </p>
                          <p>
                            <span className="text-[#B9FF66]">$</span> status
                          </p>
                          <p className="text-zinc-400 pl-4">
                            &gt; Building, vibecoding, and turning late-night ideas into reality
                          </p>
                          <p className="flex items-center gap-1">
                            <span className="text-[#B9FF66]">$</span>
                            <span className="inline-block h-3.5 w-1.5 bg-[#B9FF66] animate-pulse" />
                          </p>
                        </div>
                      </div>

                      {/* Small Tags */}
                      {card.tags && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {card.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] sm:text-xs text-zinc-300 tracking-wide hover:border-[#B9FF66] hover:text-[#B9FF66] transition-colors"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* CARD 02 CUSTOM VISUAL: Compact Lab Chips & Architectural Node Grid */}
                  {card.id === "card-02-what-i-build" && (
                    <div className="space-y-5 pt-2">
                      {/* Compact Interactive Chips */}
                      {card.chips && (
                        <div className="flex flex-wrap gap-2 sm:gap-2.5">
                          {card.chips.map((chip) => (
                            <div
                              key={chip}
                              className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#16161c] px-3.5 py-2 font-mono text-xs text-white hover:border-[#38BDF8] hover:bg-[#38BDF8]/10 transition-all cursor-default shadow-sm"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-[#38BDF8]" />
                              <span>{chip}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Architecture Interconnection Grid */}
                      <div className="rounded-xl border border-white/10 bg-[#0e0f14] p-4 sm:p-5 font-mono text-xs">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Cpu className="h-3.5 w-3.5 text-[#38BDF8]" />
                            <span>SYSTEM ARCHITECTURE TOPOLOGY</span>
                          </span>
                          <span className="text-[10px] text-[#B9FF66] bg-[#B9FF66]/10 px-2 py-0.5 rounded font-bold">
                            ALL NODES CONNECTED
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="rounded-lg border border-white/5 bg-[#14151b] p-3 text-center space-y-1">
                            <span className="text-zinc-500 text-[10px] block">CLIENT & MOTION</span>
                            <span className="font-bold text-white block">React 19 · Next.js</span>
                            <span className="text-[10px] text-[#38BDF8]">Tailwind · GSAP</span>
                          </div>

                          <div className="rounded-lg border border-white/5 bg-[#14151b] p-3 text-center space-y-1">
                            <span className="text-zinc-500 text-[10px] block">INTELLIGENCE</span>
                            <span className="font-bold text-[#B9FF66] block">AI Agents &amp; APIs</span>
                            <span className="text-[10px] text-zinc-400">Gemini · LangChain</span>
                          </div>

                          <div className="rounded-lg border border-white/5 bg-[#14151b] p-3 text-center space-y-1">
                            <span className="text-zinc-500 text-[10px] block">SERVICES & DATA</span>
                            <span className="font-bold text-white block">Node · Python</span>
                            <span className="text-[10px] text-sky-300">FastAPI · MongoDB</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CARD 03 CUSTOM VISUAL: Floating Curiosity Statements & Matrix */}
                  {card.id === "card-03-what-makes-me-curious" && (
                    <div className="space-y-4 pt-2">
                      {/* Short Statements Rows */}
                      {card.statements && (
                        <div className="grid grid-cols-1 gap-2.5">
                          {card.statements.map((stmt, idx) => (
                            <div
                              key={idx}
                              className="group flex items-center gap-3 rounded-xl border border-white/10 bg-[#14141a] px-4 py-3 text-xs sm:text-sm text-zinc-200 transition-all hover:border-[#A855F7]/50 hover:bg-[#1a1724]"
                            >
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#A855F7]/20 text-[#A855F7] flex-shrink-0">
                                <Sparkles className="h-3 w-3" />
                              </div>
                              <span className="font-sans font-medium text-zinc-100">
                                {stmt}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Hypothesis Loop Badge */}
                      <div className="flex items-center justify-between rounded-xl border border-purple-500/20 bg-purple-950/10 px-4 py-2.5 font-mono text-[11px] text-purple-200">
                        <span className="text-purple-400">EXPERIMENTATION LOOP:</span>
                        <span className="tracking-wider">
                          WHAT IF? <span className="text-purple-400">→</span> CODE{" "}
                          <span className="text-purple-400">→</span> TEST{" "}
                          <span className="text-purple-400">→</span> SHIP
                        </span>
                      </div>
                    </div>
                  )}

                  {/* CARD 04 CUSTOM VISUAL: How I Work traits, Banner & Contact CTA */}
                  {(card.id === "card-04-how-i-work" ||
                    card.id === "card-04-life-outside-the-ide") && (
                    <div className="space-y-6 pt-2">
                      {/* Labels */}
                      {card.labels && (
                        <div className="flex flex-wrap gap-2 sm:gap-2.5">
                          {card.labels.map((label, idx) => (
                            <div
                              key={label}
                              className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#16171d] px-3.5 py-2 font-mono text-xs text-zinc-200 hover:border-[#B9FF66] hover:text-[#B9FF66] transition-colors"
                            >
                              {idx === 0 && <Cpu className="h-3.5 w-3.5 text-[#B9FF66]" />}
                              {idx === 1 && <Lightbulb className="h-3.5 w-3.5 text-amber-400" />}
                              {idx === 2 && <Terminal className="h-3.5 w-3.5 text-sky-400" />}
                              {idx === 3 && <Users2 className="h-3.5 w-3.5 text-[#B9FF66]" />}
                              {idx === 4 && <Flame className="h-3.5 w-3.5 text-orange-400" />}
                              <span>{label}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Closing Line & CTA Banner */}
                      <div className="rounded-2xl border border-[#B9FF66]/30 bg-[#B9FF66]/10 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_24px_rgba(185,255,102,0.12)]">
                        <div>
                          <span className="font-mono text-[10px] uppercase text-[#B9FF66] block mb-1 font-semibold tracking-wider">
                            {"// THE INVITATION"}
                          </span>
                          <h4 className="text-base sm:text-lg font-black text-white font-mono">
                            {card.closingLine}
                          </h4>
                        </div>

                        {card.cta && (
                          <a
                            href={card.cta.href}
                            className="flex items-center gap-2 rounded-xl bg-[#B9FF66] px-5 py-3 font-mono text-xs font-bold text-[#080808] hover:bg-[#a6ec54] transition-all shadow-[0_0_16px_rgba(185,255,102,0.35)] flex-shrink-0"
                          >
                            <span>{card.cta.actionText}</span>
                            <ArrowUpRight className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
