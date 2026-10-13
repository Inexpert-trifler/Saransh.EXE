"use client";

import React, { useState } from "react";
import useMeasure from "react-use-measure";
import { motion, useMotionValue, useAnimationFrame } from "motion/react";

interface InfiniteSliderProps {
  children: React.ReactNode;
  gap?: number;
  duration?: number;
  durationOnHover?: number;
  speed?: number;
  speedOnHover?: number;
  direction?: "left" | "right";
  reverse?: boolean;
  className?: string;
  pauseOnHover?: boolean;
}

export function InfiniteSlider({
  children,
  gap = 24,
  duration = 25,
  durationOnHover,
  speed,
  speedOnHover,
  direction = "left",
  reverse = false,
  className = "",
  pauseOnHover = true,
}: InfiniteSliderProps) {
  // Support both duration and speed props cleanly
  const effectiveDuration = speed ? 100 / speed : duration;
  const effectiveDurationOnHover = speedOnHover ? 100 / speedOnHover : durationOnHover;

  const [ref, { width }] = useMeasure();
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);

  // Compute speed in pixels per second
  const currentDuration = isHovered && effectiveDurationOnHover ? effectiveDurationOnHover : effectiveDuration;

  useAnimationFrame((_, delta) => {
    if (!width) return;

    if (isHovered && pauseOnHover && !effectiveDurationOnHover) {
      return;
    }

    const pixelsPerSecond = width / currentDuration;
    const moveBy = (pixelsPerSecond * delta) / 1000;
    const isMovingLeft = (direction === "left" && !reverse) || (direction === "right" && reverse);

    let nextX = x.get() + (isMovingLeft ? -moveBy : moveBy);

    if (isMovingLeft) {
      if (nextX <= -width - gap) {
        nextX = 0;
      }
    } else {
      if (nextX >= 0) {
        nextX = -width - gap;
      }
    }

    x.set(nextX);
  });

  return (
    <div
      className={`overflow-hidden select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="flex w-max"
        style={{
          x,
          gap: `${gap}px`,
        }}
      >
        {/* Original Content */}
        <div ref={ref} className="flex shrink-0 items-center" style={{ gap: `${gap}px` }}>
          {children}
        </div>

        {/* Cloned Set 1 for seamless loop */}
        <div
          aria-hidden="true"
          className="flex shrink-0 items-center pointer-events-none"
          style={{ gap: `${gap}px` }}
        >
          {children}
        </div>

        {/* Cloned Set 2 for wide viewports */}
        <div
          aria-hidden="true"
          className="flex shrink-0 items-center pointer-events-none"
          style={{ gap: `${gap}px` }}
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
}
