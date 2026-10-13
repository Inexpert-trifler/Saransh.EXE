"use client";

import React from "react";
import { InfiniteSlider } from "./infinite-slider";
import { ProgressiveBlur } from "./progressive-blur";
import { Cpu, Database, Flame, Globe, Layers, Server, Terminal, Zap } from "lucide-react";

interface TechItem {
  name: string;
  category: string;
}

interface LogoCloudProps {
  technologies: TechItem[];
  className?: string;
  title?: string;
}

// Icon mapper for tech items
function getTechIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("react") || lower.includes("next")) return <Globe className="h-4 w-4 text-[#B9FF66]" />;
  if (lower.includes("sql") || lower.includes("postgres") || lower.includes("db") || lower.includes("prisma"))
    return <Database className="h-4 w-4 text-[#38BDF8]" />;
  if (lower.includes("node") || lower.includes("fastapi") || lower.includes("server"))
    return <Server className="h-4 w-4 text-[#A78BFA]" />;
  if (lower.includes("ai") || lower.includes("claude") || lower.includes("gemini") || lower.includes("agent"))
    return <Zap className="h-4 w-4 text-[#F59E0B]" />;
  if (lower.includes("docker") || lower.includes("linux"))
    return <Cpu className="h-4 w-4 text-[#34D399]" />;
  if (lower.includes("motion") || lower.includes("gsap"))
    return <Flame className="h-4 w-4 text-[#F43F5E]" />;
  if (lower.includes("tailwind"))
    return <Layers className="h-4 w-4 text-[#38BDF8]" />;
  return <Terminal className="h-4 w-4 text-[#B9FF66]" />;
}

export function LogoCloud4({ technologies, className = "", title = "TECHNOLOGY STACK & ECOSYSTEM" }: LogoCloudProps) {
  return (
    <div className={`relative w-full overflow-hidden py-6 ${className}`}>
      {title && (
        <div className="mb-4 text-center">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[#A1A1AA]">
            {title}
          </span>
        </div>
      )}

      {/* Edge Blurs */}
      <ProgressiveBlur
        direction="left"
        backgroundColor="#080808"
        className="left-0 top-0 bottom-0 w-16 sm:w-28"
      />
      <ProgressiveBlur
        direction="right"
        backgroundColor="#080808"
        className="right-0 top-0 bottom-0 w-16 sm:w-28"
      />

      {/* Seamless Marquee */}
      <InfiniteSlider duration={24} durationOnHover={50} gap={16}>
        {technologies.map((tech, index) => (
          <div
            key={index}
            className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-[#111111] px-4 py-2.5 transition-all hover:border-[#B9FF66]/50 hover:bg-[#171717]"
          >
            {getTechIcon(tech.name)}
            <span className="font-mono text-xs font-medium text-[#F5F5F5]">{tech.name}</span>
            <span className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
              {tech.category}
            </span>
          </div>
        ))}
      </InfiniteSlider>
    </div>
  );
}
