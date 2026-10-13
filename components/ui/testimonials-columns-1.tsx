"use client";

import React, { useSyncExternalStore } from "react";
import { Testimonial } from "@/data/portfolio";
import { Quote, AlertCircle } from "lucide-react";

interface TestimonialsColumnsProps {
  testimonials: Testimonial[];
  enabled?: boolean;
  disclaimer?: string;
  className?: string;
}

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export function TestimonialsColumns1({
  testimonials,
  enabled = true,
  disclaimer = "SAMPLE ENTRIES FOR PREVIEW — REPLACE WITH REAL TESTIMONIALS",
  className = "",
}: TestimonialsColumnsProps) {
  useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  if (!enabled || testimonials.length === 0) {
    return null;
  }

  // Split into two balanced columns for smooth alternating scroll
  const firstCol = testimonials.slice(0, Math.ceil(testimonials.length / 2));
  const secondCol = testimonials.slice(Math.ceil(testimonials.length / 2));

  return (
    <div className={`relative overflow-hidden py-8 ${className}`}>
      {/* Disclaimer Banner */}
      <div className="mb-6 flex items-center gap-2 rounded-lg border border-amber-400/20 bg-amber-400/5 px-4 py-2.5 text-xs font-mono text-amber-300">
        <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
        <span>{disclaimer}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Column 1 */}
        <div className="space-y-6">
          {firstCol.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-xl border border-white/10 bg-[#111111] p-6 transition-all hover:border-[#B9FF66]/40 hover:bg-[#141414]"
            >
              <div className="flex items-center justify-between mb-4">
                <Quote className="h-5 w-5 text-[#B9FF66] opacity-70" />
                <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-mono text-zinc-400 uppercase">
                  {item.tag}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-zinc-300 italic">
                &ldquo;{item.content}&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="h-9 w-9 rounded-full bg-[#1e1e1e] border border-white/10 flex items-center justify-center font-mono font-bold text-xs text-[#B9FF66]">
                  {item.author.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{item.author}</h4>
                  <p className="text-xs text-[#A1A1AA]">
                    {item.role} · <span className="text-zinc-400">{item.company}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Column 2 */}
        <div className="space-y-6">
          {secondCol.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-xl border border-white/10 bg-[#111111] p-6 transition-all hover:border-[#B9FF66]/40 hover:bg-[#141414]"
            >
              <div className="flex items-center justify-between mb-4">
                <Quote className="h-5 w-5 text-[#B9FF66] opacity-70" />
                <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-mono text-zinc-400 uppercase">
                  {item.tag}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-zinc-300 italic">
                &ldquo;{item.content}&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="h-9 w-9 rounded-full bg-[#1e1e1e] border border-white/10 flex items-center justify-center font-mono font-bold text-xs text-[#38BDF8]">
                  {item.author.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{item.author}</h4>
                  <p className="text-xs text-[#A1A1AA]">
                    {item.role} · <span className="text-zinc-400">{item.company}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
