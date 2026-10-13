"use client";

import React from "react";
import { MilestonesRoadmap } from "@/components/ui/milestones-roadmap";
import { milestonesData } from "@/data/milestones";

export function JourneySection() {
  return (
    <section
      id="journey"
      className="relative w-full border-b border-white/10 scroll-mt-20 overflow-visible"
    >
      <MilestonesRoadmap milestones={milestonesData} />
    </section>
  );
}
