"use client";

import React from "react";
import { portfolioData } from "@/data/portfolio";
import { TestimonialsColumns1 } from "@/components/ui/testimonials-columns-1";

export function TestimonialsSection() {
  const { testimonials } = portfolioData;

  if (!testimonials.enabled) {
    return null;
  }

  return (
    <section id="testimonials" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-12 border-b border-white/10 scroll-mt-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#B9FF66]">
            {"// 06 · PEER PERSPECTIVES"}
          </span>
          <h2 className="mt-2 text-3xl sm:text-5xl font-black tracking-tight text-white uppercase">
            COLLABORATION VOICES
          </h2>
          <div className="mt-2 h-1 w-12 bg-[#B9FF66]" />
        </div>

        <TestimonialsColumns1
          testimonials={testimonials.items}
          enabled={testimonials.enabled}
          disclaimer={testimonials.disclaimer}
        />
      </div>
    </section>
  );
}
