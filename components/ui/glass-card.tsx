"use client";

import React, { useRef, useState, useEffect } from "react";
import { Terminal, ArrowRight, Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/icons";
import { motion, useReducedMotion } from "motion/react";

import type { Variants } from "motion/react";

export interface GlassCardInfoItem {
  label: string;
  value: string;
  accent?: "lime" | "cyan" | "white" | "muted";
}

export interface GlassCardSocialLink {
  label: string;
  href: string;
  icon: "github" | "linkedin" | "mail";
  ariaLabel: string;
}

export interface GlassCardProps {
  title?: string;
  badgeText?: string;
  isOnline?: boolean;
  items?: GlassCardInfoItem[];
  socialLinks?: GlassCardSocialLink[];
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

const DEFAULT_ITEMS: GlassCardInfoItem[] = [
  { label: "ENVIRONMENT", value: "Next.js 16 / React 19", accent: "white" },
  { label: "CORE FOCUS", value: "Full Stack & AI Agents", accent: "lime" },
  { label: "DESIGN LANGUAGE", value: "Digital Brutalism", accent: "cyan" },
  { label: "GITHUB", value: "@Inexpert-trifler", accent: "muted" },
  { label: "TIMEZONE", value: "IST (UTC+5:30)", accent: "white" },
];

const DEFAULT_SOCIALS: GlassCardSocialLink[] = [
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
    href: "mailto:saransh@example.com",
    icon: "mail",
    ariaLabel: "Send direct transmission via email",
  },
];

export function GlassCard({
  title = "SARANSH.EXE",
  badgeText = "ONLINE",
  isOnline = true,
  items = DEFAULT_ITEMS,
  socialLinks = DEFAULT_SOCIALS,
  actionLabel = "VIEW PROFILE",
  actionHref = "#about",
  className = "",
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const isTouchDevice =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(hover: none)").matches;
    setIsTouch(isTouchDevice);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || isTouch || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Subtle 3D tilt capped at 3.5 degrees
    const rX = -((y - centerY) / centerY) * 3.5;
    const rY = ((x - centerX) / centerX) * 3.5;

    setRotateX(rX);
    setRotateY(rY);
    setGlarePos({
      x: Math.round((x / rect.width) * 100),
      y: Math.round((y / rect.height) * 100),
    });
  };

  const handleMouseEnter = () => {
    if (!isTouch) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setGlarePos({ x: 50, y: 50 });
  };

  const renderIcon = (type: "github" | "linkedin" | "mail") => {
    switch (type) {
      case "github":
        return <GithubIcon className="h-3.5 w-3.5" />;
      case "linkedin":
        return <LinkedinIcon className="h-3.5 w-3.5" />;
      case "mail":
        return <Mail className="h-3.5 w-3.5" />;
    }
  };

  const getAccentClass = (accent?: "lime" | "cyan" | "white" | "muted") => {
    switch (accent) {
      case "lime":
        return "text-[#B7FF59] font-semibold";
      case "cyan":
        return "text-[#38BDF8] font-semibold";
      case "muted":
        return "text-zinc-300 font-medium";
      case "white":
      default:
        return "text-white font-medium";
    }
  };

  // Entrance motion variants
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.05,
        delayChildren: 0.08,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 6 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <>
      <style>{`
        @keyframes orbitalClockwise {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbitalCounter {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
      `}</style>

      <motion.div
        initial={prefersReducedMotion ? false : "hidden"}
        whileInView={prefersReducedMotion ? undefined : "visible"}
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
        className={`relative w-full select-none ${className}`}
        style={{ perspective: "1000px" }}
      >
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="relative w-full rounded-2xl p-5 sm:p-6 transform-gpu overflow-hidden"
          style={{
            background: `
              radial-gradient(
                circle at ${85 + (rotateY * 0.7)}% ${12 - (rotateX * 0.7)}%,
                rgba(183, 255, 89, 0.12),
                transparent 38%
              ),
              linear-gradient(
                135deg,
                rgba(255, 255, 255, 0.065),
                rgba(255, 255, 255, 0.015) 45%,
                rgba(0, 0, 0, 0.22)
              ),
              rgba(10, 12, 10, 0.42)
            `,
            border: isHovered
              ? "1px solid rgba(183, 255, 89, 0.35)"
              : "1px solid rgba(255, 255, 255, 0.14)",
            backdropFilter: "blur(16px) saturate(130%)",
            WebkitBackdropFilter: "blur(16px) saturate(130%)",
            boxShadow: isHovered
              ? "inset 0 1px 0 rgba(255, 255, 255, 0.16), inset 1px 0 0 rgba(255, 255, 255, 0.06), 0 28px 70px rgba(0, 0, 0, 0.45), 0 0 24px -6px rgba(183, 255, 89, 0.15)"
              : "inset 0 1px 0 rgba(255, 255, 255, 0.12), inset 1px 0 0 rgba(255, 255, 255, 0.045), 0 24px 60px rgba(0, 0, 0, 0.35)",
            transformStyle: "preserve-3d",
            transform:
              !prefersReducedMotion && !isTouch && isHovered
                ? `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`
                : "rotateX(0deg) rotateY(0deg)",
            transition: isHovered
              ? "transform 0.12s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease, border-color 0.3s ease"
              : "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.5s ease, border-color 0.5s ease",
          }}
        >
          {/* Dynamic Specular Glare Overlay */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
            style={{
              opacity: isHovered ? 0.75 : 0.15,
              background: `radial-gradient(circle 260px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.08), rgba(183, 255, 89, 0.04) 35%, transparent 75%)`,
            }}
          />

          {/* Abstract Layered Orbital Glass Lens System in Upper-Right Corner */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 flex items-center justify-center select-none z-0"
          >
            {/* Ambient Corner Reflection */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#B7FF59]/12 via-[#B7FF59]/4 to-transparent blur-xl" />

            {/* Ring 1: Outer Dashed Orbit */}
            <div
              className="absolute h-40 w-40 rounded-full border border-dashed border-white/10"
              style={{
                animation: prefersReducedMotion ? "none" : "orbitalCounter 45s linear infinite",
              }}
            />

            {/* Ring 2: Middle Orbit with Traveling Glowing Satellite */}
            <div
              className="absolute h-30 w-30 rounded-full border border-white/12"
              style={{
                animation: prefersReducedMotion ? "none" : "orbitalClockwise 28s linear infinite",
              }}
            >
              {/* Orbiting Lime Satellite Beacon */}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-[#B7FF59] shadow-[0_0_10px_#B7FF59]" />
            </div>

            {/* Ring 3: Inner Lime Accent Ring */}
            <div
              className="absolute h-18 w-18 rounded-full border border-[#B7FF59]/25 bg-[radial-gradient(circle,rgba(183,255,89,0.06)_0%,transparent_70%)]"
              style={{
                animation: prefersReducedMotion ? "none" : "orbitalCounter 18s linear infinite",
              }}
            />

            {/* Ring 4: Core Glass Focal Point */}
            <div className="absolute h-8 w-8 rounded-full border border-white/20 bg-white/[0.04] backdrop-blur-sm" />
          </div>

          {/* Card Content Layer */}
          <div className="relative z-10">
            {/* A. Top Identity Header */}
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-between border-b border-white/10 pb-3 mb-3.5"
            >
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-[#B7FF59]" />
                <span className="font-mono text-xs sm:text-sm font-bold tracking-wider text-white">
                  {title}
                </span>
                {/* Small animated lime indicator beside identity */}
                <span className="h-1.5 w-1.5 rounded-full bg-[#B7FF59] animate-pulse" />
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-1.5 rounded-full border border-[#B7FF59]/30 bg-[#B7FF59]/10 px-2.5 py-0.5 font-mono text-[10px] sm:text-[11px] font-semibold text-[#B7FF59] shadow-[0_0_12px_rgba(183,255,89,0.15)] backdrop-blur-md">
                {isOnline && (
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B7FF59] opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#B7FF59]" />
                  </span>
                )}
                <span className="tracking-wider">{badgeText}</span>
              </div>
            </motion.div>

            {/* B. Main Identity Metadata */}
            <div className="space-y-1 sm:space-y-1.5">
              {items.map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="group/row flex items-center justify-between gap-3 py-1.5 px-2.5 -mx-2.5 rounded-lg transition-all duration-200 hover:bg-white/[0.04] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                >
                  <span className="font-mono text-[11px] sm:text-xs text-zinc-400 uppercase tracking-wider shrink-0 transition-colors group-hover/row:text-zinc-300">
                    {item.label}:
                  </span>
                  <span
                    className={`font-mono text-[11px] sm:text-xs tracking-tight text-right ${getAccentClass(
                      item.accent
                    )}`}
                  >
                    {item.value}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* C. Bottom Action Area */}
            <motion.div
              variants={itemVariants}
              className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between gap-3"
            >
              {/* Social Links Group (GitHub, LinkedIn, Email) */}
              <div className="flex items-center gap-2">
                {socialLinks.map((social, idx) => (
                  <a
                    key={idx}
                    href={social.href}
                    target={social.href.startsWith("http") ? "_blank" : undefined}
                    rel={social.href.startsWith("http") ? "noreferrer noopener" : undefined}
                    aria-label={social.ariaLabel}
                    title={social.label}
                    className="group relative flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-lg border border-white/12 bg-white/[0.04] text-zinc-300 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#B7FF59] hover:bg-[#B7FF59]/10 hover:text-[#B7FF59] hover:shadow-[0_0_14px_rgba(183,255,89,0.22)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B7FF59]"
                  >
                    <span className="transition-transform duration-200 group-hover:scale-110">
                      {renderIcon(social.icon)}
                    </span>
                  </a>
                ))}
              </div>

              {/* View Profile Action */}
              <a
                href={actionHref}
                className="group inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.04] px-3.5 py-1.5 font-mono text-xs font-semibold text-zinc-200 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#B7FF59]/50 hover:bg-[#B7FF59]/10 hover:text-[#B7FF59] hover:shadow-[0_0_16px_rgba(183,255,89,0.2)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B7FF59]"
              >
                <span>{actionLabel}</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#B7FF59] transition-transform duration-200 group-hover:translate-x-1" />
              </a>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default GlassCard;
