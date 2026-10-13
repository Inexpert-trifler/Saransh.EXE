"use client";

import React, { useSyncExternalStore } from "react";
import { motion } from "motion/react";

interface GlowingTextProps {
  text: string;
  className?: string;
  highlightWords?: string[];
  highlightColor?: string;
  delay?: number;
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

export function GlowingText({
  text,
  className = "",
  highlightWords = [],
  highlightColor = "#B9FF66",
  delay = 0,
}: GlowingTextProps) {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const words = text.split(" ");

  if (prefersReducedMotion) {
    return <span className={`inline-block ${className}`}>{text}</span>;
  }

  return (
    <span className={`inline-block ${className}`}>
      {words.map((word, wordIndex) => {
        const isHighlighted = highlightWords.some((hw) =>
          word.toLowerCase().includes(hw.toLowerCase())
        );

        return (
          <span key={wordIndex} className="inline-block mr-[0.28em] whitespace-nowrap">
            {word.split("").map((char, charIndex) => {
              const globalIndex = wordIndex * 6 + charIndex;
              return (
                <motion.span
                  key={charIndex}
                  initial={{ opacity: 0, filter: "blur(8px)", y: 6 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: delay + globalIndex * 0.015,
                    ease: [0.215, 0.61, 0.355, 1],
                  }}
                  className="inline-block transition-colors duration-200"
                  style={{
                    color: isHighlighted ? highlightColor : undefined,
                    textShadow: isHighlighted
                      ? `0 0 14px ${highlightColor}66`
                      : undefined,
                  }}
                >
                  {char}
                </motion.span>
              );
            })}
          </span>
        );
      })}
    </span>
  );
}
